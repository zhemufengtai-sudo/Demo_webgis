/**
 * 数据库的增删查改
 */

var ObjectId = require('mongodb').ObjectID;
var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var CheckParam = require('../utils/paramCheck');
var mongoModels = require('./mongoModels');

//ModelSerRun模型
function ModelSerRun( modelserRun )
{
    if(modelserRun != null)
    {
        this._id = modelserRun._id;
        this.ms_id = modelserRun.ms_id;
        this.msr_ms = modelserRun.msr_ms;
        this.msr_datetime = modelserRun.msr_datetime;
        this.msr_span = modelserRun.msr_span;
        this.msr_user = modelserRun.msr_user;
        this.msr_guid = modelserRun.msr_guid;
        this.msr_input = modelserRun.msr_input;
        this.msr_output = modelserRun.msr_output;
        this.msr_status = modelserRun.msr_status;
        this.msr_logs = modelserRun.msr_logs;
        this.m_logs = modelserRun.m_logs;
        this.msr_runninginfo = modelserRun.msr_runninginfo;
        this.msr_processparams = modelserRun.msr_processparams;
        this.msr_controlparams = modelserRun.msr_controlparams;
    }
    else
    {
        this._id = new ObjectId();
        this.ms_id = '';
        this.msr_ms = {};
        this.msr_datetime = '';
        this.msr_span = 0;
        this.msr_user = {};
        this.msr_guid = '';
        this.msr_input = [];
        this.msr_output = [];
        this.msr_status = -1;
        this.msr_logs = [];
        this.m_logs = [];
        this.msr_runninginfo = {
            InvokeErr: "",
            StdOut: "",
            StdErr: ""
        };
        this.msr_processparams = [];
        this.msr_controlparams = {};
    }
    return this;
}
ModelSerRun.__proto__ = ModelBase;
ModelSerRun.modelName = "model service run";

module.exports = ModelSerRun;

// var MSRSchema = new mongoose.Schema({
//     ms_id : mongoose.Schema.Types.ObjectId,
//     msr_ms :  mongoose.Schema.Types.Mixed,
//     msr_datetime :  Date,
//     msr_span : Number,
//     msr_user :  mongoose.Schema.Types.Mixed,
//     msr_guid :  String,
//     msr_input :  Array,
//     msr_output :  Array,
//     msr_status : Number,
//     msr_runninginfo :  mongoose.Schema.Types.Mixed,
//     msr_logs :  Array,
//     msr_processparams : Array,
//     msr_controlparams : Array
// },{collection:'modelserrun'});
// var MSR = mongoose.model('modelserrun',MSRSchema);
var MSR = mongoModels.modelserrun;

ModelSerRun.baseModel = MSR;

//获取模型运行服务
ModelSerRun.getAll = function(callback){
    MSR.find({}, this.returnFunction(callback, "error in getting all model service runs"));
};

//根据ms_id获取ModelSerRun
ModelSerRun.getByMsId = function(_msid, callback){
    if(CheckParam.checkParam(callback,_msid)){
        var msid = new ObjectId(_msid);
        MSR.find({ms_id:msid}, this.returnFunction(callback, "error in getting by MsId model service runs"));
    }
};

//根据msr_guid获取ModelSerRun
ModelSerRun.getByGUID = function(guid, callback){
    if(CheckParam.checkParam(callback,guid)){
        MSR.findOne({msr_guid : guid},this.returnFunction(callback, "error in getting by GUID model service runs"));
    }
};

//根据输出数据的DataId获取此数据
ModelSerRun.getByOutputDataID = function(dataid, callback){
    if(CheckParam.checkParam(callback, dataid)){
        MSR.find({"msr_output.DataId" : { "$in" : [ dataid ]}}, function(err, msr){
            if(err){
                return callback(err);
            }
            if(msr.length == 0){
                return callback(null, null)
            }
            msr = msr[0];
            for(var i = 0; i < msr.msr_output.length; i++){
                if(msr.msr_output[i].DataId == dataid){
                    return callback(null, msr.msr_output[i]);
                }
            }
            return callback(null, null);
        });
    }
};

//得到全部数据的统计信息
ModelSerRun.getStatisticInfoByDate = function(msid, start, end, callback){
    if(CheckParam.checkParam(callback, start)){
        if(CheckParam.checkParam(callback, end)){
            if(msid){
                msid = new ObjectId(msid);
                MSR.find({"ms_id" : msid, "msr_datetime" : { "$gte" : start, "$lt" : end}}, this.returnFunction(callback, "Error in getting statistic info!"));
            }
            else{
                MSR.find({"msr_datetime" : { "$gte" : start, "$lt" : end}}, this.returnFunction(callback, "Error in getting statistic info!"));
            }
        }
    }
}

//得到全部数据的统计信息
ModelSerRun.getStatisticInfoByMsidAndDate = function(msid, start, end, callback){
    if(CheckParam.checkParam(callback, msid)){
        if(CheckParam.checkParam(callback, start)){
            if(CheckParam.checkParam(callback, end)){
                msid = new ObjectId(msid);
                MSR.find({ "ms_id" : msid ,"msr_date" : { "$gte" : start, "$lt" : end}}, this.returnFunction(callback, "Error in getting statistic info!"));
            }
        }
    }
}

//得到次数统计信息
ModelSerRun.getTimesStatisticInfoByMSID = function(callback){
    MSR.aggregate([{$group : { _id : {"ms_id" : "$ms_id",}, count : {$sum:1} }}], this.returnFunction(callback, 'Error in getting times statistic info'));
};

//更新运行信息
ModelSerRun.updateRunningInfo = function (_oid, msr_runninginfo, callback) {
    if(CheckParam.checkParam(callback, _oid))
    {
        if(CheckParam.checkParam(callback, msr_runninginfo))
        {
            var oid = new ObjectId(_oid);
            var where = {'_id' : oid};
            var update = {
                $set : {msr_runninginfo : msr_runninginfo}
            };
            MSR.update(where, update, this.returnFunction(callback, 'Error in updating msr_des a ' + this.modelName + ' by where'));
        }
    }
};

//更新日志信息
ModelSerRun.updateLog = function (_oid, msr_logs, m_logs, callback) {
    if(CheckParam.checkParam(callback, _oid))
    {
        if(CheckParam.checkParam(callback, msr_logs, m_logs))
        {
            var oid = new ObjectId(_oid);
            var where = {'_id' : oid};
            var update = {
                $set : { 
                    msr_logs : msr_logs,
                    m_logs : m_logs,
                }
            };
            MSR.update(where, update, this.returnFunction(callback, 'Error in updating msr_log a ' + this.modelName + ' by where'));
        }
    }
};