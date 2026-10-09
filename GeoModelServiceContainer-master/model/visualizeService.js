var mongoose = require('./mongooseModel');
var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
var ModelBase = require('./modelBase');
var xmlparse = require('xml2js').parseString;
var ParamCheck = require('../utils/paramCheck');
var mongoModels = require('./mongoModels');

function VisualizeService(vser){
    if(vser){
        this._id = vser._id;
        this.vs_model = vser.vs_model;
        this.vs_user = vser.vs_user;
        this.vs_update = vser.vs_update;
        this.vs_path = vser.vs_path;
        this.vs_status = vser.vs_status;
        this.vs_source = vser.vs_source;
        this.vs_limited = vser.vs_limited;
        this.vs_img = vser.vs_img;
        this.vs_des = vser.vs_des;
    }else{
        this._id = new ObjectId();
        this.vs_model = '';
        this.vs_user = '';
        this.vs_update = '';
        this.vs_path = '';
        this.vs_status = 0;
        this.vs_source = 0;
        this.vs_limited = 0;
        this.vs_des = '';
    }
}

VisualizeService.__proto__ = ModelBase;
module.exports = VisualizeService;

// var vsSchema = new mongoose.Schema({
//     vs_model : mongoose.Schema.Types.Mixed,
//     vs_user : mongoose.Schema.Types.Mixed,
//     vs_update: String,
//     vs_path: String,
//     vs_status: Number,            //可视化服务的状态，可用还是不可用
//     vs_source: Number,            //说明是本地上传的可视化服务还是远程拉取下来的服务,0本地，1为远程
//     vs_limited: Number,
//     vs_img: String,
//     vs_des: String              //可视化描述
// },{collection:'visualizeservice'});
//
// var VS = mongoose.model('visualizeservice',vsSchema);
var VS = mongoModels.visualizeservice;
VisualizeService.baseModel = VS;
VisualizeService.modelName = "visualize service";

//模仿模型服务获取进行可视化服务资源的获取
VisualizeService.getAll = function(flag, callback){
     if(ParamCheck.checkParam(callback,flag)){
         var where = {};
         if(flag == 'ALL'){
             where = {};
         }
         else{
             where = {vs_status : {$ne : -1}};
         }
         VS.find(where, this.returnFunction(callback, 'Error in getting all visualize service'));
     }
};

//根据路径读取可视化服务的配置文件
VisualizeService.readConfigByPath = function(path, callback) {
    var configPath = path;
    if(configPath == null){
        return callback(new Error('Error!'));
    }
    fs.readFile(configPath, function(err,data){
        if(err){
            console.log('Error in read config file : ' + err);
            return callback(err);
        }

        var cfg = xmlparse(data, {explicitArray : false, ignoreAttrs : false},function(err, json){
            if(err){
                console.log("Error in parse config file : " + err);
                return callback(err);
            }
            return callback(null,json);
        });
    });
};