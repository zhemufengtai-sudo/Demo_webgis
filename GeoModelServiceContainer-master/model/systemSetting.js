/**
 * Created by Franklin on 16-4-9.
 * Model for SystemSetting
 */
var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var mongoModels = require('./mongoModels');

function SystemSetting(ss) {
    if(ss){
        this.ss_index = ss.ss_index;
        this.ss_value = ss.ss_value;
    }
    else{
        this.ss_index = '';
        this.ss_value = '';
    }
}
SystemSetting.__proto__ = ModelBase;
SystemSetting.ModelName = 'system setting';

module.exports = SystemSetting;

// var SystemSettingSchema = new mongoose.Schema({
//     ss_index : String,
//     ss_value : String
// },{collection:'systemsetting'});
// var SystemSettingModel = mongoose.model('systemsetting',SystemSettingSchema);
var SystemSettingModel = mongoModels.systemsetting;
SystemSetting.baseModel = SystemSettingModel;
SystemSetting.modelName = "SystemSetting";

SystemSetting.prototype.save = function(callback){
    var ss = {
        ss_index : this.ss_index,
        ss_value : this.ss_value
    };
    ss = new SystemSettingModel(ss);
    ss.save(function(err, result){
        if(err){
            return callback(err);
        }
        return callback(null, result)
    });
};

SystemSetting.getValueByIndex = function(ss_index, callback) {
    SystemSettingModel.findOne({'ss_index':ss_index},function (err, data) {
        if(err)
        {
            console.log('mongoDB err in query!');
            return callback(err);
        }
        data = JSON.parse(JSON.stringify(data));
        return callback(null, data);
    });
};

SystemSetting.setValueByIndex = function(item, callback) {
    var where = {'ss_index':item.ss_index},
        toUpdate = item;
    SystemSettingModel.update(where, toUpdate, function(err, res){
        if(err){
            return callback(err);
        }
        return callback(null, res);
    });
};
