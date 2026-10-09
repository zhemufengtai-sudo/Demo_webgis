/**
 * Created by Franklin on 2018/10/11.
 */

var fs = require('fs');
var xmlparse = require('xml2js').parseString;
var setting = require('../setting');

var AssemblyCtrl = function(){};

AssemblyCtrl.getAssemblies = function(callback){
    fs.readdir(setting.dirname + '/geo_dataMapping/', function(err, dirs){
        if(err){
            return callback(err);
        }
        var count = dirs.length;
        var assembies = [];
        var cb = function(index){
            return function(err, json){
                count --;
                if(err){
                    return;
                }
                try{
                    assembies.push({
                        name : json.AssemblyInfo.$.name,
                        platform : json.AssemblyInfo.$.platform,
                        version : json.AssemblyInfo.$.version
                    });
                }
                catch(e){
                    
                }
                if(count == 0){
                    return callback(null, assembies);
                }
            };
        };
        for(var i = 0; i < dirs.length; i++){
            fs.readFile(setting.dirname + '/geo_dataMapping/' + dirs[i] + '/config.xml', function(err, stream){
                if(err){
                    return count--;
                }
                if(stream){
                    xmlparse(stream, { explicitArray : false, ignoreAttrs : false }, cb(i));
                }
            });
        }
    });
}

module.exports = AssemblyCtrl;