/**
 * Created by Franklin on 16-4-9.
 * Remote Request Control
 */
var http = require('http');
var fs = require('fs');
var requestPromise = require('request-promise');
var j = require('request').jar();
var request = require('request').defaults({jar : j});

var setting = require('../setting');

function RemoteReqControl() {}

module.exports = RemoteReqControl;

//! get remote request
RemoteReqControl.getRequest = function (req, url, callback) {
    req.pipe(request.get(url, function (err, response, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    }));
};

//ʹ��requestģ�飬��post��ʽ����url�е����ݣ�post�ı���req��
RemoteReqControl.postRequest = function (req, url, callback) {
    req.pipe(request.post(url, function (err, response, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    }));
};

//ʹ��requestģ�飬��post��ʽ����url������form��
RemoteReqControl.postByServer = function (url, form, callback) {
    var options;
    if(form){
        options = {
            method:'POST',
            uri:url,
            body:form,
            json:true
        };
    }
    else{
        options = {
            uri:url,
            method:'POST'
        };
    }
    requestPromise(options)
        .then(function (res) {
            return callback(null,res);
        })
        .catch(function (err) {
            return callback(err);
        });
};

//ʹ��requestģ�飬��get��ʽ����url������form��
RemoteReqControl.getByServer = function (url, form, callback) {
    var options = {
        url:url,
        method:'GET',
        qs:form
    };
    requestPromise(options)
        .then(function (res) {
            return callback(null,res);
        })
        .catch(function (err) {
            return callback(err);
        });
};

RemoteReqControl.getRequestJSON = function (url, callback) {
    request.get(url,function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.postRequestJSON = function (url, callback) {
    request.post(url,function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.postRequestJSONWithFormData = function (url, form, callback) {
    request.post( { url : url, formData : form, jar : j}, function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.postRequestJSONWithForm = function (url, form, callback) {
    request.post( { url : url, form : form, jar : j}, function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.putRequestJSON = function (url, callback) {
    request.put(url,function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.deleteRequestJSON = function (url, callback) {
    request.delete(url,function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.getRequestPipe = function (res, url) {
    request.get(url).pipe(res);
};

RemoteReqControl.postDownload = function(url, form, path, callback){
    request.post(url,
        {form : form }
    ).pipe(fs.createWriteStream(path)).on('close', function(){
        return callback();
    });
};

RemoteReqControl.getDownload = function(url, path, callback){
    request.get(url).pipe(fs.createWriteStream(path)).on('close', function(){
        return callback();
    });
};

RemoteReqControl.ping = function(target, callback){
    request.get('http://' + target , function(error, response, body){
        if (error) {
            return callback({result : 'Err'});
        } else {
            return callback({result : 'OK'});
        }
    });
};

//ping请求伴随超时时间
RemoteReqControl.pingWithTimeOut = function(url,callback){
    request.get(url,{timeout:5000},function(error, response, body){
        if (error) {
            return callback({result : 'Err', end : Date.now()});
        } else {
            return callback({result : 'OK', end : Date.now()});
        }
    })
}

//post请求,数据请求格式为json
RemoteReqControl.postRequestJSONWithJSONData = function(url, jsonData, callback){
    request.post({url: url, json:true, body: jsonData, jar:j},function(err,response,data){
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    })
}
