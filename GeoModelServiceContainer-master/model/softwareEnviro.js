var mongoose = require('./mongooseModel');

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');
var mongoModels = require('./mongoModels');

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
        this._id = new ObjectId();
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

// var SWESchema = new mongoose.Schema({
//     name : String,
//     version:String,
//     alias:Array,
//     description:String,
//     type:String,
//     publisher:String,
//     platform:String
//     // dependencies:Array
// },{collection:'softwareEnviro'});
// SWESchema.index({alias:'text',name:'text',version:'text',platform:'text'});
//
// var SWE = mongoose.model('softwareEnviro',SWESchema);
var SWE = mongoModels.softwareEnviro;
SoftwareEnviro.baseModel = SWE;
SoftwareEnviro.modelName = 'softwareEnviro';