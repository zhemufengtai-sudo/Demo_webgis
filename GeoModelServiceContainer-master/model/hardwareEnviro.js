/**
 * Created by Administrator on 4.19.
 */

var mongoose = require('./mongooseModel');

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');
var mongoModels = require('./mongoModels');

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

// var HWESchema = new mongoose.Schema({
//     name : String,
//     value:String
// },{collection:'hardwareEnviro'});
// HWESchema.index({name:'text',value:'text'});
//
// var HWE = mongoose.model('hardwareEnviro',HWESchema);
var HWE = mongoModels.hardwareEnviro;
HardwareEnviro.baseModel = HWE;
HardwareEnviro.modelName = 'hardwareEnviro';
