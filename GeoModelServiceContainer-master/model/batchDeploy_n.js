/**
 * Author : 7b
 * Date : 2021/6/4
 * Description : NeDB for batchDeploy
 */

var ObjectId = require('bson').ObjectID;
const nedb = require('nedb');
var ModelBase = require('./modelBase_n');
var ParamCheck = require('../utils/paramCheck');
const setting = require('../setting');

function BatchDeploy(batchDeploy)
{
    if(batchDeploy != null) {
        if(batchDeploy._id){
            this._id = batchDeploy._id;
        }
        else {
            this._id = new ObjectId().toString();
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
        this._id = new ObjectId().toString();
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

const BatchDeployDB = new nedb({
    filename: setting.nedb.path + "batchDeploy",
    autoload: true
});

BatchDeploy.baseModel = BatchDeployDB;
BatchDeploy.modelName = 'batchDeploy';
