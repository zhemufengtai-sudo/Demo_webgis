/**
 * Created by Franklin on 2017/5/24.
 */

// var ModelSerAccessModel = require('../model/modelSerAccess');
// var ModelSerAccessModel = require('../model/modelSerAccess_n');
var ModelSerAccessModel = require('../model/dbSwitcher').modelSerAccess;
// var ModelSerModel = require('../model/modelService');
// var ModelSerModel = require('../model/modelService_n');
var ModelSerModel = require('../model/dbSwitcher').modelService;
// var ModelSerRunModel = require('../model/modelSerRun');
// var ModelSerRunModel = require('../model/modelSerRun_n');
var ModelSerRunModel = require('../model/dbSwitcher').modelSerRun;
var ModelSerCtrl = require('./modelSerControl');
var ControlBase = require('./controlBase');
var CommonMethod = require('../utils/commonMethod');
var ParamCheck = require('../utils/paramCheck');

var ModelSerAccessControl = function(){};

ModelSerAccessControl.__proto__ = ControlBase;
ModelSerAccessControl.model = ModelSerAccessModel;

module.exports = ModelSerAccessControl;

//模型权限登录
ModelSerAccessControl.auth = function(pid, token, callback){
    if(ParamCheck.checkParam(callback, token)){
        if(ParamCheck.checkParam(callback, pid)){
            ModelSerAccessModel.getByPIDAndToken(pid, token, function(err, msa){
                if(err){
                    return callback(err);
                }
                if(msa.length == 0){
                    return callback(new Error('No records'));
                }
                msa = msa[0];
                if(msa){
                    return callback(null, true, msa);
                }
                return callback(null, false);
            });
        };
    }
};

//判断用户是否有MSRID权限
ModelSerAccessControl.authMsrID = function(msrid, username, pwd, callback){
    if(ParamCheck.checkParam(callback, msrid)){
        ModelSerAccessModel.getByMSRID(msrid, function(err, msa){
            if(err){
                return callback(err);
            }
            if(msa.length == 0){
                return callback(null, false);
            }
            msa = msa[0];
            var pwd_md5 = CommonMethod.md5(pwd);
            if(msa.username == username && msa.pwd == pwd_md5){
                return callback(null, true);
            }
            else{
                return callback(null, false);
            }
        });
    }
};

//带权限运行模型
ModelSerAccessControl.run = function(pid, inputData, outputData, cp, user, token, callback){
    ModelSerAccessControl.auth(pid, token, function(err, result, msa){
        if(err){
            return callback(err);
        }
        if(result){
            if(msa.times != -1){
                if(msa.times < 1){
                    return callback(null, {
                        auth : false,
                        message : 'No time left!'
                    });
                }
                else{
                    msa.times = msa.times - 1;
                }
            }
            if(msa.deadline != null && msa.deadline.trim() != ''){
                var deadline = new Date(msa.deadline);
                var date_now = new Date();
                if(deadline < date_now){
                    return callback(null, {
                        auth : false,
                        message : 'Beyond permission dete!'
                    });   
                }
            }
            var msaid = msa._id;
            ModelSerAccessModel.update(msa, function(err, result){
                if(err){
                    return callback(err);
                }
                ModelSerCtrl.getByPID(msa.pid, function(err, ms){
                    if(err){
                        return callback(err);
                    }
                    ms = ms[0];
                    ModelSerCtrl.run(ms._id, inputData, outputData, cp, user, function(err, msr){
                        if(err){
                            return callback(err);
                        }
                        ModelSerAccessControl.addMSR(msaid, msr._id, function(err, result){
                            if(err){
                                return callback(err);
                            }
                            return callback(null, {
                                auth : true,
                                msr : msr
                            });
                        });
                    });
                });
            });
        }
        else{
            return callback(null, {
                auth : false,
                message : 'No permission record!'
            });
        }
    });
}

//添加模型权限的运行记录
ModelSerAccessControl.addMSR = function(msaid, msrid, callback){
    if(ParamCheck.checkParam(callback, msaid)){
        ModelSerAccessModel.getByOID(msaid, function(err, msa){
            if(err){
                return callback(err);
            }
            if(!msa){
                return callback(new Error('Can not find MSA'));
            }
            msa.msrs.push(msrid);
            ModelSerAccessModel.update(msa, function(err, result){
                if(err){
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    }
}