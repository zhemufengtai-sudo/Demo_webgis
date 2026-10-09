/**
 * Created by Franklin on 2017/7/1.
 */
var fs = require('fs');
// var SystemSettingModel = require('../model/systemSetting');
// var SystemSettingModel = require('../model/systemSetting_n');
var SystemSettingModel = require('../model/dbSwitcher').systemSetting;
var Setting = require('../setting');

var LanguageCtrl = function (){}

LanguageCtrl.getAllLanguageConfig = function(callback){
    var path = __dirname + '/../public/languages/';
    fs.readdir(path, function(err, files){
        if(err){
            return callback(err);
        }
        var langConfigs = [];
        files.forEach(function(item){
            var languagesJson = fs.readFileSync(path + item);
            try{
                languagesJson = JSON.parse(languagesJson);
                languagesJson['File'] = item;
                langConfigs.push(languagesJson);
            }
            catch(ex){
                return callback(ex);
            }
        });

        var configs = [];

        for(var i = 0; i < langConfigs.length; i++){
            if(langConfigs[i].ConfigName){
                configs.push({
                    ConfigName : langConfigs[i].ConfigName,
                    File : langConfigs[i].File,
                    SelectButton : langConfigs[i].SelectButton
                });
            }
        }

        return callback(null, configs);
    });
};

LanguageCtrl.updateLanguage = function(file, callback){
    try{
        var path = __dirname + '/../public/languages/';
        var path = path + file;
        var configLanguage = fs.readFileSync(path);
        configLanguage = JSON.parse(configLanguage);
        // global.configLanguage = configLanguage;
        global.LanguageConfig = configLanguage;
        return callback(null, true);
    }
    catch(ex){
        return callback(ex);
    }
}

LanguageCtrl.getCurrentSetting = function(callback){
    SystemSettingModel.getValueByIndex('language', function(err, ss){
        if(err){
            return callback(err);
        }
        if(ss){
            return callback(null, ss.ss_value);
        }
        return callback(null, null);
    });
};

LanguageCtrl.setCurrentSetting = function(language, callback){
    var ss = {
        ss_index : "language",
        ss_value : language
    }
    SystemSettingModel.setValueByIndex(ss, function(err, result){
        if(err){
            return callback(err);
        }
        if(result.n == 1){
            LanguageCtrl.updateLanguage(language, function(err, retult){
                if(err){
                    return callback(err);
                }
                return callback(null, result);
            });
        }
        return callback(null, result);
    });
};

LanguageCtrl.init = function(){
    LanguageCtrl.getCurrentSetting(function(err, file){
        
    });
};

module.exports = LanguageCtrl;