/**
 * Created by Franklin on 2017/5/31.
 */

var setting = require('../setting');
var debugSetting = require('../debugSetting.json')
var CommonMethod = require('../utils/commonMethod');

var AuthCtrl = function(){};

var getURLs = ['/login'];
var postURLs = ['/login', '/child-node'];

module.exports = AuthCtrl;

AuthCtrl.getAuth = function(req){
    return AuthCtrl.auth(req, getURLs);
};

AuthCtrl.postAuth = function(req, callback){
    return AuthCtrl.auth(req, postURLs);
}

AuthCtrl.auth = function(req, ex){
    if(debugSetting.auth){
        if(CommonMethod.array_contain(ex, req.originalUrl)){
            return 1;
        }
        else if(req.query.token){
            var ipAddress = CommonMethod.getIP(req);
            var token = req.query.token;
            if(CommonMethod.decrypto(token) == ipAddress){
                return 1;
            }
            else{
                return -2;
            }
        }
        else {
            if(req.session.admin){
                return 1;
            }
            else{
                return -1;
            }
        }
    }
    else{
        return 1;
    }
}

AuthCtrl.authByAdmin = function(req){
    if(setting.auth){
        if(req.session.admin){
            return 1;
        }
        else{
            return -1;
        }
    }
    else{
        return 1;
    }
}