/**
 * Author : 7b
 * Date : 2021/5/27
 * Description : NeDB for model service data
 */

// var ObjectId = require('mongodb').ObjectID;
var ObjectId = require('bson').ObjectID;
var fs = require('fs');
var exec = require('child_process').exec;
var xmlparse = require('xml2js').parseString;
var CommonMethod = require('../utils/commonMethod');

const nedb = require('nedb');
const setting = require('../setting');
const ModelBase = require('./modelBase_n');
const ParamCheck = require('../utils/paramCheck');


const ModelServiceDB = new nedb({
    filename: setting.nedb.path + "modelservice",
    autoload: true
});

//ModelService模型
function ModelService(modelser){
    if(modelser != null)
    {
        this._id = modelser._id;
        this.ms_model = modelser.ms_model;
        this.mv_num = modelser.mv_num;
        this.ms_des = modelser.ms_des;
        this.ms_platform = modelser.ms_platform;
        this.ms_update = modelser.ms_update;
        this.ms_path = modelser.ms_path;
        this.ms_img = modelser.ms_img;
        this.ms_xml = modelser.ms_xml;
        this.ms_status = modelser.ms_status;
        this.ms_user = modelser.ms_user;
        this.ms_limited = modelser.ms_limited;
        this.ms_permission = modelser.ms_permission;
        this.registerId = modelser.registerId;
        this.registerId = modelser.registerId;
    }
    else
    {
        this._id = new ObjectId().toString();
        this.ms_model = '';
        this.mv_num = '';
        this.ms_des = '';
        this.ms_update = '';
        this.ms_path = '';
        this.ms_xml = '';
        this.ms_status = 0;
        this.ms_user = '';
        this.ms_limited = 0;
        this.ms_permission = 0;
        this.registerId = '';
    }
    return this;
}
ModelService.__proto__ = ModelBase;
ModelService.baseModel = ModelServiceDB;
ModelService.modelName = 'modelService';
module.exports = ModelService;

//根据计算服务器获取模型服务
ModelService.getAll = function(flag, callback){
    if(ParamCheck.checkParam(callback, flag))
    {
        var where = {};
        if(flag == 'ALL'){
            where = {};
        }
        else if(flag == 'ADMIN'){
            where = { ms_status : { $ne : -1 }}
        }
        else if(flag == 'ONLINE'){
            where = { ms_status : 1, ms_limited : { $ne : 1 }}
        }
        else{
            where = { ms_status : { $ne : -1 }, ms_limited : { $ne : 1 }}
        }
        // ModelServiceDB.find(where, this.returnFunction(callback, 'Error in getting all model service'));
        var query = ModelServiceDB.find(where);
        // query.where(where);
        query.sort({'ms_update':-1});
        query.exec(this.returnFunction(callback, 'Error in getting all model service'));
    }
};

//分页查询
ModelService.getAllByPage = function(start, count, callback){
    var where = {ms_status : { $ne : -1 }, ms_limited : { $ne : 1 }};
    var query = ModelServiceDB.find(where);
    // query.where(where);
    query.skip(start);
    query.limit(count);
    query.exec(this.returnFunction(callback, 'Error in getting model services by paging'));
};

//通过model name进行模糊查询匹配
ModelService.getByName = function(name,callback){

}

//通过MID查询
ModelService.getByMID = function (mid, callback) {
    if(ParamCheck.checkParam(callback, mid))
    {
        var where = { "ms_model.m_id" : mid, "ms_status" : {$ne:-1}};
        this.getByWhere(where, callback);
    }
};

//通过m_register查询已注册模型服务
ModelService.getByRegisterStatus = function(register,callback){
    var where = {"ms_model.m_register" : register, "ms_status" : {$ne:-1}, ms_limited : {$ne:-1}};
    ModelServiceDB.find(where,this.returnFunction(callback, 'Error in getting all model service'));
}

//通过PID查询
ModelService.getByPID = function (pid, callback) {
    if(ParamCheck.checkParam(callback, pid))
    {
        var where = { "ms_model.p_id" : pid, "ms_status" : {$ne:-1}, ms_limited : {$ne:-1}};
        this.getByWhere(where, callback);
    }
};

//add by wangming at 2018.07.23 通过PID可以查询到ms_status为-1的模型
ModelService.getOffLineModelByPID = function(pid, callback){
    if(ParamCheck.checkParam(callback, pid)){
        var where = {"ms_model.p_id" : pid, ms_limited : {$ne:-1}};
        this.getByWhere(where, callback);
    }
}

//通过PID查询(用于门户查询可用服务资源)
ModelService.getByPIDforPortal = function (pid, callback) {
    if(ParamCheck.checkParam(callback, pid))
    {
        var where = { "ms_model.p_id" : pid, "ms_model.m_register" : true, "ms_status" : {$ne:-1}, ms_limited : {$ne:-1}};
        this.getByWhere(where, callback);
    }
};

//批量开启模型
ModelService.batchStart = function(msids, callback){
    var update = {"ms_status" : 1};
    ModelService.batchUpdate(msids, update, function(err, result){
        return callback(err, result);
    });
};

//批量关闭模型
ModelService.batchStop = function(msids, callback){
    var update = {"ms_status" : 0};
    ModelService.batchUpdate(msids, update, function(err, result){
        return callback(err, result);
    });
};

//批量锁定模型
ModelService.batchLock = function(msids, callback){
    var update = {"ms_limited" : 1};
    ModelService.batchUpdate(msids, update, function(err, result){
        return callback(err, result);
    });
};

//批量解锁模型
ModelService.batchUnlock = function(msids, callback){
    var update = {"ms_limited" : 0};
    ModelService.batchUpdate(msids, update, function(err, result){
        return callback(err, result);
    });
};

//批量更新
ModelService.batchUpdate = function(msids, update, callback){
    for(var i = 0; i < msids.length; i++){
        msids[i] = new ObjectId(msids[i]).toString();
    }
    var where = {'_id': { $in : msids }};
    update = {$set : update};
    this.baseModel.update(where, update, {multi : true}, this.returnFunction(callback, 'Error in updating a ' + this.modelName + ' by where'));
};

//启动一个模型服务实例
ModelService.run = function (ms_id, guid, exeoutcb, callback) {
    if(ParamCheck.checkParam(callback, ms_id)){
        if(ParamCheck.checkParam(callback, guid)){
            ModelService.getByOID(ms_id, function (err, ms) {
                if (err) {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, ms))
                {
                    ModelService.readMDL(ms, function(err, jsMDL){
                        if(err){

                        }
                        var entry = jsMDL.ModelClass.Runtime.$.entry;

                        if (jsMDL.ModelClass.Runtime.Assemblies.Assembly){
                            for(var i = 0; i < jsMDL.ModelClass.Runtime.Assemblies.Assembly.length; i++){
                                if (jsMDL.ModelClass.Runtime.Assemblies.Assembly[i].$.name == 'python'){
                                    var pyPath = jsMDL.ModelClass.Runtime.Assemblies.Assembly[i].$.path + 'python';
                                }
                            }
                        }

                        var ext = entry.substr(entry.lastIndexOf('.') + 1);
                        var cmd = '';
                        if(ext == 'exe'){
                            cmd = "\"" + setting.dirname + '/geo_model/' + ms.ms_path + '/model/' + entry + "\"" + ' ' + setting.socket.host + ' ' + setting.socket.port + ' ' + guid;
                        }
                        else if(ext == 'jar'){
                            cmd = 'java -jar ' + setting.dirname + '/geo_model/' + ms.ms_path + '/model/' + entry + ' ' + setting.socket.host + ' ' + setting.socket.port + ' ' + guid;
                        }
                        else if(ext == 'sh'){
                            cmd ='sh ' +  setting.dirname + '/geo_model/' + ms.ms_path + '/model/' + entry + ' ' + setting.socket.host + ' ' + setting.socket.port + ' ' + guid;
                        }
                        else if(ext == 'py'){
                            if(setting.platform == 2){
                                if (pyPath){
                                    cmd = pyPath + ' ' +  setting.dirname + '/geo_model/' + ms.ms_path + '/model/' + entry + ' ' + setting.socket.host + ' ' + setting.socket.port + ' ' + guid;
                                }
                                else{
                                    cmd = 'python ' +  setting.dirname + '/geo_model/' + ms.ms_path + '/model/' + entry + ' ' + setting.socket.host + ' ' + setting.socket.port + ' ' + guid;
                                }
                            }
                            else{
                                // cmd = setting.dirname + '/geo_dataMapping/Python27/python.exe ' +  setting.dirname + '/geo_model/' + ms.ms_path + '/model/' + entry + ' ' + setting.socket.host + ' ' + setting.socket.port + ' ' + guid;
                                cmd = 'python ' +  setting.dirname + '/geo_model/' + ms.ms_path + '/model/' + entry + ' ' + setting.socket.host + ' ' + setting.socket.port + ' ' + guid;
                            }
                        }
                        else{
                            cmd = setting.dirname + '/geo_model/' + ms.ms_path + '/model/' + entry + ' ' + setting.socket.host + ' ' + setting.socket.port + ' ' + guid;
                        }
                        cmd = CommonMethod.CmdReplace(cmd);
                        cmd = CommonMethod.setSep(cmd);
                        exec(cmd, {
                            cwd: setting.dirname + '/geo_model/' + ms.ms_path
                        }, exeoutcb);
                        return callback(null, ms);
                    });
                }
            }.bind(this));
        }
    }
};

//读取MDL文件
ModelService.readMDL = function (ms, callback) {
    if(ParamCheck.checkParam(callback, ms))
    {
        ModelService.readMDLByPath(setting.dirname + '/geo_model/' + ms.ms_path + 'model/', function(err, jsMDL){
            if(err){
                return callback(err);
            }
            return callback(null, jsMDL);
        });
    }
};

ModelService.readMDLStream = function(ms, callback){
    if(ParamCheck.checkParam(callback, ms))
    {
        var path = setting.dirname + '/geo_model/' + ms.ms_path + 'model/';
        fs.readdir(path, function(err, dirs){
            if(err){
                return callback(err);
            }
            var mdlPath = null;
            for(var i = 0; i < dirs.length; i++){
                var dotIndex = dirs[i].lastIndexOf('.');
                if(dotIndex == -1){
                    continue;
                }
                var ext = dirs[i].substr(dotIndex + 1);
                if(ext == 'mdl'){
                    mdlPath = path + dirs[i];
                    break;
                }
            }
            if(mdlPath == null){
                return callback(new Error('Error!'));
            }
            fs.readFile(mdlPath, function (err, data) {
                if(err)
                {
                    console.log('Error in read mdl file : ' + err);
                    return callback(err);
                }
                return callback(null, data);
            });
        });
    }
};

//通过路径读取MDL
ModelService.readMDLByPath = function (path, callback) {
    fs.readdir(path, function(err, dirs){
        if(err){
            return callback(err);
        }
        var mdlPath = null;
        for(var i = 0; i < dirs.length; i++){
            var dotIndex = dirs[i].lastIndexOf('.');
            if(dotIndex == -1){
                continue;
            }
            var ext = dirs[i].substr(dotIndex + 1);
            if(ext == 'mdl'){
                mdlPath = path + dirs[i];
                break;
            }
        }
        if(mdlPath == null){
            return callback(new Error('Error!'));
        }
        fs.readFile(mdlPath, function (err, data) {
            if(err)
            {
                console.log('Error in read mdl file : ' + err);
                return callback(err);
            }
            var mdl = xmlparse(data, { explicitArray : false, ignoreAttrs : false }, function (err, json) {
                if(err)
                {
                    console.log('Error in parse mdl file : ' + err);
                    return callback(err);
                }
                try {
                    if (json.ModelClass.Behavior.StateGroup.States.State.length==undefined)
                    {
                        var temp_state = json.ModelClass.Behavior.StateGroup.States.State;
                        var event_count = temp_state.Event.length;
                        if(event_count){
                            for(var iEvent=0; iEvent<event_count; iEvent++)
                            {
                                var op = temp_state.Event[iEvent].$.optional;
                                if (op=='False')
                                {
                                    temp_state.Event[iEvent].$.optional = 0;
                                }
                                else if (op=="True")
                                {
                                    temp_state.Event[iEvent].$.optional = 1;
                                }
                            }
                        }
                        else{
                            var op = temp_state.Event.$.optional;
                            if (op=='False')
                            {
                                temp_state.Event.$.optional = 0;
                            }
                            else if (op=="True")
                            {
                                temp_state.Event.$.optional = 1;
                            }
                        }
                    }
                    else
                    {
                        var state_count = json.ModelClass.Behavior.StateGroup.States.State.length;
                        for (var iState=0; iState<state_count; iState++)
                        {
                            var temp_state = json.ModelClass.Behavior.StateGroup.States.State[iState];
                            var event_count = temp_state.Event.length;
                            if(event_count){
                                for(var iEvent=0; iEvent<event_count; iEvent++)
                                {
                                    var op = temp_state.Event[iEvent].$.optional;
                                    if (op=='False')
                                    {
                                        temp_state.Event[iEvent].$.optional = 0;
                                    }
                                    else if (op=="True")
                                    {
                                        temp_state.Event[iEvent].$.optional = 1;
                                    }
                                }
                            }
                            else{
                                var op = temp_state.Event.$.optional;
                                if (op=='False')
                                {
                                    temp_state.Event.$.optional = 0;
                                }
                                else if (op=="True")
                                {
                                    temp_state.Event.$.optional = 1;
                                }
                            }
                        }
                    }
                    return callback(null,json);
                } catch (error) {
                    console.log('Error in analysis MDL File: ' + error);
                    return callback(error);
                }
            });
        });
    });
};

// return String!
ModelService.getMDLStr = function (ms, callback) {
    var path = setting.dirname + '/geo_model/' + ms.ms_path + 'model/';
    fs.readdir(path, function(err, dirs){
        if(err){
            return callback(err);
        }
        var mdlPath = null;
        for(var i = 0; i < dirs.length; i++){
            var dotIndex = dirs[i].lastIndexOf('.');
            if(dotIndex == -1){
                continue;
            }
            var ext = dirs[i].substr(dotIndex + 1);
            if(ext == 'mdl'){
                mdlPath = path + dirs[i];
                break;
            }
        }
        if(mdlPath == null){
            return callback(new Error('Error!'));
        }
        fs.readFile(mdlPath, 'utf8', function (err, data) {
            if(err)
            {
                console.log('Error in read mdl file : ' + err);
                return callback(err);
            }
            else{
                return callback(null, data);
            }
        });
    });
};

ModelService.getMSDetail = function(msid, cb){
    ModelService.getByOID(msid, function (err, ms) {
        if (err) {
            return cb(err);
        }
        ModelService.getMDLStr(ms, function (err, mdlStr) {
            if(err) {
                return cb(err);
            }
            return cb(null,{
                MS:ms,
                MDLStr: mdlStr
            });
        });
    });
};

ModelService.parseMDLStr = function (mdlStr, callback) {
    xmlparse(mdlStr, { explicitArray : false, ignoreAttrs : false }, function (err, json) {
        if(err)
        {
            console.log('Error in parse mdl file : ' + err);
            return callback(err);
        }
        return callback(null, json);
    });
};

//读取config文件
ModelService.readCfg = function (ms, callback) {
    if(ParamCheck.checkParam(callback, ms))
    {
        fs.readFile(__dirname + '/../geo_model/' + ms.ms_path + 'package.config', 'utf-8',function(err,data){
            if(err){
                console.log('Error in read config file : ' + err);
                return callback(err);
            }
            else{
                var cfg = {
                    host : "",
                    port : "",
                    start : "",
                    type : "",
                    mdl : "",
                    testdata : "",
                    engine : ""
                };
                var params = data.split('\r\n');
                for(var i = 0; i < params.length; i++)
                {
                    params[i] = params[i].split(' ');
                    switch (params[i][0])
                    {
                        case 'host':
                        {
                            cfg.host = params[i][1];
                            break;
                        }
                        case 'port':
                        {
                            cfg.port = params[i][1];
                            break;
                        }
                        case 'start':
                        {
                            if(params[i].length < 2)
                            {
                                break;
                            }
                            cfg.start = params[i][1];
                            for(var j = 2; j < params[i].length; j++)
                            {
                                cfg.start = cfg.start + ' ' + params[i][j];
                            }
                            break;
                        }
                        case 'mdl':
                        {
                            cfg.mdl = params[i][1];
                            break;
                        }
                        case 'testdata':
                        {
                            cfg.testdata = params[i][1];
                            break;
                        }
                        case 'engine':
                        {
                            cfg.engine = params[i][1];
                            break;
                        }
                        case 'type':
                        {
                            cfg.type = params[i][1];
                            break;
                        }
                    }
                }
                return callback(null, cfg);
            }
        });
    }
};

//读取config文件
ModelService.readCfgBypath = function (path, callback) {
    if(ParamCheck.checkParam(callback, path)){
        fs.readFile(path, 'utf-8',function(err, data){
            if(err){
                console.log('Error in read config file : ' + err);
                return callback(err);
            }
            else{
                var cfg = {
                    host : "",
                    port : "",
                    start : "",
                    type : "",
                    mdl : "",
                    testdata : "",
                    engine : ""
                };
                var params = data.split('\r\n');
                for(var i = 0; i < params.length; i++)
                {
                    params[i] = params[i].split(' ');
                    switch (params[i][0])
                    {
                        case 'host':
                        {
                            cfg.host = params[i][1];
                            break;
                        }
                        case 'port':
                        {
                            cfg.port = params[i][1];
                            break;
                        }
                        case 'start':
                        {
                            if(params[i].length < 2)
                            {
                                break;
                            }
                            cfg.start = params[i][1];
                            for(var j = 2; j < params[i].length; j++)
                            {
                                cfg.start = cfg.start + ' ' + params[i][j];
                            }
                            break;
                        }
                        case 'mdl':
                        {
                            cfg.mdl = params[i][1];
                            break;
                        }
                        case 'testdata':
                        {
                            cfg.testdata = params[i][1];
                            break;
                        }
                        case 'engine':
                        {
                            cfg.engine = params[i][1];
                            break;
                        }
                        case 'type':
                        {
                            cfg.type = params[i][1];
                            break;
                        }
                    }
                }
                return callback(null, cfg);
            }
        });
    }
};

//获取所有模型服务(限制返回字段为模型的pid,即ms_model.pid)
ModelService.getAllPid = function(callback){
    var where = { ms_status : 1, ms_limited : { $ne : 1 }};
    var query = ModelServiceDB.find(where, {'ms_model.p_id': 1});
    // query.where(where);
    query.sort({'ms_update':-1});
    // query.select({'ms_model.p_id': 1});
    query.exec(this.returnFunction(callback, 'Error in getting all model service'));
}





