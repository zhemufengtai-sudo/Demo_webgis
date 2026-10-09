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

const HardwareEnviroDB = new nedb({
    filename: setting.nedb.path + "hardwareEnviro",
    autoload: true
});

function HardwareEnviro(swe){
    if(swe){
        this._id = swe._id;
        this.name = swe.name;
        this.value = swe.value;
    }
    else{
        this._id = new ObjectId();
        this.name = '';
        this.value = '';
    }
}

HardwareEnviro.__proto__ = ModelBase;
module.exports = HardwareEnviro;

HardwareEnviro.baseModel = HardwareEnviroDB;
HardwareEnviro.modelName = 'hardwareEnviro';

