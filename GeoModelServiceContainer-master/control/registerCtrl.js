/**
 * Created by Administrator on 4.19.
 */
var setting = require('../setting');
// var registerModel = require('../model/register');
// var registerModel = require('../model/register_n');
var registerModel = require('../model/dbSwitcher').register;
var ControlBase = require('./controlBase');
var RemoteControl = require('./remoteReqControl');
var SystemCtrl = require('./portalControl');
var os = require('os');
var exec = require('child_process').exec;
// var ModelSerModel = require('../model/modelService');
// var ModelSerModel = require('../model/modelService_n');
var ModelSerModel = require('../model/dbSwitcher').modelService;


var registerCtrl = function () { };
registerCtrl.__proto__ = ControlBase;
module.exports = registerCtrl;

//向门户注册：取数据、改数据、post数据、存数据
registerCtrl.register = function (getRegisterInfo, callback) {
    registerModel.getByWhere({}, function (err, data) {
        var rst;
        if (err) {
            console.log('err in getByWhere of register data!');
            rst = { status: -1 };
            return callback(JSON.stringify(rst));
        }
        else {
            var post2portal = function (registerInfo, isupdate) {
                //修改硬件环境上传信息
                var diskValue = registerInfo.hardware[0] + 0.01;
                var freesize = registerInfo.disksize[0] - 0.01;
                var totalsize = registerInfo.disksize[1] - 0.01;
                var hwInformation = {
                    disk: diskValue,
                    freesize: freesize,
                    totalsize: totalsize
                };
                var softwareInformation = {
                    cpus: registerInfo.software
                };

                var InfoFiled = {
                    name: registerInfo.hostname,
                    port: registerInfo.port,
                    system: os.type(),
                    software: softwareInformation,
                    hardware: hwInformation,
                    host: registerInfo.host,
                    physicalMemory: 0.0
                };
                //获取门户账号并登陆门户
                SystemCtrl.getPortalToken(function (err, token) {
                    if (err) {
                        rst = { status: 3 };
                        return callback(JSON.stringify(rst));
                    }
                    portal_uname = token['portal_uname'];
                    portal_pwd = token['portal_pwd'];
                    SystemCtrl.loginPortal(portal_uname, portal_pwd, function (err, result) {
                        if (err) {
                            rst = { status: 3 };
                            return callback(JSON.stringify(rst));
                        } else if (!result) {
                            rst = { status: 3 };
                            return callback(JSON.stringify(rst));
                        }
                        //向门户请求注册，利用门户ip
                        var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerNodeOperateServlet?computerNodeInfo=' + JSON.stringify(InfoFiled);
                        RemoteControl.postRequestJSON(url, function (err, msg) {
                            if (err) {
                                console.log('err in post by server!');
                                rst = { status: -1 };
                                return callback(JSON.stringify(rst));
                            }
                            else {
                                if (msg.result == 'suc') {
                                    //存
                                    registerInfo.registered = true;
                                    registerInfo.info = msg.info;
                                    //删除部分属性以更新数据库
                                    delete registerInfo.software;
                                    delete registerInfo.hardware;

                                    if (isupdate) {

                                        registerModel.update(registerInfo, function (err, data) {
                                            if (err) {
                                                console.log('err in update in mongoDB!');
                                                rst = { status: -1 };
                                                return callback(JSON.stringify(rst));
                                            }
                                        });
                                    }
                                    else {
                                        registerModel.save(registerInfo, function (err, data) {
                                            if (err) {
                                                console.log('err in update in mongoDB!');
                                            }

                                        });
                                    }
                                    return callback(JSON.stringify({ status: 1 }));
                                } else if (msg.result == 'error') {
                                    console.log('err in post by server!');
                                    rst = { status: -1 };
                                    return callback(JSON.stringify(rst));
                                }

                            }
                        });
                    })

                })

            };

            if (data.length) {
                registerInfo = data[0];
                if (registerInfo.registered == true) {
                    rst = { status: 2 };
                    return callback(JSON.stringify(rst));
                }
                else if (registerInfo.registered == false) {
                    //新建函数以帮助构建正确的registerInfo格式
                    var getSystemState = function (callback) {
                        var sysInfo = {
                            'cpus': os.cpus(),
                            'disk': ''
                        };
                        //windows disk
                        if (registerInfo.platform == 1) {
                            exec('wmic logicaldisk get caption,size,freespace', function (err, stdout, stderr) {
                                if (err) {
                                    console.log(err);
                                    return callback(err);
                                }
                                var array = stdout.split("\r\r\n");
                                array.pop();
                                array.pop();
                                array.shift();
                                var i, j;
                                for (i = 0; i < array.length; i++) {
                                    if (setting.dirname[0].toLocaleLowerCase() == array[i][0].toLocaleLowerCase()) {
                                        var space = array[i].split(" ");
                                        var ele = [];
                                        for (j = 0; j < space.length; j++) {
                                            if (+space[j]) {
                                                ele.push(+space[j]);
                                            }
                                        }
                                        sysInfo.disk = [Math.round((+ele[1] - ele[0]) / (+ele[1]) * 100), setting.dirname[0].toLocaleUpperCase()];
                                        sysInfo.disksize = [Math.round(ele[0]/1024/1024/1024),Math.round(ele[1]/1024/1024/1024)];
                                        // console.log(ele);
                                        break;
                                    }
                                }
                                // sysinfo.disk = array;
                                registerInfo.software = sysInfo.cpus;
                                registerInfo.hardware = sysInfo.disk;
                                registerInfo.disksize = sysInfo.disksize;
                                return callback(registerInfo, true);
                            });
                        } else if (registerInfo.platform == 2) {
                            var spawn = require('child_process').spawn,
                                free = spawn('df');

                            // 捕获标准输出并将其打印到控制台
                            free.stdout.on('data', function (data) {
                                // console.log('标准输出：\n' + data);
                                // console.log(data.toString());
                                var diskInfo = data.toString().split('\n');
                                var i;
                                for (i = 0; i < diskInfo.length; i++) {
                                    if (diskInfo[i][diskInfo[i].length - 1] == '/') {
                                        var percent = diskInfo[i].split(/\s+/);
                                        percent = percent[percent.length - 2];
                                        percent = percent.split('%')[0];
                                        sysInfo.disk = [+percent, '磁'];
                                        // console.log(sysinfo.disk);
                                        break;
                                    }
                                }
                                registerInfo.software = sysInfo.cpus;
                                registerInfo.hardware = sysInfo.disk;
                                registerInfo.disksize = sysInfo.disksize;
                                return callback(registerInfo, true);
                            });
                        }
                    };
                    getSystemState(post2portal);
                }
            }
            else {
                //数据库没存，要动态生成，存到数据库中
                getRegisterInfo(function (err, registerInfo) {
                    if (err) {
                        console.log('err in open in mongoDB!');
                    }
                    post2portal(registerInfo);
                });
            }
        }
    });
};

//从门户注销：取数据、改数据、post数据、存数据
registerCtrl.deregister = function (callback) {
    //取
    registerModel.getByWhere({}, function (err, data) {
        var rst;
        if (err) {
            console.log('err in getByWhere of register data!');
            rst = { status: -1 };
            return callback(JSON.stringify(rst));
        }
        else {
            //从门户注销函数
            var count = 0;
            var polling = function (index) {
                count++;
                return function (err, result) {
                    count--;
                    if (err) {
                        console.log(err);
                        rst = { status: -1 };
                        return callback(JSON.stringify(rst));
                    } else {
                        //模型数据库
                        console.log('success');
                    }
                    if (count == 0) {
                        //存
                        registerModel.update(registerInfo, function (err, data) {
                            if (err) {
                                console.log('err in update in mongoDB!');
                                rst = { status: -1 };
                                return callback(JSON.stringify(rst));
                            }
                            else {

                                rst = { status: 1 };
                                return callback(JSON.stringify(rst));
                            }
                        });
                    }
                }
            }
            var deregisterFromPortal = function (registerInfo) {
                //改
                registerInfo.registered = false;
                //var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerNodeServlet?ac=cancel&_id=' + registerInfo._id;
                var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerNodeOperateServlet?ComputableNodeId=' + registerInfo.info;
                RemoteControl.getRequestJSON(url, function (err, msg) {
                    if (err) {
                        console.log('err in post by server!');
                        rst = { status: -1 };
                        return callback(JSON.stringify(rst));
                    }
                    else {
                        if (msg.result != 'suc') {
                            return callback(JSON.stringify({ status: -1 }));
                        }
                        //获取数据库中所有已注册模型服务
                        ModelSerModel.getByRegisterStatus(true, function (err, ms) {
                            if (err) {
                                rst = { status: -1 };
                                return callback(JSON.stringify(rst));
                            }
                            if (ms.length === 0) {
                                //存
                                registerModel.update(registerInfo, function (err, data) {
                                    if (err) {
                                        console.log('err in update in mongoDB!');
                                        rst = { status: -1 };
                                        return callback(JSON.stringify(rst));
                                    }
                                    else {

                                        rst = { status: 1 };
                                        return callback(JSON.stringify(rst));
                                    }
                                });
                            } else {
                                for (let i = 0; i < data.length; i++) {
                                    let msdata = ms[i];
                                    msdata.ms_model.m_register = false;
                                    ModelSerModel.update(msdata,polling(i));
                                }
                            }
                        })

                    }
                });
            };
            if (data.length) {
                registerInfo = data[0];
                if (!registerInfo.registered) {
                    rst = { status: 2 };
                    return callback(JSON.stringify(rst));
                }
                else if (registerInfo.registered) {
                    //获取门户账号及密码
                    SystemCtrl.getPortalToken(function (err, token) {
                        if (err) {
                            rst = { status: 3 };
                            return callback(JSON.stringify(rst));
                        }
                        portal_uname = token['portal_uname'];
                        portal_pwd = token['portal_pwd'];
                        //登录门户
                        SystemCtrl.loginPortal(portal_uname, portal_pwd, function (err, result) {
                            if (err) {
                                rst = { status: 3 };
                                return callback(JSON.stringify(rst));
                            }
                            deregisterFromPortal(registerInfo);
                        })
                    })
                }
            }
            else {
                rst = { status: 2 };
                return callback(JSON.stringify(rst));
            }
        }
    });
};

//获取注册状态，0：未注册    1：已注册    -1：查询失败
registerCtrl.getState = function (callback) {
    registerModel.getByWhere({}, function (err, data) {
        if (err) {
            console.log('err in getByWhere of register data!');
            return callback(-1);
        }
        else {
            if (data.length) {
                registerInfo = data[0];
                if (registerInfo.registered) {
                    return callback(1);
                }
                else if (!registerInfo.registered) {
                    return callback(0);
                }
            }
            else {
                return callback(0);
            }
        }
    })
};