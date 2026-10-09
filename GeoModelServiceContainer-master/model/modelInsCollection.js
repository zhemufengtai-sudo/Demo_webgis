/**
 * Created by Franklin on 2016/7/25.
 * model for ModelInstance
 */
var uuid = require('node-uuid');
var fs = require('fs');
var pathModule = require('path');

var ModelInstance = require('./modelInstance');
var CommonMethod = require('../utils/commonMethod');
var FileOpera = require('../utils/fileOpera');
var setting = require('../setting');
var GeoDataCtrl = require('../control/geoDataControl');
// var ModelSerModel = require('./modelService');
// var ModelSerModel = require('./modelService_n');
var ModelSerModel = require('./dbSwitcher').modelService;

function ModelInsCollection() {
    this.ModelInsArr = [];
}

module.exports = ModelInsCollection;

//! 添加新模型运行实例
ModelInsCollection.prototype.addIns = function (mis){
    this.ModelInsArr.push(mis);
    return this.ModelInsArr.length - 1;
}

//! Get count of running instance
ModelInsCollection.prototype.getInsCount = function(){
    return this.ModelInsArr.length;
}

//! 创建一个模型运行实例
ModelInsCollection.prototype.createIns = function(ms, inputData, outputData, cp){
    var guid = uuid.v4();
    var date = new Date();
    if(cp == null || cp == undefined){
        cp = [];
    }
    var mis = {
        guid : guid,
        socket : null,
        ms : ms,
        input : inputData,
        output : outputData,
        log : [],
        start : date.toLocaleString(),
        state : 'MC_READY',
        event : '',
        cp : cp
    };
    mis = new ModelInstance(mis);
    delete date;
    this.ModelInsArr.push(mis);
    return guid;
}

//! 根据GUID删除模型运行实例
ModelInsCollection.prototype.removeByGUID = function (guid){
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            // this.ModelInsArr[i].clearTempData();
            this.ModelInsArr.splice(i, 1);
            return 1;
        }
    }
    return -1;
}

//! 得到所有模型
ModelInsCollection.prototype.getAllIns = function () {
    var miss = [];
    for(var i = 0; i < this.ModelInsArr.length; i++)
    {
        miss.push(this.ModelInsArr[i].getBreifCopy());
    }
    return miss;
}

//! 根据Socket删除模型运行实例
ModelInsCollection.prototype.removeBySocekt = function (socket){
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].socket == socket)
        {
            //! Remained it, modified by F.Z., 2021-1-23
            // this.ModelInsArr[i].clearTempData();
            this.ModelInsArr.splice(i, 1);
            return 1;
        }
    }
    return -1;
}

//! 根据GUID查询运行实例
ModelInsCollection.prototype.getByGUID = function (guid) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            return this.ModelInsArr[i];
        }
    }
    return -1;
}

//! 杀死所有运行实例
ModelInsCollection.prototype.killAllInstance = function () {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        this.ModelInsArr[i].kill();
    }
    return 1;
}

//! 根据GUID查询运行实例拷贝信息
ModelInsCollection.prototype.getByGUIDCopy = function (guid) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            return this.ModelInsArr[i].getCopy();
        }
    }
    return -1;
}

//! 根据Socket查询运行实例
ModelInsCollection.prototype.getBySocekt = function (socket) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].socket == socket)
        {
            return this.ModelInsArr[i];
        }
    }
    return -1;
}

//! 根据序列查询运行实例
ModelInsCollection.prototype.getByIndex = function (index) {
    if(index > this.ModelInsArr.length - 1)
    {
        return -1;
    }
    return this.ModelInsArr[index];
}

//! 判断一个Socket通信是否存在
ModelInsCollection.prototype.exsit = function (socket) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].socket == socket)
        {
            return i;
        }
    }
    return -1;
}

//! 绑定ms属性
ModelInsCollection.prototype.bindMs = function (guid, ms) {
    for(var i = 0; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            this.ModelInsArr[i].ms = ms;
            return 1;
        }
    }
    return -1;
}

//! 绑定socket属性
ModelInsCollection.prototype.bindSocket = function (guid, socket) {
    for(var i = 0; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            this.ModelInsArr[i].socket = socket;
            return 1;
        }
    }
    return -1;
}

//! 根据Socket更改状态
ModelInsCollection.prototype.changeStateBySocket = function (socket, state) {
    var mis = this.getBySocekt(socket);
    if(mis != -1){
        mis.setState(state);
        return 1;
    }
    return -1;
}

//! 根据GUID更改状态
ModelInsCollection.prototype.changeStateByGUID = function (guid, state) {
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.setState(state);
        return 1;
    }
    return -1;
};

//! 杀死某个模型程序
ModelInsCollection.prototype.kill = function(guid){
    // var mis = this.getByGUID(guid);
    // if(mis != -1){
    //     mis.kill();
    //     return 1;
    // }
    // return -1;
    var index = this.ModelInsArr.findIndex(m => m.guid === guid);
    if(index !== -1){
        this.ModelInsArr[index].kill();
        this.ModelInsArr.splice(index, 1); // 删除实例
        return 1;
    }
    return -1;
}

//! 暂停
ModelInsCollection.prototype.pause = function(guid){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.pause();
        return 1;
    }
    return -1;
}

//! 重启
ModelInsCollection.prototype.restart = function(guid){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.restart();
        return 1;
    }
    return -1;
}

//! 更新数据
ModelInsCollection.prototype.updateData = function(guid, data){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.restart();
        return 1;
    }
    return -1;
}

//! 设置ProcessParams
ModelInsCollection.prototype.setProcessParams = function(guid, paramsBuffer){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'SetProcessParams',
            State : mis.state,
            Event : mis.event,
            Flag : 1,
            Message : '',
            DateTime : (new Date()).toISOString()
        });
        mis.setProcessParams(paramsBuffer);
        return 1;
    }
    return -1;
}

//! 获取ProcessParams
ModelInsCollection.prototype.getProcessParams = function(guid){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        return mis.getProcessParams();
    }
    return -1;
}

///////////////////////////////////////////////////////状态改变

//! 初始化
ModelInsCollection.prototype.initialize = function(guid ,socket){
    var flag = this.bindSocket(guid, socket);
    if(flag == -1){
        socket.write('{kill}');
    }
    else{
        var mis = this.getByGUID(guid);
        mis.state = 'Initialized';
        // socket.write('{Initialized}' + guid + '[' + setting.dirname + '/../geo_dataMapping/CommonShell/x64' +  ']' + '[' + setting.modelpath + mis.ms.ms_path + '/instance/' + guid + ']');
        var respones = '{Initialized}' + guid + '[' + setting.dirname + '\\geo_dataMapping\\CommonShell\\x64' +  ']' + '[' + setting.dirname + '\\geo_model\\' + CommonMethod.makeupDir(mis.ms.ms_path) + 'instance\\' + guid + ']';
        mis.pushMessage(CommonMethod.setSep(respones));
        mis.log.push({
            Type : 'Initialize',
            State : '',
            Event : '',
            Flag : 1,
            Message : '',
            DateTime : (new Date()).toISOString()
        });
        // mis.initControlParams();
    }
}

//! 进入状态
ModelInsCollection.prototype.enterState = function(guid, state){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'EnterState',
            State : state,
            Event : '',
            Flag : 1,
            Message : '',
            DateTime : (new Date()).toISOString()
        });
        mis.setState(state);
        // mis.socket.write('{Enter State Notified}');
        mis.pushMessage('{Enter State Notified}');
    }
}

//! 激发事件
ModelInsCollection.prototype.fireEvent = function(guid, state, event){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'FireEvent',
            State : state,
            Event : event,
            Flag : 1,
            Message : '',
            DateTime : (new Date()).toISOString()
        });
        mis.setEvent(event);
        // mis.socket.write('{Fire Event Notified}');
        mis.pushMessage('{Fire Event Notified}');
    }
}

//! 索取数据
ModelInsCollection.prototype.requestData = function(guid, state, event){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        var hasFound = false;
        for(var i = 0; i < mis.input.length; i++){
            if(mis.input[i].StateName == state && mis.input[i].Event == event){
                hasFound = true;
                var op = mis.input[i].Optional;
                //无输入数据
                mis.input[i].Requested = true;
                if(mis.input[i].DataId == ''){
                    if (op == 0)
                    {
                        // mis.socket.write('{Request Data Notified}[ERROR][XML|FILE]');
                        mis.pause();
                        mis.setStatus('REQUESTING', 'RequestingData : State[' + state + '], EVENT[' + event + ']');
                        // mis.pushMessage('{Request Data Notified}[ERROR][XML|FILE]');
                    }
                    else
                    {
                        // mis.socket.write('{Request Data Notified}[OK][XML|FILE]');
                        mis.pushMessage('{Request Data Notified}[NOTREADY][UNKNOWN|FILE]');
                    }
                }
                //有输入数据
                else{
                    mis.input[i].Requested = true;
                    GeoDataCtrl.getByKey(mis.input[i].DataId, function(err, dat){
                        if(err){
                            if (op == 0)
                            {
                                mis.pushMessage('{Request Data Notified}[ERROR][XML|FILE]');
                                mis.log.push({
                                    Type : 'RequestData',
                                    State : state,
                                    Event : event,
                                    Flag : -1,
                                    Message : 'Error in requesting a data!',
                                    DateTime : (new Date()).toISOString()
                                });
                            }
                            else
                            {
                                mis.pushMessage('{Request Data Notified}[OK][XML|FILE]');
                                mis.log.push({
                                    Type : 'RequestData',
                                    State : state,
                                    Event : event,
                                    Flag : -2,
                                    Message : 'Warning in requesting a data, but data is optianal!',
                                    DateTime : (new Date()).toISOString()
                                });
                            }
                        }
                        else{
                            var correct = true;
                            if(dat.gd_type == 'XML'){
                                mis.pushMessage(CommonMethod.setSep('{Request Data Notified}[OK][XML|FILE]' + setting.dirname + '\\geo_data\\' + dat.gd_value));
                            }
                            else if(dat.gd_type == 'FILE' || dat.gd_type == 'RAW'){
                                mis.pushMessage(CommonMethod.setSep('{Request Data Notified}[OK][RAW|FILE]' + setting.dirname + '\\geo_data\\' + dat.gd_value));
                            }
                            else if(dat.gd_type == 'ZIP'){
                                mis.pushMessage(CommonMethod.setSep('{Request Data Notified}[OK][ZIP|FILE]' + setting.dirname + '\\geo_data\\' + dat.gd_value));
                            }
                            else{
                                correct = false;
                                // mis.socket.write('{Request Data Notified}[ERROR][XML|FILE]');
                                mis.pushMessage('{Request Data Notified}[ERROR][XML|FILE]');
                                mis.log.push({
                                    Type : 'RequestData',
                                    State : state,
                                    Event : event,
                                    Flag : -1,
                                    Message : 'The format of data is error!',
                                    DateTime : (new Date()).toISOString()
                                });
                            }
                            if(correct){
                                mis.log.push({
                                    Type : 'RequestData',
                                    State : state,
                                    Event : event,
                                    Flag : 1,
                                    Message : 'Request data!',
                                    DateTime : (new Date()).toISOString()
                                });
                            }
                        }
                    });
                }
                break;
            }
        }
        if(!hasFound){
            // mis.socket.write('{Request Data Notified}[ERROR][XML|FILE]');
            mis.pushMessage('{Request Data Notified}[ERROR][XML|FILE]');
            mis.log.push({
                Type : 'RequestData',
                State : state,
                Event : event,
                Flag : -1,
                Message : 'Can not find this data!',
                DateTime : (new Date()).toISOString()
            });
        }
    }
}

//! 得到数据
ModelInsCollection.prototype.responseDataPrepare = function(guid, state, event, dataSignal, dataType, dataFormat){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'ResponseDataPre',
            State : state,
            Event : event,
            Flag : 1,
            Message : '',
            DateTime : (new Date()).toISOString()
        });
        // mis.socket.write('{Response Data Notified}');
        mis.pushMessage('{Response Data Notified}');
    }
}

//! 得到数据
ModelInsCollection.prototype.responseData = function (guid, state, event, data, dataSignal, dataType, dataFormat) {
    var mis = this.getByGUID(guid);
    console.log('responseData params:', {guid, state, event, data, dataSignal, dataType, dataFormat});
    //构建一个status变量来检查State和Event是否有相匹配的状态
    var status = false;
    if (mis != -1) {
        // 数据准备好
        if (dataSignal == 'OK') {
            for (var i = 0; i < mis.output.length; i++) {
                if (mis.output[i].StateName == state && mis.output[i].Event == event) {
                    if (dataFormat == 'FIL' || dataFormat == 'FILE') {
                        status = true;
                        if (fs.existsSync(data)) {
                            //! 数据后缀名
                            var ext = data.substr(data.lastIndexOf('.'));

                            // //判断是否是按时间输出数据的情况
                            // if (mis.output[i].DataId != ''){
                            //     console.log("this data has been output");
                            //     //后面开始存一个新的字段
                            //     var iteration = {
                            //         name: '',
                            //         dataId: ''
                            //     };
                            //     iteration.name = global.basefilename;
                            //     iteration.dataId = mis.output[i].DataId;
                            //     mis.output[i].TimeData.push(iteration);
                            // }

                            //获取输出文件名称
                            global.basefilename = pathModule.basename(data);
                            var dataId = 'gd_' + uuid.v1();
                            if (mis.output[i].Multiple && mis.output[i].Multiple == 'True') {
                                mis.output[i].DataId.push(dataId);
                            }
                            else {
                                mis.output[i].DataId = dataId;
                            }
                            //! Mark the remaining data as saving data, 2021-1-22 modified by F.Z.
                            // var filename = dataId + ext;
                            var filename = data;
                            var stat = fs.statSync(data);
                            var gd = {
                                gd_id: dataId,
                                gd_tag: mis.output[i].Tag,
                                gd_size: stat.size,
                                gd_type: dataType,
                                gd_value: filename
                            };
                            //! Modified as remaining the instance data and link the result data in the instance, 
                            //! 2021-1-22 modified by F.Z.
                            //! 由移动变为复制文件
                            // FileOpera.copy(data, setting.dirname + '/geo_data/' + filename, function(err, result){
                            //     if(err){
                            //         mis.log.push({
                            //             Type : 'ResponseData',
                            //             State : state,
                            //             Event : event,
                            //             Flag : -1,
                            //             Message : 'copy file error!',
                            //             DateTime : (new Date()).toISOString()
                            //         });
                            //         mis.pushMessage('{Response Data Received}' + mis.guid);
                            //         return;
                            //     }
                            //     GeoDataCtrl.addData(gd, function(err, result){
                            //         if(err){
                            //             console.log('OMG!这TM也能出错!')
                            //         }
                            //         mis.log.push({
                            //             Type : 'ResponseData',
                            //             State : state,
                            //             Event : event,
                            //             Flag : 1,
                            //             Message : 'Get data ' + data + '!',
                            //             DateTime : (new Date()).toISOString()
                            //         });
                            //         mis.pushMessage('{Response Data Received}' + mis.guid);
                            //     });
                            // });

                            GeoDataCtrl.addData(gd, function (err, result) {
                                if (err) {
                                    console.log('OMG!这TM也能出错!')
                                }
                                mis.log.push({
                                    Type: 'ResponseData',
                                    State: state,
                                    Event: event,
                                    Flag: 1,
                                    Message: 'Get data ' + data + '!',
                                    DateTime: (new Date()).toISOString()
                                });
                                mis.pushMessage('{Response Data Received}' + mis.guid);
                            });
                        }
                        else {
                            mis.log.push({
                                Type: 'ResponseData',
                                State: state,
                                Event: event,
                                Flag: -1,
                                Message: 'Can not find result data!',
                                DateTime: (new Date()).toISOString()
                            });
                            console.log('No Response Data!');
                            mis.pushMessage('{Response Data Received}' + mis.guid);
                            return;
                        }
                    }
                }
            }
            //如果都没有相匹配的Event和State,则说明MDL或者封装程序写错
            if (!status) {
                mis.log.push({
                    Type: 'ResponseData',
                    State: state,
                    Event: event,
                    Flag: -1,
                    Message: 'Event and State are not matched',
                    DateTime: (new Date()).toISOString()
                });
                mis.pushMessage('{Response Data Received}' + mis.guid);
            }
        }
        // 数据未准备好
        else {
            mis.log.push({
                Type: 'ResponseData',
                State: state,
                Event: event,
                Flag: -1,
                Message: 'Data is not prepared',
                DateTime: (new Date()).toISOString()
            });
            mis.pushMessage('{Response Data Received}' + mis.guid);
        }
    }
}

//! 获取异常错误信息
ModelInsCollection.prototype.postErrorInfo = function(guid, errorinfo){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'PostErrorInfo',
            State : '',
            Event : '',
            Flag : 1,
            Message : errorinfo,
            DateTime : (new Date()).toISOString()
        });
        // return mis.socket.write('{Post Error Info Notified}' + mis.guid);
        return mis.pushMessage('{Post Error Info Notified}' + mis.guid);
    }
}

//! 获取警告信息
ModelInsCollection.prototype.postWarningInfo = function(guid, warninginfo){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'PostWarningInfo',
            State : '',
            Event : '',
            Flag : 1,
            Message : warninginfo,
            DateTime : (new Date()).toISOString()
        });
        // return mis.socket.write('{Post Warning Info Notified}' + mis.guid);
        return mis.pushMessage('{Post Warning Info Notified}' + mis.guid);
    }
}

//! 获取提示信息
ModelInsCollection.prototype.postMessageInfo = function(guid, messageinfo){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'PostMessageInfo',
            State : '',
            Event : '',
            Flag : 1,
            Message : messageinfo,
            DateTime : (new Date()).toISOString()
        });
        // return mis.socket.write('{Post Message Info Notified}' + mis.guid);
        return mis.pushMessage('{Post Message Info Notified}' + mis.guid);
    }
}

//! 初始化ControlParams
ModelInsCollection.prototype.initControlParams = function(guid){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'InitControlParam',
            State : mis.state,
            Event : mis.event,
            Flag : 1,
            Message : '',
            DateTime : (new Date()).toISOString()
        });
        var paramsBuffer = JSON.stringify(mis.controlParams);
        mis.pushMessage('{InitControlParams Notified}' + mis.id + '&' + paramsBuffer);
        return 1;
    }
    return -1;
}

//! 获取模型依赖组件目录
ModelInsCollection.prototype.getModelAssembly = function(guid, assemblyName, callback){
    var mis = this.getByGUID(guid);
    ModelSerModel.readMDL(mis.ms, function(err, mdl){
        if(err){
            // return mis.socket.write('{GetModelAssembly Notified}' + mis.guid);
            return mis.pushMessage('{GetModelAssembly Notified}' + mis.guid);
        }
        mis.log.push({
            Type : 'GetModelAssembly',
            State : '',
            Event : '',
            Flag : 1,
            Message : 'AssemblyName : ' + assemblyName,
            DateTime : (new Date()).toISOString()
        });
        var assemblies = mdl.ModelClass.Runtime.Assemblies.Assembly;
        if(assemblies instanceof Array){
            for(var i = 0; i < assemblies.length; i++){
                if(assemblies[i].$.name == assemblyName){
                    var path = assemblies[i].$.path;
                    var idx1 = -1;
                    if (path.indexOf('$(DataMappingPath)')!=-1){
                        idx1 = path.indexOf('$(DataMappingPath)');
                        path = path.substr(idx1 + 18);
                        path = '\\geo_dataMapping\\' + path
                    }
                    else if (path.indexOf('$(ModelServicePath)')!=-1){
                        idx1 = path.indexOf('$(ModelServicePath)');
                        path = path.substr(idx1 + 19);
                        path = '\\geo_model\\' + path;
                    }
                    else if (path.indexOf('$(Assembly)')!=-1){
                        idx1 = path.indexOf('$(Assembly)')
                        path = path.substr(idx1 + 11);
                        path = '\\geo_model\\' + mis.ms.ms_path + 'assembly/';
                    }
                    // return mis.socket.write('{GetModelAssembly Notified}' + __dirname + path);
                    return mis.pushMessage(CommonMethod.setSep('{GetModelAssembly Notified}' + setting.dirname + path));
                }
            }
        }
        else{
            if(assemblies.$.name == assemblyName){
                var path = assemblies.$.path;
                var idx1 = -1;
                if (path.indexOf('$(DataMappingPath)')!=-1){
                    idx1 = path.indexOf('$(DataMappingPath)');
                    path = path.substr(idx1+1);
                    path = '\\geo_dataMapping\\' + path
                }
                else if (path.index('$(ModelServicePath)')!=-1){
                    idx1 = path.index('$(ModelServicePath)');
                    path = path.substr(idx1+19);
                    path = '\\geo_model\\' + path;
                }
                // return mis.socket.write('{GetModelAssembly Notified}' + mis.guid + '&' + __dirname + path);
                return mis.pushMessage(CommonMethod.setSep('{GetModelAssembly Notified}' + mis.guid + '&' + setting.dirname + path));
            }
        }
        // return mis.socket.write('{GetModelAssembly Notified}' + mis.guid);
        return mis.pushMessage('{GetModelAssembly Notified}' + mis.guid);
    });
}

// 打印模型日志信息
ModelInsCollection.prototype.getlogs = function(guid, path){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'ExportLogs',
            State : '',
            Event : '',
            Flag : 1,
            Message : 'Export logs path: ' + path + ' !',
            DateTime : (new Date()).toISOString()
        });
        // var message = 'Export Logs Successfully, Path:' + path;
        mis.state = '';
        mis.pushMessage('{Export Logs Notified}');
    }
}

//! 离开状态
ModelInsCollection.prototype.leaveState = function(guid, state){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'LeaveState',
            State : state,
            Event : '',
            Flag : 1,
            Message : '',
            DateTime : (new Date()).toISOString()
        });
        // mis.socket.write('{Leave State Notified}');
        mis.pushMessage('{Leave State Notified}');
    }
}

//! 结束
ModelInsCollection.prototype.finalize = function(guid){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push({
            Type : 'Finalize',
            State : '',
            Event : '',
            Flag : 1,
            Message : '',
            DateTime : (new Date()).toISOString()
        });
        mis.state = 'Finalized';
        // mis.socket.write('{Finalize Notified}');
        mis.pushMessage('{Finalize Notified}');
    }
}