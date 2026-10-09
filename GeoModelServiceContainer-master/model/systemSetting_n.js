/**
 * Author : 7b
 * Date : 2021/5/31
 * Description : NeDB for system setting
 */

const nedb = require('nedb');
const setting = require('../setting');
const ModelBase = require('./modelBase_n');
const ParamCheck = require('../utils/paramCheck');


const SystemSettingDB = new nedb({
    filename: setting.nedb.path + "systemsetting",
    autoload: true
});

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
SystemSetting.modelName = 'system setting';
SystemSetting.baseModel = SystemSettingDB;
module.exports = SystemSetting;

SystemSetting.prototype.save = function(callback){
    var ss = {
        ss_index : this.ss_index,
        ss_value : this.ss_value
    };
    SystemSettingDB.insert(ss, function (err, result) {
        if(err){
            return callback(err);
        }
        return callback(null, result)
    })
};

SystemSetting.getValueByIndex = function(ss_index, callback) {
    SystemSettingDB.findOne({'ss_index':ss_index},function (err, data) {
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
    SystemSettingDB.update(where, toUpdate, function(err, res){
        if(err){
            return callback(err);
        }
        return callback(null, res);
    });
};
