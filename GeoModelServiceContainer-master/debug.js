/**
 * Author: Fengyuan(Franklin) Zhang
 * Date: 2018/12/13
 * Description: Debugging for models
 */
var fs = require('fs');
var uuid = require('node-uuid');
// var ObjectId = require('mongodb').ObjectID;
var ObjectId = require('bson').ObjectID;
var MDLParser = require('./utils/mdlParser');
var ModelIns = require('./model/modelInstance');
var ModelInsCollection = require('./model/modelInsCollection');
var MsrCtrl = require('./control/modelSerRunControl');
var DataCtrl = require('./control/geoDataControl');
var FileOpera = require('./utils/fileOpera');
var Setting = require('./setting');

var DebugContainer = function(ip, port, guid, configData, mdlpath){
    
    var app = {};

    app.modelInsColl = new ModelInsCollection();

    global.tasks = [];

    //socket connection
    var socket = require('./socket/mc_socket');
    socket(app, ip, port);

    var finishedItems = {
        dataUploaded : false,
        processFinished : false,
        deletingFormerData : false
    };
    finishedItems.checking = function () {
        if(finishedItems.dataUploaded && finishedItems.processFinished && finishedItems.deletingFormerData){
            console.log('Init finished! Please debug at ' + ip + ' ' + port + ' ' + guid);
        }
    }

    global.app = app;

    fs.readFile(mdlpath, function (err, data) {
        if(err){
            return console.log('Error in parsing MDL!');
        }
        var mdl = new MDLParser();
        mdl.loadFromXMLStream(data, function(err, mdl){
            if(err){
                return console.log(err);
            }
            // Data Completion
            var states = mdl.Behavior.StateGroup.States;
            var inputData = [];
            var outputData = [];
            for (var k = 0; k < states.length; k++) {
                for (var i = 0; i < states[k].Events.length; i++) {
                    if (states[k].Events[i].type == 'noresponse') {
                        //! Output Data
                        var item = {
                            StateId: states[k].id,
                            StateName: states[k].name,
                            StateDes: states[k].description,
                            Event: states[k].Events[i].name,
                            Destroyed: false,
                            Tag: states[k].name + '-' + states[k].name,
                            DataId: ''
                        };
                        //add TimeData属性
                        item['TimeData'] = [];
                        outputData.push(item);
                    }
                    else if (states[k].Events[i].type == 'response') {
                        //! Input Data
                        inputData.push({
                            StateId: states[k].id,
                            StateName: states[k].name,
                            StateDes: states[k].description,
                            Event: states[k].Events[i].name,
                            Destroyed: false,
                            Tag: states[k].name + '-' + states[k].name,
                            Requested: false,
                            DataId: ''
                        });
                    }
                }
            }
            //! Delete all former debug data
            DataCtrl.deleteDebugData(function(err, result){
                if(err){
                    return console.log('Error in deleting debug data!');
                }
                console.log('Deleting former debug data finished!');
                finishedItems.deletingFormerData = true;
                finishedItems.checking();
                
                //! Start to config data
                fs.readFile(configData, function(err, data) {
                    if (err){
                        return console.log(err);
                    }

                    var lines = data.toString().split('\r\n');
                    
                    var inputDataConfig = [];
                    var savingDataCount = 0;

                    var cb = function (index){ 
                        savingDataCount ++;
                        return function (err, stats) {
                            if (err) {
                                return console.log('Can not find configuration data!');
                            }
                            //! moving data
                            FileOpera.copy(inputDataConfig[index].gd_tag, Setting.dirname + '/geo_data/' + inputDataConfig[index].gd_value, function(err, data) {
                                savingDataCount --;
                                if (err){
                                    return console.log('Error in saving data!');
                                }

                                if (savingDataCount == 0){
                                    console.log('Saveing data finished!');
                                    //! checking
                                    finishedItems.dataUploaded = true;
                                    finishedItems.checking();
                                }
                            });
                        }
                    }

                    for (var i = 0; i < lines.length; i++){
                        if (lines[i] == ''){
                            continue;
                        }
                        var params = lines[i].split('\t');
                        
                        var ext = params[2];
                        ext = ext.substr(ext.lastIndexOf('.') + 1).toLowerCase();
                        //生成数据ID
                        var gdid = 'gd_' + uuid.v1();
                        var fname = gdid + '.' + ext;

                        var type = 'RAW';
                        if (ext == 'zip') {
                            type = 'ZIP';
                        }
                        else if (ext == 'xml') {
                            type = 'XML';
                        }

                        var geodata = {
                            stateName : params[0],
                            event : params[1],
                            gd_id: gdid,
                            gd_tag: params[2],
                            gd_type: type,
                            gd_size: -22,
                            gd_value: fname
                        };

                        inputDataConfig.push(geodata);
                        
                        fs.stat(params[2], cb(i));
                    }

                    var datacount = 0;
                    var cb = function(index) {
                        datacount++;
                        return function(err, blsuc){
                            datacount--;
                            if(err){
                                return console.log("Error in post data : " + err.Message);
                            }
                            for (var i = 0; i < inputData.length; i++){
                                if (inputData[i].StateName == inputDataConfig[index].stateName && inputData[i].Event == inputDataConfig[index].event){
                                    inputData[i].DataId = inputDataConfig[index].gd_id;
                                }
                            }
                            if (datacount == 0){
                                //! Add or update model service record
                                MsrCtrl.getByGUID(guid, function(err, msr){
                                    if (msr != null){
                                        MsrCtrl.delete(msr._id, function(err, result) {
                                            if(err){
                                                console.log('Error in deleting debugging model service record!');
                                            }
                                        });
                                    }
                                    var date = new Date();
                                    //! Add new
                                    msr = {
                                        ms_id: new ObjectId().toString(),
                                        msr_ms: {
                                            ms_path : 'DebugModel\\',
                                            ms_model : {
                                                m_name : "Debug Model"
                                            }
                                        },
                                        msr_datetime: date.toLocaleString(),
                                        msr_span: 0,
                                        msr_user: {
                                            u_name : '[DEBUGGER]',
                                            u_ip : '127.0.0.1',
                                            u_type : 2
                                        },
                                        msr_guid: guid,
                                        msr_input: inputData,
                                        msr_output: outputData,
                                        msr_controlparams : [],
                                        msr_status: 0,
                                        msr_logs: [],
                                        m_logs:[],
                                        msr_runninginfo: {
                                            InvokeErr: "",
                                            StdOut: "",
                                            StdErr: ""
                                        }
                                    };
                                    MsrCtrl.save(msr, function(err, result) {
                                        if(err){
                                            return console.log('Error in insert model service record!');
                                        }
                                        
                                        var mis = {
                                            guid : guid,
                                            socket : null,
                                            ms : msr.msr_ms,
                                            log : [],
                                            input : msr.msr_input,
                                            output : msr.msr_output,
                                            event : '',
                                            Flag : 1,
                                            start : date.toLocaleString(),
                                            state : 'MC_READY',
                                            cp : msr.msr_controlparams
                                        };
                                        var modelIns = new ModelIns(mis);
                                        app.modelInsColl.addIns(modelIns);

                                        console.log('Processing finished!');

                                        //! checking
                                        finishedItems.processFinished = true;
                                        finishedItems.checking();
                                    })
                                    
                                });
                            }
                        };
                    };

                    for (var i = 0; i < inputDataConfig.length; i++){
                        DataCtrl.addData(inputDataConfig[i], cb(i));
                    }
                });
            });

        });
    })


}

module.exports = DebugContainer;
