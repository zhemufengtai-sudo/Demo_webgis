/**
 * Author : 7b
 * Date : 2021/6/1
 * Description : NeDB for geoData
 */

const nedb = require('nedb');
const setting = require('../setting');
const ModelBase = require('./modelBase_n');
const ParamCheck = require('../utils/paramCheck');


const GeoDataDB = new nedb({
    filename: setting.nedb.path + "geodata",
    autoload: true
});

function GeoData(gd) {
    this.gd_id = '';
    this.gd_tag = '';
    this.gd_datetime = '';
    this.gd_type = '';
    this.gd_size = 0;
    this.gd_value = '';
    if(gd && gd.gd_id){
        this.gd_id = gd.gd_id;
    }
    if(gd && gd.gd_tag){
        this.gd_tag = gd.gd_tag;
    }
    if(gd && gd.gd_datetime){
        this.gd_datetime = gd.gd_datetime;
    }
    if(gd && gd.gd_type){
        this.gd_type = gd.gd_type;
    }
    if(gd && gd.gd_size){
        this.gd_size = gd.gd_size;
    }
    if(gd && gd.gd_value){
        this.gd_value = gd.gd_value;
    }
    return this;
}

GeoData.__proto__ = ModelBase;
GeoData.baseModel = GeoDataDB;
GeoData.modelName = "Geography Data";
module.exports = GeoData;

//获取数据
GeoData.getByKey = function (key, callback) {
    if(ParamCheck.checkParam(callback, key))
    {
        var where = { "gd_id" : key };
        this.getByWhere(where, callback);
    }
};

//更新数据
GeoData.updateByGdid = function(item, callback){
    if(ParamCheck.checkParam(callback, item)){
        var where = { "gd_id" : item.gd_id };
        this.updateByWhere(where, item, null, callback);
    }
}

//获取全部数据
GeoData.getAll = function(callback){
    var where = {};
    this.getByWhere(where, callback);
};

//删除数据记录
GeoData.remove = function (key, callback) {
    if(ParamCheck.checkParam(callback, key))
    {
        this.baseModel.remove({gd_id: key},this.returnFunction(callback, "Error in removing" + this.modelName));
    }
};

//获取全部Debug数据
GeoData.getAllDebugData = function(callback){
    var where = {"gd_size":-22};
    this.getByWhere(where, callback);
};

//删除Debug数据
GeoData.deleteDebugData = function (callback) {
    this.baseModel.remove({"gd_size":-22}, this.returnFunction(callback, "Error in removing debug data" + this.modelName));
}

