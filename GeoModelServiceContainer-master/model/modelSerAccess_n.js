/**
 * Author : 7b
 * Date : 2021/6/4
 * Description : NeDB for mdoel service access
 */

var ObjectId = require('bson').ObjectID;
const nedb = require('nedb');
var ModelBase = require('./modelBase_n');
var ParamCheck = require('../utils/paramCheck');
const setting = require('../setting');

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
        this._id = new ObjectId().toString();
        this.token = '';
        this.deadline = '';
        this.times = 0;
        this.pid = '';
        this.msrs = [];
    }
}

ModelSerAccess.__proto__ = ModelBase;
module.exports = ModelSerAccess;

const ModelSerAccessModel = new nedb({
    filename: setting.nedb.path + "modelseraccess",
    autoload: true
});


ModelSerAccess.baseModel = ModelSerAccessModel;
ModelSerAccess.modelName = "modelseraccess";

ModelSerAccess.getByPIDAndToken = function(pid, token, callback){
    ModelSerAccess.getByWhere({pid : pid, token : token}, this.returnFunction(callback, 'error in getting ModelSerAccess by PID in model layer!'));
}

ModelSerAccess.getByMSRID = function(msrid, callback){
    ModelSerAccess.getByWhere({msrs : msrid }, this.returnFunction(callback, 'error in getting ModelSerAccess by MSRID in model layer!'))
}