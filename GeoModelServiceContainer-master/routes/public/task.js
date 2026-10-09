/**
 * Author : Fengyuan(Franklin) Zhang
 * Date : 2019/1/11
 * Description : Task Router
 */

var TaskCtrl = require('../../control/taskControl');
var RouteBase = require('../routeBase');
var CommonMethod = require('../../utils/commonMethod');
var SysCtrl = require('../../control/sysControl');
var ManageServerCtl = require('../../control/manageServerControl');
var Setting = require('../../setting');

module.exports = function(app){
    //! New Task 
    app.route('/task')
        .post(function (req, res, next){
            var ip = CommonMethod.getIP(req);
            var fields = req.body;
            var taskinfo = {
                taskid : fields.taskid,
                pid : fields.pid,
                userip : ip,
                type : 1,
                username : fields.username,
                inputs : JSON.parse(fields.inputs),
                msrid : '',
                ipport : fields.ipport
            }
            TaskCtrl.loadTask(taskinfo, function (err, msrid) {
                if(err){
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : -1,
                        message : err.message,
                        data : ''
                    }));
                }
                return res.end(JSON.stringify({
                    result : 'suc',
                    code : 1,
                    message : '',
                    data : msrid
                }));
            });
        });
        
    //register server container to Task server(Example: /task/register)
    app.route('/task/register')
        .get(function(req,res,next){
            let type = parseInt(req.query.type);
            SysCtrl.getTaskServerStatus(function(err,result){
                if(err){
                    return res.end(JSON.stringify({
                        result: 'err',
                        code: -1,
                        message: 'Error in getting container register information!'
                    }))
                }
                if(result == 0){
                    if(type == 1){
                        //local network (host and port information can directly get from the Setting, register to the particular Task Server)
                        let host = req.query.host;
                        let port = req.query.port;
                        TaskCtrl.register(host,port,type,function(err,data){
                            if(err){
                                return res.end(JSON.stringify({
                                    result : 'err',
                                    code : -1,
                                    message : 'Error in getting container register information!'
                                }));
                            }
                            if(data){
                                return res.end(JSON.stringify({
                                    result: 'suc',
                                    code: 1,
                                    message: true
                                }));
                            }else{
                                return res.end(JSON.stringify({
                                    result : 'err',
                                    code : -1,
                                    message : 'Error in getting container register information!'
                                }));
                            }
        
                        })
                    }
                    else if(type == 2){
                        ManageServerCtl.getTaskServerAndToRegister(RouteBase.returnFunction(res,'Error in get all TaskServer From Manger Server And Register!'));
                    }
                    else{
                        return res.end(JSON.stringify({
                            result : 'err',
                            code : -1,
                            message : 'Please input the right type parameter!'
                        }));
                    }
                }else{
                    return res.end(JSON.stringify({
                        result: 'err',
                        code: -1,
                        message: 'The Container has been registered to the TaskServer, Please unRegister it firstly and try again!'
                    }));
                }
            })
            
        })

    //unregister the server container to Task server(Example: /task/unregister)
    app.route('/task/unregister')
        .get(function(req,res,next){
            SysCtrl.getTaskServerStatus(function(err,data){
                if(err){
                    return res.end(JSON.stringify({
                        result: 'err',
                        code: -1,
                        message: 'Error in getting container register information!'
                    }))
                }
                let status = data;
                if(status == 1){   
                    ManageServerCtl.unRegisterServer(function(err, result){
                        if(err){
                            return res.end(JSON.stringify({
                                result: 'err',
                                code: -1,
                                message : err.message
                            }));
                        }
                        return res.end(JSON.stringify({
                            result: 'suc',
                            code: 1,
                            message : 'unregister success!'
                        }));
                    })
                }else{
                    return res.end(JSON.stringify({
                        result: 'err',
                        code: -1,
                        message: 'The Container has not been registered to the TaskServer, Please Register it firstly and try again!'
                    }));
                }
            })
        })     
}