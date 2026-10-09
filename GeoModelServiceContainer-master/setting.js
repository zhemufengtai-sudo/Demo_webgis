/**
 * Created by Franklin on 16-3-16.
 * The setting of the site
 */

var path = require('path');
var os = require('os');
var fs = require("fs");
var cfgPath = __dirname;

// 通用函数：从config.json读取指定路径的值，并提取默认值
function getConfigValue(keyPath, defaultValue) {
    try{
        const data = JSON.parse(fs.readFileSync(cfgPath + "/config.json", { encoding: 'utf8', flag: 'r' }));
        const keys = keyPath.split('.');
        let value = data;
        for (const key of keys) {
            value = value[key];
            if (value === undefined) break;
        }
        return value !== undefined ? value: defaultValue;
    } catch (ex) {
        return defaultValue;
    }
}

module.exports =  {
    version : "0.4.2",
    port: getConfigValue("port", "8060"),
    oid : '56f110136dde7f18b4cb2b87',
    platform : function(){
        if(os.platform() == 'win32'){
            return 1;
        }
        else if(os.platform() == 'linux'){
            return 2;
        }
        else if(os.platform() == 'darwin'){
            return 3;
        }
        else{
            return 0;
        }
    }(),
    crypto:{
        algorithm : 'aes-256-cbc',
        key : 'ae3e712c-ccdf-4964-b819-c85770146485'
    },
    db : 2, // 1 - MongoDB; 2 - NeDB
    mongodb : {
        name:'GeoModelContainerDB',
        username: 'OpenGMS',
        password: 'OpenGMS1qaz@wsx#edc',
        authSource: 'admin',
        host: getConfigValue("mongodb.host", "127.0.0.1"),
        port: getConfigValue("mongodb.port", "27017")
    },
    nedb : {
        path : function(){
            return path.dirname(process.execPath) + "/mscdb/";
        }()
    },
    socket:
    {
        host: getConfigValue("socket.host", "127.0.0.1"),
        port: getConfigValue("socket.port", "6001")
    },
    portal:
    {
        host: getConfigValue("portal.host", "222.192.7.75"),
        port: getConfigValue("portal.port", "80")
    },
    manager:{
        host: getConfigValue("manager.host", "222.192.7.75"),
        port: getConfigValue("manager.port", "80/managerServer")
    },
    maxins : 5,
    modelpath : __dirname + '/geo_model/',
    mappingPath: (function(){
        //! Release
        return path.dirname(process.execPath) + '/geo_dataMapping/';
        //! Debug
        // return __dirname + '/geo_dataMapping/';
    })(),
    dirname : (function(){
        //! Release
        return path.dirname(process.execPath);
        //! Debug
        // return __dirname;
    })(),
    //! TODO 
    visualizationpath : (function(){
        //! Release
        return path.dirname(process.execPath) + '/visualization/';
        //! Debug
        // return __dirname;
    })(),
    data_size : 1
};
