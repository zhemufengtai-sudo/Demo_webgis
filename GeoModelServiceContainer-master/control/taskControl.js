/**
 * Author : Fengyuan(Franklin) Zhang
 * Date : 2018/1/11
 * Description : Task control for load tasks and run them
 */

const request = require('request');
const ModelSerCtrl = require('./modelSerControl');
const DataCtrl = require('./geoDataControl');
const Setting = require('../setting');
const SysCtrl = require('./sysControl');
const Schedule = require('node-schedule');

var CommonMethod = require('../utils/commonMethod');

var TaskCtrl = function () {}

module.exports = TaskCtrl;

TaskCtrl.init = function () {
    global.tasks = [];
    console.log('Task timer started!');
    var rule = new Schedule.RecurrenceRule();
    if(Math.random() > 0.5) {
        rule.second = 0;
    } else {
        rule.second = 30;
    }
    const randomOffset = parseInt(Math.random() * 30);
    rule.second = (rule.second + randomOffset) % 60; 
    Schedule.scheduleJob(rule, ()=>{
        TaskCtrl.getTasks(function(err,status){
            if(err){
                console.log('Error in loading task, detail:');
                console.log(err);
                console.log('---Schedule jobs:' + new Date());
            }
            if(!status){
                //! TODO
                console.log('No registeration or local network version');
                console.log('---Schedule jobs:' + new Date());
            }else{
                //! TODO
                console.log('Get tasks success, start the calculate service');
                console.log('---Schedule jobs:' + new Date());
            }
        })
       rule.second = ( rule.second + 30 ) % 60;
    });
}

TaskCtrl.addTask = function (task) {
    // judge if exist the same task
    global.tasks.push(task);
    console.log("global tasks: ", global.tasks);
}

TaskCtrl.getByTaskID = function (taskid){
    for(let i = 0; i < global.tasks.length; i++){
        if(taskid == global.tasks[i].taskid){
            return global.tasks[i];
        }
    }
    return null;
}

TaskCtrl.remove = function (taskid) {
    for(let i = 0; i < global.tasks.length; i++){
        if(taskid == global.tasks[i].taskid){
            global.tasks.splice(i, 1);
            return 1;
        }
    }
    return 0;
}

TaskCtrl.loadTask = function (task, callback) {
    console.log("loadTask --- enter")
    var pid = task.pid;
    ModelSerCtrl.getByPID(pid, function (err, items) {
        if(err){
            return callback(err);
        }
        if(items.length == 0){
            return callback(new Error('No such model service!'));
        }
        var ms = items[0]; //default choose the first model service
        var dataInputs = task.inputs;

        var user = {
            u_name : 'TaskServer : [' + task.username + ']',
            u_ip : task.userip,
            u_type : 3
        };

        //! TODO Permission

        var dataCount = 0;
        var dataUploadCb = function (index) {
            dataCount++;
            return function (err, data) {
                dataCount--;
                if(err){
                    return callback(err);
                }
                dataInputs[index].DataId = data;
                if(dataCount == 0){
                    //! Download data again
                    for(let i = 0; i < dataInputs.length; i++){
                        if(!dataInputs[i].DataId){
                            dataCount ++;
                            DataCtrl.downloadByURL(dataInputs[i].Url, {gd_tag : dataInputs[i].Tag}, dataUploadCb(i));
                        }
                    }
                    
                    if(dataCount == 0){
                        ModelSerCtrl.run(ms._id, dataInputs, null, null, user, function (err, msr) {
                            if(err){
                                return callback(err);
                            }
                            task.msrid = msr._id;
                            return callback(null, msr._id);
                        });
                    }
                }
            }
        }
        
        for(let i = 0; i < dataInputs.length; i++){
            DataCtrl.downloadByURL(dataInputs[i].Url, {gd_tag : dataInputs[i].Tag}, dataUploadCb(i));
        }
    });
}

//! register in task server: type: 1 - local network; 2 - Internet
TaskCtrl.register = function (ip, port, type = 1, callback) {
    CommonMethod.getMac(function(err, mac){
        if(err){
            return callback(err);
        }
        var params = {
            mac : mac,
            port : Setting.port,
            type : type
        }
        request.post('http://' + ip + ':' + port.toString() + '/server', {
            form : params
        }, function (err, response) {
            if(err){
                return callback(err);
            }
            var resJson = JSON.parse(response.body);
            if(resJson['result'] == 'suc'){
                SysCtrl.setTaskServerInfo({
                    ip : ip,
                    port : port,
                    type : type
                },function(err, result){
                    if(err){
                        //! TODO Rollback
                        return callback(err);
                    }
                    //synchronize model services, no need callback invoke
                    TaskCtrl.synchronize(function(err,result){
                        if(err){
                            // console.log('synchronize model service error');
                        }
                        // console.log('synchronize model service success!');
                    });
                    return callback(null, true);
                });
            }
            else{
                return callback(null, false);
            }
        });
    });
}

// synchronize model services
TaskCtrl.synchronize = function (callback) {
    SysCtrl.getTaskServerInfo(function(err, server){
        console.log("Task: ", server)
        if(err){
            return callback(err);
        }
        if(server.ip == '0.0.0.0'){
            return callback(null, false);
        }
        ModelSerCtrl.getOnlineLocalModelSer(function (err, data) {
            if(err){
                return callback(err);
            }
            var pids = [];
            for(var i = 0; i < data.length; i++){
                pids.push(data[i]['ms_model']['p_id']);
            }
            CommonMethod.getMac(function(err, mac){
                if(err){
                    return callback(err);
                }
                request.put('http://' + server.ip + ':' + server.port.toString() + '/server', {form: {
                    mac : mac,
                    pids : JSON.stringify(pids)
                }}, function (err, response) {
                    if(err){
                        return callback(err);
                    }
                    var resJson = JSON.parse(response.body);
                    if(resJson.result == 'suc'){
                        return callback(null, true);
                    }
                    return callback(null, false);
                });
            });
        });
    });
}

// get tasks which need to be executed
TaskCtrl.getTasks = function(callback){
    SysCtrl.getTaskServerInfo(function(err,serverInfo){
        if(err){
            return callback(err);
        }
        //judge, if no register ,return 
        if(serverInfo.ip == '0.0.0.0'){
            return callback(null,false);
        }
        
        //! TODO Append server dymanic information
        SysCtrl.getState(function(err, status){
            var sum = 0;
            var idleSum = 0;
            for(var i = 0; i < status.cpus.length; i++){
                sum = sum + status.cpus[i].times.user + status.cpus[i].times.sys + status.cpus[i].times.nice + status.cpus[i].times.idle + status.cpus[i].times.irq;
                idleSum = idleSum + status.cpus[i].times.idle;
            }
            var cpuUsage = ((sum - idleSum)/sum).toString();
            var memtotal = Math.round(status.totalmem/1024/1024/1024).toString() + "G";
            var memfree = (status.freemem*1.00000/1024/1024/1024).toString() + "G";

            var server_Status = {
                "hostName" : status.hostname,
                "system" : status.systemtype,
                "cpuInfo" : cpuUsage,
                "totalMemory" : memtotal,
                "freeMemory" : memfree,
                "cpu_Core" : status.cpus.length,
                "diskAvailable" : status.disksize[0].toString() + "G",
                "diskAll" : status.disksize[1].toString() + "G",
                "runningIns" : global.app.modelInsColl.getInsCount()
            };
            if(serverInfo.type != 2){
                return callback(null,false);
            }
            else{
                CommonMethod.getMac(function(err, mac){
                    if(err){
                        return callback(err);
                    }
                    //send the request to the Task Server to get the task list which should be invoked 
                    var url = 'http://' + serverInfo.ip + ':' + serverInfo.port + '/task/inited/all' + '?mac=' + mac + '&status=' + encodeURI(JSON.stringify(server_Status));
                    request.get(url,function(err,response){
                        if(err){
                            return callback(err);
                        }
                        var resJson = JSON.parse(response.body);
                        if(resJson.result == 'suc'){
                            var tasks = resJson.data;

                            // handle the tasks
                            if(tasks.length == 0){
                                //indicate no task need to be invoked
                                return callback(null,true);
                            }else{
                                TaskCtrl.loadTasks(tasks,serverInfo,function(err,status){
                                    if(err){
                                        return callback(err);
                                    }
                                    if(!status){
                                        return callback(null,false);
                                    }
                                    return callback(null,true);
                                })
                            }
                        }else{
                            return callback(null,false);
                        }
                    })
                })
                
            }
        });
        
    })
}

//load all tasks
TaskCtrl.loadTasks = function(tasks, serverInfo, callback){
    const runningTaskIds = new Set(global.tasks.map(task => task.taskid));
    const newTasksToLoad = tasks.filter(task => !runningTaskIds.has(task._id));

    var availableSlots = Setting.maxins - app.modelInsColl.ModelInsArr.length;

    if (availableSlots <= 0) {
        return callback(null, true);
    }

    var tasksToRun = newTasksToLoad.splice(0, availableSlots);
    var size = tasksToRun.length;

    if (size === 0) {
        return callback(null,true);
    }

    tasksToRun.forEach(task => {
        const taskinfo = {
            taskid: task._id,
            pid: task.t_pid,
            userip: serverInfo.ip,
            type: task.t_type,
            username: task.t_user,
            inputs: task.t_inputs,
            msrid: '',
            ipport: '127.0.0.1:8060'
        };
        TaskCtrl.addTask(taskinfo);
    });

    var loadedCount = 0;
    var onAllTaskLoaded = function(err, status) {
        loadedCount++;
        if (err) {
            console.error("Error loading task:", err);
            // 发生错误时，将任务从列表中移除
            // 在 loadTaskAndReturn 中已经有移除逻辑，这里可以省略
        }
        if (loadedCount === size) {
            callback(null, true);
        }
    };

    for (let i = 0; i < size; i++) {
        const taskinfo = TaskCtrl.getByTaskID(tasksToRun[i]._id);
        TaskCtrl.loadTaskAndReturn(taskinfo, serverInfo, onAllTaskLoaded);
    }

    // var loadedCount = 0;
    // var onAllTaskLoaded = function(err, status) {
    //     loadedCount++;
    //     if (err) {
    //         console.error("Error loading task:", err);
    //     }
    //     if (loadedCount === size) {
    //         callback(null, true);
    //     }
    // };

    // for(var i = 0; i < size; i++){
    //     var taskinfo = {
    //         taskid: tasksToRun[i]._id,
    //         pid: tasksToRun[i].t_pid,
    //         userip: serverInfo.ip,
    //         type: tasksToRun[i].t_type,
    //         username: tasksToRun[i].t_user,
    //         inputs: tasksToRun[i].t_inputs,
    //         msrid: '',
    //         ipport: '127.0.0.1:8060'
    //     };
    //     TaskCtrl.loadTaskAndReturn(taskinfo, serverInfo, onAllTaskLoaded);
    // }
}

// load the task and return the record id to the task server
TaskCtrl.loadTaskAndReturn = function(task, serverInfo, callback){
    var ip = serverInfo.ip;
    var port = serverInfo.port;
    var task_id = task.taskid;
    CommonMethod.getMac(function(err, mac){
        if(err){
            return callback(err);
        }
        TaskCtrl.loadTask(task, function(err, result){
            if(err){
                console.log("加载待执行任务时出错：",err);
                // 发生错误时，将任务从列表中移除
                TaskCtrl.remove(task_id);
                var url = 'http://' + ip + ':' + port + '/task/' + task_id;
                var form = {
                    status: -1, // -1 represents the 'Error' Status
                    mac : mac,
                    t_node: "Error in downloading data!"
                };
                // console.log("Sending error info of task~");
                request.put(url,{
                    form: form
                }, function(err, response){
                    if(err){
                        // console.log("Error in send error info of task!");
                    }
                    else{
                        // console.log("Succeed in send error info of task : " + JSON.stringify(response.body));
                    }
                });
            
                return callback(err);
            }
            //return the record id to the task server
            var form = {
                status: 2, // 2 represents the Started Status
                msrid: result
            };
            var url = 'http://' + ip + ':' + port + '/task/' + task_id;
            request.put(url,{
                form: form
            }, function(err, response){
                if(err){
                    return callback(err);
                }
                var resJson = JSON.parse(response.body);
                if(resJson.result == 'suc'){
                    return callback(null,true);
                }
                return callback(null, false);
            });
        });
    });
}
