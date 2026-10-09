var Request = require('request');
var fs = require('fs');
var QueryString = require('querystring');
var CommonMethod = require('./utils/commonMethod');

var languages = [
    // {
    //     "Name" : "German",
    //     "Config" : "de"
    // },
    // {
    //     "Name" : "Japanese",
    //     "Config" : "jp"
    // },
    // {
    //     "Name" : "French",
    //     "Config" : "fra"
    // },
    // {
    //     "Name" : "Spanish",
    //     "Config" : "spa"
    // },
    // {
    //     "Name" : "Russian",
    //     "Config" : "ru"
    // },
    // {
    //     "Name" : "Dutch",
    //     "Config" : "nl"
    // },
    {
        "Name" : "Chinese",
        "Config" : "zh"
    }
];

var appid = '20161031000031093';
var salt = (new Date).getTime().toString();
var key = 'hUgtVnLwO1zuB4wU4_oF';
var from = 'en';

var jsEn = fs.readFileSync('./public/languages/en.json');
jsEn = JSON.parse(jsEn);
var propertys = Object.keys(jsEn);
var props = [];

function InsertProps(obj, keys){
    for(var i = 0; i < keys.length; i++){
        if(typeof obj[keys[i]] == 'object'){
            propertys = Object.keys(obj[keys[i]]);
            InsertProps(obj[keys[i]], propertys);
        }
        else{
            props.push(obj[keys[i]]);
        }
    }
}

InsertProps(jsEn, propertys);

props.splice(0, 1);
var query = props.join('\n');

var cfgIndex = 0;
function SetProps(jsNew, values){
    var propertys = Object.keys(jsNew);
    for(var i = 0; i < propertys.length; i++){
        if(typeof jsNew[propertys[i]] == 'object'){
            SetProps(jsNew[propertys[i]], values);
        }
        else{
            jsNew[propertys[i]] = values.trans_result[cfgIndex].dst;
            cfgIndex ++;
        }
    }
}

var pending = (function(index){
    return function(err, data){
        if(err){
        }
        var resJson = JSON.parse(data.body);
        var jsNewConfig = jsEn;

        cfgIndex = 0;
        SetProps(jsNewConfig, resJson);
         
        fs.writeFile(__dirname + '/public/languages/' + languages[index].Config + '.json', JSON.stringify(jsNewConfig), function(err, result){
            if(!err){
                console.log('Language : ' + languages[index].Name + ' configuration has been built!');
            }
        });

    }
});

for(var i = 0; i < languages.length; i++){
    var query_t = languages[i].Name + '\n' + query;
    var sign = appid + query_t + salt + key;
    sign = CommonMethod.md5(sign);
    var to = languages[i].Config;
    var queryJson = {
        q: query_t,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
    };
    var qString = QueryString.stringify(queryJson);
    
    Request.get('http://api.fanyi.baidu.com/api/trans/vip/translate?' + qString, pending(i));
}



