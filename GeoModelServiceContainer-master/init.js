/**
 * Created by Franklin on 2017/5/8.
 */
var SysCtrl = require('./control/sysControl');
var FileOpera = require('./utils/fileOpera');
var LanguageCtrl = require('./control/languagesCtrl');
var Setting = require('./setting')

var Init = function(){
    console.log('Version: ' + Setting.version);

    console.log('Initializing...');

    var fields = [
        {
            name : 'portal_uname',
            value : 'username'
        },
        {
            name : 'portal_pwd',
            value : 'b48b962c9e87fc58c5841bbce6a47f61'
        },
        {
            name : 'adminName',
            // value : 'admin'
            value : 'openGMS'
        },
        {
            name : 'adminPwd',
            // value : 'e10adc3949ba59abbe56e057f20f883e'
            value : 'openGMSGeoModelServiceContainerCS'
        },
        {
            name : 'language',
            value : 'en.json'
        },
        {
            name : 'taskServer',
            value : '0.0.0.0:0'
        },
        {
            name : 'taskType',
            value : 0
        }
    ];

    var count_fields = 0;
    var pending_fields = (function(index){
        count_fields ++;
        return function(err, ss){
            count_fields --;
            if(err){

            }
            if(count_fields == 0){
                console.log('System fields checking finished!');
            }
        }
    });

    console.log('Checking system fields...');
    for(var i = 0; i < fields.length; i++){
        SysCtrl.buildField(fields[i].name, fields[i].value, pending_fields(i));
    }

    console.log('Checking directions...');
    var directions = [
        Setting.dirname + '/geo_data/',
        Setting.dirname + '/geo_model/',
        Setting.dirname + '/geo_model/packages/',
        Setting.dirname + '/geo_model/tmp/',
        Setting.dirname + '/public/tmp/',
        Setting.dirname + '/helper/',
        Setting.dirname + '/mscdb/'
    ];

    var count_directions = 0;
    var pending_directions = (function(index){
        count_directions ++;
        return function(err, ss){
            count_directions --;
            if(err){
                console.error('Failed to create directory: ' + directions[index], err);
            }
            if(count_directions == 0){
                console.log('Directions checking finished!');
            }
        }
    });

    for(var i = 0; i < directions.length; i++){
        FileOpera.BuildDir(directions[i], pending_directions(i));
    }

    console.log('Checking language config...');
    LanguageCtrl.updateLanguage('en.json', function(err, result){
        if(err){
            return console.log('Error in initailizing language configuration!');
        }
        console.log('Initailizing language configuration finished!');
    });
    //服务容器每次启动时，检查容器注册ip是否发生变化，有变化的话强制性向门户发送请求更新
    console.log('Checking Machine IP...');
    SysCtrl.checkMachineIP(function(data){
        let result = JSON.parse(data);
        if(result.status == -1){
            console.log('Error in connecting to the database!');
            return ;
        }else if(result.status == 0){
            console.log('Initalizing Machine IP checked finished!');
            return ;
        }else if(result.status == 1){
            console.log('Machine IP has changed, waiting to change Machine IP!');
            SysCtrl.getPortalToken(function(err,token){
                if(err){
                    console.log('Error in connecting to the database!');
                    return ;
                }
                let portal_uname = token['portal_uname'];
                let portal_pwd = token['portal_pwd'];
                //update server
                SysCtrl.updateServer(portal_uname,portal_pwd,function(err,msg){
                    if(err){
                        console.log('Error in Update the IP in the database!');
                        return ;
                    }
                    if(msg.result == 'suc'){
                        console.log('Initalizing Machine IP checked finished!');
                    }else{
                        console.log('Error in Update the IP in the database, Please check the connection with Portal!');
                    }
                })
            })
        }
    })
};

module.exports = Init;
