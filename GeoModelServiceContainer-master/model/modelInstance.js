/**
 * Created by Franklin on 2016/8/3.
 * Model for ModelInstace
 */

var CommonMethod = require('../utils/commonMethod');
var FileOpera = require('../utils/fileOpera');
var Setting = require('../setting');

function ModelInstance(mis) {
    if(mis == null)
    {
        this.guid = '';
        this.socket = null;
        this.ms = null;
        this.input = null;
        this.output = null;
        this.log = [];
        this.start = null;
        this.state = null;
        this.event = null;
        this.processParams = [];
        this.controlParams = {};

        this._pause = false;
        /** Status Type
         * RUNNING - 正常运行
         * REQUESTING - 索取数据
         * HANGING - 用户挂起
         */
        this._status = 'RUNNING';
        this._statusDes = '';
        this._message = [];
    }
    else
    {
        this.guid = mis.guid;
        this.socket = mis.socket;
        this.ms = mis.ms;
        this.input = mis.input;
        this.output = mis.output;
        this.log = mis.log;
        this.start = mis.start;
        this.state = mis.state;
        this.event = mis.event;
        this.processParams = [];
        if(mis.cp == undefined || mis.cp == null){
            this.controlParams = {};
        }
        else{
            this.controlParams = mis.cp;
        }

        this._pause = false;
        this._status = 'RUNNING';
        this._statusDes = '';
        this._message = [];
    }
    return this;
}

////////////////! Property Interfaces

ModelInstance.prototype.setState = function(state){
    this.state = state;
}

ModelInstance.prototype.setEvent = function(event){
    this.event = event;
}

ModelInstance.prototype.setStatus = function(status, description){
    this._status = status;
    this._statusDes = description;
}

ModelInstance.prototype.getStatus = function(){
    return this._status;
}

ModelInstance.prototype.getStatusDes = function(){
    return this._statusDes;
}

ModelInstance.prototype.updateInputData = function(data){
    for(var i = 0; i < data.length; i++){
        for(var j = 0; j < this.input.length; j++){
            if(data[i].StateName == this.input[j].StateName && data[i].Event == this.input[j].Event){
                this.input[j].DataId = data[i].DataId;
            }
        }
    }
};

ModelInstance.prototype.getBreifCopy = function(){
    return {
        ms : this.ms,
        guid : this.guid,
        start : this.start,
        state : this.state,
        event : this.event,
        pause : this._pause,
        status : this._status,
        statusDes : this._statusDes
    };
}

ModelInstance.prototype.getCopy = function(){
    return {
        ms : this.ms,
        guid : this.guid,
        socket : null,
        input : this.input,
        output : this.output,
        log : this.log,
        start : this.start,
        state : this.state,
        event : this.event,
        message : this._message,
        pause : this._pause,
        status : this._status,
        statusDes : this._statusDes,
        processParams : this.processParams,
        controlParams : this.controlParams
    };
}

ModelInstance.prototype.setProcessParams = function(paramsBuffer){
    try{
        var params = CommonMethod.deepClone(JSON.parse(paramsBuffer));
        params = {
            PARAMS : params,
            DATETIME : new Date()
        }
        this.processParams.push(params);
        return 1;
    }
    catch(ex){
        return -1;
    }
}

ModelInstance.prototype.setControlParams = function(paramsBuffer){
    try{
        this.controlParams = CommonMethod.deepClone(JSON.parse(paramsBuffer));
        return 1;
    }
    catch(ex){
        return -1;
    }
}

ModelInstance.prototype.initControlParams = function(){

    this.pushMessage('{InitControlParams Notified}');
}

ModelInstance.prototype.clearTempData = function(){
    var datapath = Setting.dirname + '/geo_model/' + this.ms.ms_path + 'instance/' + this.guid + '/';
    try {
        FileOpera.rmdir(datapath);
    } catch (error) {
        return -1;
    }
    
}

////////////////! Actions

//important!!log
ModelInstance.prototype.pushMessage = function(msg){
    this._message.push(msg);
    this.sendMessage();
};

ModelInstance.prototype.sendMessage = function(){
    if(!this._pause){
        for(var i = 0; i < this._message.length; i++){
            this.socket.write(this._message[i]);
        }
        this._message = [];
    }
};

ModelInstance.prototype.pause = function(statusType, statusDes){
    if(statusType == undefined){
        statusType = 'HANGING'
    }
    if(statusDes == undefined){
        statusDes = '';
    }
    this.setStatus(statusType, statusDes);
    this._pause = true;
};

ModelInstance.prototype.kill = function(){
    this.socket.write('{kill}');
}

ModelInstance.prototype.resume = function(){
    this._pause = false;
    this._status = 'RUNNING';
    this._statusDes = '';
    this.sendMessage();
};

module.exports = ModelInstance;