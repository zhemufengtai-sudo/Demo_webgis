/**
 * Author : 7b
 * Date : 2021/6/4
 * Description : NeDB for visualize service
 */

var ObjectId = require('bson').ObjectID;
const nedb = require('nedb');
var fs = require('fs');
var ModelBase = require('./modelBase_n');
var xmlparse = require('xml2js').parseString;
var ParamCheck = require('../utils/paramCheck');
const setting = require('../setting');

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
        this._id = new ObjectId().toString();
        this.vs_model = '';
        this.vs_user = '';
        this.vs_update = '';
        this.vs_path = '';
        this.vs_status = 0;
        this.vs_source = 0;
        this.vs_limited = 0;
        this.vs_img = '';
        this.vs_des = '';
    }
}

VisualizeService.__proto__ = ModelBase;
module.exports = VisualizeService;

const VS = new nedb({
    autoload: true
});

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