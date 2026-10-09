var setting = require('../setting');
var RemoteControl = require('./remoteReqControl');
var TaskCtrl = require('./taskControl');
var SysCtrl = require('./sysControl');
const request = require('request');

var CommonMethod = require('../utils/commonMethod');

var ManageServerControl = function () { };

module.exports = ManageServerControl;

ManageServerControl.getAllTaskServer = function (callback) {
    var url = 'http://' + setting.manager.host + ':' + setting.manager.port + '/GeoModeling/taskNode/all';
    RemoteControl.getRequestJSON(url, function (err, data) {
        if (err) {
            return callback(err);
        }
        let code = data.code;
        if (code != 1) {
            return callback({ msg: data.msg }); 
        } else {
            return callback(null, data.data);
        }
    })
};

ManageServerControl.getTaskServerById = function (id, callback) {
    var url = 'http://' + setting.manager.host + ":" + setting.manager.port + '/GeoModeling/taskNode/' + id;
    RemoteControl.getRequestJSON(url, function (err, data) {
        if (err) {
            return callback(err);
        }
        let code = data.code;
        if (code != 1) {
            return callback({ msg: data.msg });
        } else {
            return callback(null, data.data);
        }
    })
};

ManageServerControl.getTaskServerStatusWithPing = function (serverInfo, callback) {
    var tempInfo = serverInfo;
    var size = tempInfo.length;
    var count = 0;
    if (size) {
        //构建回调
        var pending = function (index) {
            count++;
            return function (result) {
                count--;
                if (result.result == 'OK') {
                    tempInfo[index].ping = 1;
                    tempInfo[index].endTime = result.end;
                }
                else {
                    tempInfo[index].ping = 0;
                    tempInfo[index].endTime = result.end;
                }
                if (count == 0) {
                    //处理数据并返回
                    var tempArray = [];
                    for (var j = 0; j < tempInfo.length; j++) {
                        if (tempInfo[j].ping == 1) {
                            var tempObject = {
                                id: '',
                                host: '',
                                port: '',
                                time: 0
                            };
                            tempObject.id = tempInfo[j].id;
                            tempObject.host = tempInfo[j].host;
                            tempObject.port = tempInfo[j].port;
                            tempObject.time = tempInfo[j].endTime - tempInfo[j].startTime;
                            tempArray.push(tempObject);
                        }
                    }
                    return callback(null, tempArray);
                }
            }
        };

        for (var i = 0; i < size; i++) {
            tempInfo[i].startTime = Date.now();
            var url = 'http://' + tempInfo[i].host + ':' + tempInfo[i].port + '/ping';
            RemoteControl.pingWithTimeOut(url, pending(i));
        }
    } else {
        return callback(null, []);
    }
};

ManageServerControl.getTaskServerAndToRegister = function (callback) {
    ManageServerControl.getAllTaskServer(function (err, servers) {
        if (err) {
            return callback(err);
        }
        let serverInfo = servers;
        ManageServerControl.getTaskServerStatusWithPing(serverInfo, function (err, serverStatus) {
            if (err) {
                return callback(err);
            }
            let serverStatusInfo = serverStatus;
            ManageServerControl.getTaskServerForRegister(serverStatusInfo, function (err, result) {
                if (err) {
                    return callback(err);
                }
                return callback(null, result);
            })
        })
    })
};

ManageServerControl.getTaskServerForRegister = function (serverStatusInfo, callback) {
    var url = 'http://' + setting.manager.host + ":" + setting.manager.port + '/GeoModeling/taskNode/getTaskForRegister';
    RemoteControl.postRequestJSONWithJSONData(url, { data: serverStatusInfo }, function (err, result) {
        if (err) {
            return callback(err);
        }
        let code = result.code;
        if (code != 1) {
            return callback({ msg: result.msg });
        } else {
            let taskServerInfo = result.data;
            let ip = taskServerInfo.host;
            let port = taskServerInfo.port;
            let type = 2;
            TaskCtrl.register(ip, port, type, function (err, status) {
                if (err) {
                    return callback(err);
                }
                if (status) {
                    return callback(null, true);
                } else {
                    return callback({ msg: status });
                }
            })
        }
    })
}

ManageServerControl.unRegisterServer = function (callback) {
    SysCtrl.getTaskServerInfo(function (err, taskInfo) {
        if (err) {
            return callback(err);
        }
        var ip = taskInfo.ip;
        var port = taskInfo.port;
        CommonMethod.getMac(function (err, mac) {
            if (err) {
                return callback(err);
            }
            var params = {
                mac: mac
            };
            var url = 'http://' + ip + ':' + port + '/server/unregister';
            request.put(url, { form: params }, function (err, response) {
                if (err) {
                    return callback(err);
                }
                var resJson = JSON.parse(response.body);
                if (resJson.result == 'suc') {
                    //modify taskServerInfo
                    let server = {
                        ip: '0.0.0.0',
                        port: '0'
                    };
                    SysCtrl.setTaskServerInfo(server,function(err, result){
                        
                    });
                    return callback(null, true);
                } else {
                    return callback(resJson);
                }
            })
        })
    })
}