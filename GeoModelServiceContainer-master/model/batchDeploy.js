/**
 * Created by Administrator on 5.19.
 */
var ObjectId = require('mongodb').ObjectID;

var mongoose = require('./mongooseModel');
var mongodb = require('./mongoDB');
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');
var mongoModels = require('./mongoModels');

function BatchDeploy(batchDeploy)
{
    if(batchDeploy != null) {
        if(batchDeploy._id){
            this._id = batchDeploy._id;
        }
        else {
            this._id = new ObjectId();
        }
        this.batch_path = batchDeploy.batch_path;
        this.zip_path = batchDeploy.zip_path;
        this.ms_info = batchDeploy.ms_info;
        this.rst = batchDeploy.rst;
        this.deployed = batchDeploy.deployed;
        this.ms_user = batchDeploy.ms_user;
        this.category = batchDeploy.category;
    }
    else {
        this._id = new ObjectId();
        this.batch_path = '';
        this.zip_path = '';
        this.ms_info = {};
        this.rst = {};
        this.deployed = false;
        this.ms_user = {};
        this.category = '';
    }
    return this;
}
BatchDeploy.__proto__ = ModelBase;
module.exports = BatchDeploy;

// var batchSchema = new mongoose.Schema({
//     batch_path:String,
//     zip_path:String,
//     ms_info : mongoose.Schema.Types.Mixed,
//     rst:mongoose.Schema.Types.Mixed,
//     deployed:Boolean,
//     ms_user:mongoose.Schema.Types.Mixed,
//     category:String
// },{collection:'batchDeploy'});
//
// var BatchModel = mongoose.model('batchDeploy',batchSchema);
var BatchModel = mongoModels.batchDeploy;
BatchDeploy.baseModel = BatchModel;
BatchDeploy.modelName = 'batchDeploy';

