/**
 * Created by Franklin on 2017/3/15.
 */

var formidable = require('formidable');
var uuid = require('node-uuid');

var Setting = require('../setting');
var CommonMethod = require('../utils/commonMethod');
var FileOpera = require('../utils/fileOpera');
var ModelSerControl = require('../control/modelSerControl');
var RemoteReqControl = require('../control/remoteReqControl');
// var ModelSerModel = require('../model/modelService');
// var ModelSerModel = require('../model/modelService_n');
var ModelSerModel = require('../model/dbSwitcher').modelService;
var MidBase = require('./midBase');

var ModelSerMid = function () {
    
};

ModelSerMid.__proto__ = MidBase;

module.exports = ModelSerMid;

//新增模型服务
ModelSerMid.NewModelSer = function (req, callback) {
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';    	                //设置编辑
    form.uploadDir = Setting.dirname + '/geo_model/tmp/';	//设置上传目录
    form.keepExtensions = true;                     //保留后缀
    form.maxFieldsSize = 1024 * 1024 * 1024;         //Form大小
    form.maxFileSize = 1024 * 1024 * 1024 * 1024;         //文件大小
    //解析请求
    form.parse(req, function (err, fields, files) {
        if (err) {
            return callback(err);
        }
        fields.u_name = '[Unknown]';
        fields.u_email = '[Unknown]';
        fields.ms_permission = 0;
        if(req.session.admin){
            fields.u_name = req.session.admin;
            fields.u_email = '[Unknown]';
        }
        ModelSerControl.addNewModelSer(fields, files, this.returnFunction(callback, "err in new a service"));

    }.bind(this));
    //初始化文件传输进度
    global.fileupload.add({
        sessionId : req.sessionID,
        process : 0
    });
    //上传过程中传递进度
    form.on('progress', function (bytesReceived, bytesExpected)
    {
        var percent = Math.round(bytesReceived/bytesExpected * 100);
        var newItem = {
            sessionId : req.sessionID,
            value : percent
        };
        global.fileupload.update(newItem);
    });
};

//! Discarded by FZ in 2023-8-17
//新增远程模型服务
// ModelSerMid.NewRmtModelSer = function (req, callback) {
//     var sessionID = req.params.sessionid;
//     var form = new formidable.IncomingForm();
//     form.encoding = 'utf-8';    	                //设置编辑
//     form.uploadDir = Setting.dirname + '/geo_model/tmp/';	//设置上传目录
//     form.keepExtensions = true;                     //保留后缀
//     form.maxFieldsSize = 500 * 1024 * 1024;         //文件大小
    
//     //解析请求
//     form.parse(req, function (err, fields, files) {
//         if (err) {
//             return callback(err);
//         }
        
//         fields.u_name = CommonMethod.getIP(req);
//         fields.u_email = '[Unknown]';
//         fields.ms_permission = 0;
//         ModelSerControl.addNewModelSer(fields, files, this.returnFunction(callback, "err in new a service"));

//     }.bind(this));
//     //初始化文件传输进度
//     global.fileupload.add({
//         sessionId : sessionID,
//         process : 0
//     });
//     //上传过程中传递进度
//     form.on('progress', function (bytesReceived, bytesExpected)
//     {
//         var percent = Math.round(bytesReceived/bytesExpected * 100);
//         var newItem = {
//             sessionId : sessionID,
//             value : percent
//         };
//         global.fileupload.update(newItem);
//     });
// };

//下载门户模型包
ModelSerMid.getCloudPackage = function(fields, pid, callback){
    var fileName = Setting.dirname + '/geo_model/tmp/' + pid + '.zip';
    var portalCryptoPID = CommonMethod.Encode64(CommonMethod.Encode64(pid));
    RemoteReqControl.postDownload('http://' + Setting.portal.host + ':' + Setting.portal.port + '/GeoModeling/DownloadDeployPackageServlet',
        {
            uid : portalCryptoPID
        }, fileName,
        function(){
            fields = JSON.parse(fields);
            var ms = {
                m_name : fields.model_name,
                m_type : null,
                m_url : "",
                ms_limited : 0,
                mv_num : 1,
                ms_des : fields.model_description,
                ms_xml : null,
                ms_permission : 0,
                u_name : fields.model_author,
                m_model_append : {
                    m_id : fields.model_id,
                    p_id : pid
                }
            };
            ModelSerControl.addNewModelSer(ms, {
                file_model : {
                    path : fileName
                },
                ms_img : {
                    size : 0
                }
            }, this.returnFunction(callback, "err in download a service"))
        }.bind(this)
    );
};

//获取其他服务器模型部署包并部署
ModelSerMid.ModelMigration = function(pid,sourceId,callback){
    var fileName = Setting.dirname + '/geo_model/tmp/' + pid +'.zip';
    var url = 'http://' + sourceId + '/modelser/downloadPackage/' + pid;
    RemoteReqControl.getDownload(url,fileName,function(){
        var ms = {
            ms_limited: 0,
            ms_permission: 0,
            u_name: '[Unknown]',
            u_emial: '[Unknown]'
        };
        ModelSerControl.addNewModelSer(ms,{
            file_model:{
                path:fileName
            },
            ms_img:{
                size: 0
            }
        },function(err,data){
            //模型上传成功后,修改模型状态并进行注册
            if(err){
                return callback(err,{status:1});
            }
            if(!data.isValidate){
                return callback({
                    result:'err',
                    message:'isValidate is false'
                })
            }else{
                var modelser_id = data.data._id;
                console.log(modelser_id);
                //更新数据库，修改ms_status字段为1
                ModelSerControl.getByOID(modelser_id,function(err,result){
                    if(err){
                        return callback(err);
                    }
                    if(result.ms_status == 1 && result.ms_model.ms_register == false){
                        ModelSerControl.RegisterModelService(modelser_id,function(err,registerResult){
                            if(err){
                                return callback(err);
                            }
                            return callback(null,true);
                        });
                    }else{
                        result.ms_status = 1;
                        ModelSerModel.update(result,function(err,item){
                            if(err){
                                return callback(err);
                            }
                            //进行注册
                            ModelSerControl.RegisterModelService(modelser_id,function(err,registerResult){
                                if(err){
                                    return callback(err);
                                }
                                return callback(null,true);
                            });
                        });
                    }
                })
            }
        })
    });
}

//! Invoke model service
ModelSerMid.run = function(userinfo, msid, inputData, outputData, cp, callback){
    //! parse input data 
    ModelSerControl.getByOID(msid, function(err, ms){
        if(err){
            return callback({
                result : 'err',
                code : -1,
                message : "Error in getting model service information!"
            });
        }
        if(ms == null){
            return callback({
                result : 'err',
                code : -2,
                message : "No such model service!'"
            });
        }
        var user = {
            u_name : '[UNKNOWN]',
            u_ip : userinfo.ip,
            u_type : 2
        };
        if(user.admin){
            user = {
                u_name : userinfo.admin,
                u_ip : userinfo.ip,
                u_type : 0
            };
        }
        if(ms.ms_limited == 1){
            if(userinfo.auth){
                var auth = userinfo.auth;
                ModelSerAccessCtrl.run(ms.ms_model.p_id, inputData, outputData, cp, user, auth, function(err, result){
                    if(err){
                        return callback({
                            result : 'err',
                            code : -1,
                            message : "Error in invoking model service!"
                        });
                    }
                    if(result.auth){
                        return callback({
                            result : 'suc',
                            code : 1,
                            data : result.msr._id
                        });
                    }
                    else{
                        return callback({
                            result : 'err',
                            code : -3,
                            message : result.message
                        });
                    }
                });
            }
            else{
                return callback({
                    result : 'fail',
                    code : -4,
                    message : 'No permission to invoke this model service!'
                });
            }
        }
        else{
            ModelSerControl.run(msid, inputData, outputData, cp, user, function(err, msr){
                if(err){
                    return callback({
                        result : 'err',
                        code : -3,
                        message : err.message
                    });
                }
                return callback({
                    result : 'suc',
                    code : 1,
                    data : msr._id
                });
            });
        }
    });
}