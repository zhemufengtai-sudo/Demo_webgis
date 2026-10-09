var os = require('os');
var setting = require('../setting');
// var systemSettingModel = require('../model/systemSetting');
// var systemSettingModel = require('../model/systemSetting_n');
var systemSettingModel = require('../model/dbSwitcher').systemSetting;
var RemoteControl = require('./remoteReqControl');
var ModelServiceControl = require('./modelSerControl');
var ControlBase = require('./controlBase');
var CommonMethod = require('../utils/commonMethod');

var PortalControl = function() {};
PortalControl.__proto__ = ControlBase;

module.exports = PortalControl;

//登录门户
PortalControl.loginPortal = function(uname, pwd, callback){
    RemoteControl.postRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/LoginServlet?username=' + uname + '&password=' + pwd, function(err, data){
        if(err){
            return callback(err);
        }
        if(data == '1'){
            return callback(null, true);
        }
        else{
            return callback(null, false);
        }
    });
};

//获取门户账号及密码
PortalControl.getPortalToken = function(callback){
    var portalToken = {};
    systemSettingModel.getValueByIndex('portal_uname', function(err, value){
        if(err){
            return callback(err);
        }
        portalToken['portal_uname'] = value.ss_value;
        systemSettingModel.getValueByIndex('portal_pwd', function(err, value){
            if(err){
                return callback(err);
            }
            portalToken['portal_pwd'] = CommonMethod.decrypto(value.ss_value);
            return callback(null, portalToken);
        });
    });

};

//! Post server info to portal
PortalControl.postServiceList = function(account, callback){
    ModelServiceControl.getLocalModelSer(function(err, data){
        if(err){
            return callback(err);
        }
        CommonMethod.getMac(function(err, mac){
            if(err){
                return callback(err);
            }
            var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/server/modelContainer/add';
            RemoteControl.postRequestJSONWithForm(url, {
                account : account,
                mac : CommonMethod.SHA256(mac),
                servername : os.hostname(),
                platform : os.platform(),
                servicelist : JSON.stringify(data)
            }, function(err, result){
                if(err){
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    });
}

//! unregister in portal
PortalControl.unregisterPortal = function(uname, callback){
    var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/server/modelContainer/remove';
    CommonMethod.getMac(function(err, mac){
        if(err){
            return callback(err);
        }
        RemoteControl.postRequestJSONWithForm(url, {
            account : uname,
            mac : CommonMethod.SHA256(mac)
        }, function(err, result){
            if(err){
                return callback(err);
            }
            return callback(null, true);
        });
    });
}