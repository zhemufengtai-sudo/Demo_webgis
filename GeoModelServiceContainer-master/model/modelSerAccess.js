/**
 * Created by Franklin on 2017/5/24.
 */

var ObjectId = require('mongodb').ObjectID;
var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');
var mongoModels = require('./mongoModels');

function ModelSerAccess(msa) {
    if(msa != null)
    {
        this._id = msa._id;
        this.token = msa.token;
        this.deadline = msa.deadline;
        this.times = msa.times;
        this.pid = msa.pid;
        this.msrs = msa.msrs;
    }
    else
    {
        this._id = new ObjectId();
        this.token = '';
        this.deadline = '';
        this.times = 0;
        this.pid = '';
        this.msrs = [];
    }
}

ModelSerAccess.__proto__ = ModelBase;
module.exports = ModelSerAccess;

// var ModelSerAccessSchema = new mongoose.Schema({
//     _id : mongoose.Schema.Types.ObjectId,
//     token : String,
//     deadline : String,
//     times : Number,
//     pid : String,
//     msrs : Array
// },{collection:'modelseraccess'});
// var ModelSerAccessModel = mongoose.model('modelseraccess',ModelSerAccessSchema);
var ModelSerAccessModel = mongoModels.modelseraccess;
ModelSerAccess.baseModel = ModelSerAccessModel;
ModelSerAccess.modelName = "modelseraccess";

ModelSerAccess.getByPIDAndToken = function(pid, token, callback){
    ModelSerAccess.getByWhere({pid : pid, token : token}, this.returnFunction(callback, 'error in getting ModelSerAccess by PID in model layer!'));
}

ModelSerAccess.getByMSRID = function(msrid, callback){
    ModelSerAccess.getByWhere({msrs : msrid }, this.returnFunction(callback, 'error in getting ModelSerAccess by MSRID in model layer!'))
}