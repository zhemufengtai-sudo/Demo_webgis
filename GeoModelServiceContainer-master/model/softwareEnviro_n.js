/**
 * Author : 7b
 * Date : 2021/6/1
 * Description : NeDB for software environment
 */

const nedb = require('nedb');
const setting = require('../setting');
const ModelBase = require('./modelBase_n');
const ParamCheck = require('../utils/paramCheck');
const ObjectId = require('bson').ObjectID;

const SoftwareEnviroDB = new nedb({
    filename: setting.nedb.path + "softwareEnviro",
    autoload: true
});

function SoftwareEnviro(swe) {
    if(swe){
        this._id = swe._id;
        this.name = swe.name;
        this.version = swe.version;
        this.alias = swe.alias;
        this.des = swe.des;
        this.type = swe.type;
        this.publisher = swe.publisher;
        this.platform = swe.platform;
        // this.dependencies = swe.dependencies;
    }
    else{
        this._id = new ObjectId().toString();
        this.name = '';
        this.version = '';
        this.alias = [];
        this.des = '';
        this.type = '';
        this.publisher = '';
        this.platform = '';
        // this.dependencies = [];
    }
}

SoftwareEnviro.__proto__ = ModelBase;
module.exports = SoftwareEnviro;

SoftwareEnviro.baseModel = SoftwareEnviroDB;
SoftwareEnviro.modelName = 'softwareEnviro';






