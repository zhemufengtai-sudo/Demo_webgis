/**
 * Created by SCR on 2017/6/10.
 */
var fs = require('fs');
var setting = require('../setting');
var FileOpera = require('../utils/fileOpera');
var GeoDataCtrl = require('./geoDataControl');
// var ModelSerRunModel = require('../model/modelSerRun');
// var ModelSerRunModel = require('../model/modelSerRun_n');
var ModelSerRunModel = require('../model/dbSwitcher').modelSerRun;
var XMLWriter = require('xml-writer');
// var ModelSerModel = require('../model/modelService');
// var ModelSerModel = require('../model/modelService_n');
var ModelSerModel = require('../model/dbSwitcher').modelService;
var xmlparse = require('xml2js').parseString;
var uuid = require('node-uuid');

var testifyCtrl = function () {
};

module.exports = testifyCtrl;

//添加默认测试数据到数据库，判断Default文件夹

testifyCtrl.addDefaultTestify = function (msid, getInputData, callback) {
    if (!callback) {
        callback = function () { };
    }
    var testifyRoot = setting.dirname + '/geo_model/' + msid + '/testify';
    var configPath = setting.dirname + '/geo_model/' + msid + '/testify/config.json';
    var configData;
    fs.stat(configPath, function (err, stat) {
        if (err) {
            if (err.code = 'ENOENT') {
                configData = '[]';
            }
            else {
                return callback()
            }
        }
        else if (stat) {
            configData = fs.readFileSync(configPath).toString();
        }
        var configJSON = JSON.parse(configData);
        for (var i = 0; i < configJSON.length; i++) {
            if (configJSON[i].tag == 'default') {
                //已经生成过默认测试数据
                return callback();
            }
        }
        //得到testify一级目录下的所有xml
        FileOpera.getAllFiles(testifyRoot, '.xml', function (files) {
            getInputData(msid, function (err, states) {
                if (err) {
                    return callback();
                }
                var newTestify = {
                    tag: 'default',
                    detail: '',
                    path: '',
                    inputs: []
                };
                var geodataList = [];
                //针对博文的所有测试数据都是input的情况
                if (states.length == 1 && states[0].$.name == 'RUNSTATE') {
                    var stateID = states[0].$.id;
                    var events = states[0].Event;
                    for (var i = 0; i < events.length; i++) {
                        if (events[i].$.name == 'LOADDATASET' && events[i].$.type == 'response') {
                            for (var j = 0; j < files.length; j++) {
                                if (files[j] == 'input.xml') {
                                    //复制文件
                                    var gdid = 'gd_' + uuid.v1();
                                    var fname = gdid + '.xml';
                                    var geo_data_Path = setting.dirname + '/geo_data/' + fname;
                                    var gd_value = fs.readFileSync(testifyRoot + '/input.xml').toString();
                                    fs.writeFileSync(geo_data_Path, gd_value);
                                    //向config.json中添加记录
                                    newTestify.inputs.push({
                                        DataId: gdid,
                                        Event: events[i].$.name,
                                        Optional: events[i].$.optional,
                                        StateId: stateID
                                    });

                                    var stat = fs.statSync(geo_data_Path);
                                    var geodata;
                                    if (stat.size - 16 > setting.data_size) {
                                        geodata = {
                                            gd_id: gdid,
                                            gd_tag: '',
                                            gd_type: 'FILE',
                                            gd_value: fname
                                        };
                                    }
                                    else {
                                        geodata = {
                                            gd_id: gdid,
                                            gd_tag: '',
                                            gd_type: 'STREAM',
                                            gd_value: gd_value
                                        }
                                    }
                                    geodataList.push(geodata);
                                }
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < states.length; i++) {
                        var stateID = states[i].$.id;
                        var events = states[i].Event;
                        for (var j = 0; j < events.length; j++) {
                            for (var k = 0; k < files.length; k++) {
                                if (events[j].$.name + '.xml' == files[k] && events[j].$.type == 'response') {
                                    //复制文件
                                    var gdid = 'gd_' + uuid.v1();
                                    var fname = gdid + '.xml';
                                    var geo_data_Path = setting.dirname + '/geo_data/' + fname;
                                    var gd_value = fs.readFileSync(testifyRoot + '/' + files[i]).toString();
                                    fs.writeFileSync(geo_data_Path, gd_value);
                                    //向config.json中添加记录
                                    newTestify.inputs.push({
                                        DataId: gdid,
                                        Event: events[j].$.name,
                                        Optional: events[j].$.optional,
                                        StateId: stateID
                                    });

                                    var stat = fs.statSync(geo_data_Path);
                                    var geodata;
                                    if (stat.size - 16 > setting.data_size) {
                                        geodata = {
                                            gd_id: gdid,
                                            gd_tag: '',
                                            gd_type: 'FILE',
                                            gd_value: fname
                                        };
                                    }
                                    else {
                                        geodata = {
                                            gd_id: gdid,
                                            gd_tag: '',
                                            gd_type: 'STREAM',
                                            gd_value: gd_value
                                        }
                                    }
                                    geodataList.push(geodata);
                                }
                            }
                        }
                    }
                }
                var addFile = function (i) {
                    //向redis中添加记录
                    GeoDataCtrl.addData(geodataList[i], function (err, rst) {
                        if (err) {
                            return callback()
                        }
                        else {
                            if (i < geodataList.length - 1) {
                                addFile(i + 1);
                            }
                            else {
                                if (geodataList.length == 0) {
                                    fs.writeFileSync(configPath, '[]');
                                }
                                else {
                                    //没有出错在向config.json中添加记录
                                    configJSON.push(newTestify);
                                    fs.writeFileSync(configPath, JSON.stringify(configJSON));
                                }
                                return callback();
                            }
                        }
                    });
                };
                if (geodataList.length)
                    addFile(0);
                else
                    callback();
            });
        });
    });
};

//添加测试数据功能
testifyCtrl.addTestify = function (msrid, testifyData, callback) {
    ModelSerRunModel.getByOID(msrid, function (err, msr) {
        if (err) {
            return callback(err);
        }
        var testifyDataRoot = setting.dirname + '/geo_model/' + msr.msr_ms.ms_path + 'testify';
        var newTestify = testifyDataRoot + '/' + testifyData.filename;
        try {
            fs.mkdirSync(newTestify);
        } catch (e) {
            if (e.code != 'EEXIST')
                return callback(err);
        }

        var count = 0;
        var polling = function (index) {
            count++;
            return function (err, result) {
                count--;
                if (err) {
                    return callback(err);
                } else {
                    //进行处理
                    var ext = result.gd_value.substr(result.gd_value.lastIndexOf('.') + 1);
                    var srcPath = setting.dirname + '/geo_data/' + msr.msr_input[index].DataId + '.' + ext;
                    var dstPath = newTestify + '/' + msr.msr_input[index].DataId + '.' + ext;
                    try {
                        if (fs.existsSync(srcPath)) {
                            fs.writeFileSync(dstPath, fs.readFileSync(srcPath));
                        }
                    } catch (e) {
                        callback(e);
                    }
                    xw.startElement('Item');
                    xw.writeAttribute('State', msr.msr_input[index].StateId);
                    xw.writeAttribute('Event', msr.msr_input[index].Event);
                    var type = 'FILE';
                    if (ext == 'zip') {
                        type = 'ZIP';
                    } else if (ext == 'xml') {
                        type = 'XML';
                    }
                    xw.writeAttribute('Type', type);
                    xw.writeAttribute('File', msr.msr_input[index].DataId + '.' + ext);
                    xw.endElement();
                }
                if (count == 0) {
                    xw.endElement();
                    xw.endDocument();
                    //生成config.xml配置文件
                    var configPath = newTestify + '/' + 'config.xml';
                    fs.stat(configPath, function (err, stat) {
                        //判断是否已经存在该文件
                        if (stat && !err) {
                            console.log(fs.readFileSync(configPath).toString());
                        } else if (err.code = 'ENOENT') {
                            fs.writeFile(configPath, xw.toString(), function (err) {
                                if (err) {
                                    console.log(err);
                                    return callback(err);
                                }
                                callback(null, { suc: true, status: 1 });
                            })

                        } else {
                            callback(err);
                        }
                    })
                }
            }
        };
        var xw = new XMLWriter;
        xw.startDocument('1.0', 'UTF-8');
        xw.startElement('DebugData');
        xw.writeAttribute('tag', testifyData.tag);
        xw.writeAttribute('detail', testifyData.detail);
        xw.writeAttribute('Title', testifyData.filename);
        //进行for循环
        for (let i = 0; i < msr.msr_input.length; i++) {
            if (msr.msr_input[i].DataId != "") {
                GeoDataCtrl.getByKey(msr.msr_input[i].DataId, polling(i));
            } else {
                continue;
            }
        }
    })
};

//modified by wangming at 2018/10/17
testifyCtrl.getTestify = function (msid, callback) {
    //根据模型服务id获取模型包路径
    var rst;
    ModelSerModel.getByOID(msid, function (err, msr) {
        if (err) {
            return callback(err);
        }
        if (msr == null) {
            let message = { message: 'The model Service Id maybe error' };
            return callback(message);
        }
        var testifyPath = setting.dirname + '/geo_model/' + msr.ms_path + 'testify';
        var configFileContent = [];
        //得到testify一级目录下的所有文件夹，这就意味着得到了几个测试数据
        FileOpera.getAllFolder(testifyPath, function (filefolders) {
            //开始进行for循环，其中当文件名为Default的文件夹单独处理
            for (var i = 0; i < filefolders.length; i++) {
                var configPath = testifyPath + '/' + filefolders[i] + '/config.xml';
                try {
                    var filestat = fs.statSync(configPath);
                    var data = fs.readFileSync(configPath);
                    //同步代码
                    xmlparse(data, { explicitArray: false, ignoreAttrs: false }, function (err, json) {
                        if (err) {
                            return callback(err);
                        }
                        //新建object转json，以便于后台处理展示
                        var objectToJsonData = {
                            tag: '',
                            detail: '',
                            title: ''
                        };
                        objectToJsonData.inputs = [];
                        objectToJsonData.tag = json.DebugData.$.tag;
                        objectToJsonData.detail = json.DebugData.$.detail;
                        objectToJsonData.title = json.DebugData.$.Title;
                        var stateItem = json.DebugData;
                        if (stateItem.Item instanceof Array) {
                            for (var j = 0; j < stateItem.Item.length; j++) {
                                objectToJsonData.inputs.push({
                                    DataId: stateItem.Item[j].$.File,
                                    StateId: stateItem.Item[j].$.State,
                                    Event: stateItem.Item[j].$.Event
                                });
                            }
                        } else {
                            objectToJsonData.inputs.push({
                                DataId: stateItem.Item.$.File,
                                StateId: stateItem.Item.$.State,
                                Event: stateItem.Item.$.Event
                            });
                        }

                        //将这一个测试数据所得结果push到configFileContent之中
                        configFileContent.push(objectToJsonData);
                    })
                } catch (e) {
                    if (e.code == 'ENOENT') {
                        // rst = { status: 0, testifies: [] };
                        continue;
                    } else {
                        // rst = { status: -1, testifies: [] };
                        continue;
                    }
                }

            }
            return callback(null, configFileContent);
        })
    })
};

testifyCtrl.loadTestify = function (msid, testifyPath, callback) {
    ModelSerModel.getByOID(msid, function (err, msr) {
        if (err) {
            return callback(err);
        }
        // var dataOldPath = setting.modelpath + msr.ms_path + 'testify/' + testifyPath;
        var dataOldPath = setting.dirname + '/geo_model/' + msr.ms_path + 'testify/' + testifyPath;
        var configXmlPath = dataOldPath + '/config.xml';
        var configFileContent = [];
        var geodataList = [];
        //获取config.xml信息
        try {
            var filestat = fs.statSync(configXmlPath);
        } catch (e) {
            if (e.code == 'ENOENT') {
                return callback(null, []);
            } else {
                let message = { message: 'File System Internal Error!' };
                return callback(message);
            }
        }
        var data = fs.readFileSync(configXmlPath);
        xmlparse(data, { explicitArray: false, ignoreAttrs: false }, function (err, json) {
            if (err) {
                return callback(err);
            }
            var eventInputs = {
                inputs: []
            };
            var stateItem = json.DebugData;
            if (stateItem.Item instanceof Array) {
                for (var j = 0; j < stateItem.Item.length; j++) {
                    var testdataPath = dataOldPath + '/' + stateItem.Item[j].$.File;
                    try {
                        var filestat = fs.statSync(testdataPath);
                    } catch (e) {
                        if (e.code == 'ENOENT') {
                            return callback(null, []);
                        } else {
                            let message = { message: 'File System Internal Error!' };
                            return callback(message);
                        }
                    }
                    //进行文件拷贝，将数据放置到geo_data目录之下,并存储到数据库(考虑抽出来作为一个函数)
                    var ext = testdataPath.substr(testdataPath.lastIndexOf('.') + 1);
                    var type = 'FILE';
                    if (ext == 'zip') {
                        type = 'ZIP';
                    } else if (ext == 'xml') {
                        type = 'XML';
                    }
                    //生成数据id
                    var gdid = "gd_" + uuid.v1();
                    var fname = gdid + '.' + ext;
                    var geo_data_Path = setting.dirname + '/geo_data/' + fname;
                    var gd_tag = stateItem.Item[j].$.File;
                    //同步进行文件拷贝
                    fs.writeFileSync(geo_data_Path, fs.readFileSync(testdataPath));
                    //添加记录信息
                    eventInputs.inputs.push({
                        DataId: gdid,
                        StateId: stateItem.Item[j].$.State,
                        Event: stateItem.Item[j].$.Event,
                        DataName: gd_tag
                    });
                    var stats = fs.statSync(geo_data_Path);
                    //存入数据库
                    var geodata = {
                        gd_id: gdid,
                        gd_tag: gd_tag,
                        gd_type: type,
                        gd_size: stats.size - 16,
                        gd_value: fname
                    };
                    geodataList.push(geodata);

                }
                //将这一个测试数据所得结果push到configFileContent之中
                configFileContent.push(eventInputs);
            } else {
                var testdataPath = dataOldPath + '/' + stateItem.Item.$.File;
                try {
                    var filestat = fs.statSync(testdataPath);
                } catch (e) {
                    if (e.code == 'ENOENT') {
                        return callback(null, []);
                    } else {
                        let message = { message: 'File System Internal Error!' };
                        return callback(message);
                    }
                }
                //进行文件拷贝，将数据放置到geo_data目录之下,并存储到数据库(考虑抽出来作为一个函数)
                var ext = testdataPath.substr(testdataPath.lastIndexOf('.') + 1);
                var type = 'FILE';
                if (ext == 'zip') {
                    type = 'ZIP';
                } else if (ext == 'xml') {
                    type = 'XML';
                }
                //生成数据id
                var gdid = "gd_" + uuid.v1();
                var fname = gdid + '.' + ext;
                var geo_data_Path = setting.dirname + '/geo_data/' + fname;
                var gd_tag = stateItem.Item.$.File;
                //同步进行文件拷贝
                fs.writeFileSync(geo_data_Path, fs.readFileSync(testdataPath));
                //添加记录信息
                eventInputs.inputs.push({
                    DataId: gdid,
                    StateId: stateItem.Item.$.State,
                    Event: stateItem.Item.$.Event,
                    DataName: gd_tag
                });
                var stats = fs.statSync(geo_data_Path);
                //存入数据库
                var geodata = {
                    gd_id: gdid,
                    gd_tag: gd_tag,
                    gd_type: type,
                    gd_size: stats.size - 16,
                    gd_value: fname
                };
                geodataList.push(geodata);

                //将这一个测试数据所得结果push到configFileContent之中
                configFileContent.push(eventInputs);
            }

        })

        //添加处理函数
        var addFile = function (i) {
            //向redis中添加记录
            GeoDataCtrl.addData(geodataList[i], function (err, result) {
                if (err) {
                    return callback(err);
                } else {
                    if (i < geodataList.length - 1) {
                        addFile(i + 1);
                    } else {
                        return callback(null, configFileContent);
                    }
                }
            })
        };
        if (geodataList.length) {
            addFile(0);
        } else {
            return callback(null, []);
        }
    })
};

//针对老铁开放
testifyCtrl.loadOutputTestify = function (msid, testifyPath, callback) {
    ModelSerModel.getByOID(msid, function (err, msr) {
        if (err) {
            rst = { status: -1 };
        }
        var dataOldPath = setting.dirname + '/geo_model/' + msr.ms_path + 'testify/' + testifyPath;
        var configXmlPath = dataOldPath + '/outputconfig.xml';
        var configFileContent = [];
        var geodataList = [];
        //获取config.xml信息
        try {
            var filestat = fs.statSync(configXmlPath);
        } catch (e) {
            if (e.code == 'ENOENT') {
                rst = { status: 0, dataInputs: [] };
                rst = JSON.stringify(rst);
                return callback(rst);
            } else {
                rst = { status: -1, dataInputs: [] };
                rst = JSON.stringify(rst);
                return callback(rst);
            }
        }
        var data = fs.readFileSync(configXmlPath);
        xmlparse(data, { explicitArray: false, ignoreAttrs: false }, function (err, json) {
            if (err) {
                console.log('Error in parse config file : ' + err);
                rst = JSON.stringify(rst);
                rst = { status: -1, dataInputs: [] };
                return callback(rst);
            }
            var eventOutputs = {
                outputs: []
            };
            var stateItem = json.DebugData;
            if (stateItem.Item instanceof Array) {
                for (var j = 0; j < stateItem.Item.length; j++) {
                    var testdataPath = dataOldPath + '/' + stateItem.Item[j].$.File;
                    try {
                        var filestat = fs.statSync(testdataPath);
                    } catch (e) {
                        if (e.code == 'ENOENT') {
                            rst = { status: 0, dataInputs: [] };
                            rst = JSON.stringify(rst);
                            return callback(rst);
                        } else {
                            rst = { status: -1, dataInputs: [] };
                            rst = JSON.stringify(rst);
                            return callback(rst);
                        }
                    }
                    //进行文件拷贝，将数据放置到geo_data目录之下,并存储到数据库(考虑抽出来作为一个函数)
                    var ext = testdataPath.substr(testdataPath.lastIndexOf('.') + 1);
                    var type = 'FILE';
                    if (ext == 'zip') {
                        type = 'ZIP';
                    } else if (ext == 'xml') {
                        type = 'XML';
                    }
                    //生成数据id
                    var gdid = "gd_" + uuid.v1();
                    var fname = gdid + '.' + ext;
                    var geo_data_Path = setting.dirname + '/geo_data/' + fname;
                    var gd_tag = stateItem.Item[j].$.File;
                    //同步进行文件拷贝
                    fs.writeFileSync(geo_data_Path, fs.readFileSync(testdataPath));
                    //添加记录信息
                    eventOutputs.outputs.push({
                        DataId: gdid,
                        StateId: stateItem.Item[j].$.State,
                        Event: stateItem.Item[j].$.Event,
                        DataName: gd_tag
                    });
                    var stats = fs.statSync(geo_data_Path);
                    //存入数据库
                    var geodata = {
                        gd_id: gdid,
                        gd_tag: gd_tag,
                        gd_type: type,
                        gd_size: stats.size - 16,
                        gd_value: fname
                    };
                    geodataList.push(geodata);

                }
                //将这一个测试数据所得结果push到configFileContent之中
                configFileContent.push(eventOutputs);
            } else {
                var testdataPath = dataOldPath + '/' + stateItem.Item.$.File;
                try {
                    var filestat = fs.statSync(testdataPath);
                } catch (e) {
                    if (e.code == 'ENOENT') {
                        rst = { status: 0, dataInputs: [] };
                        rst = JSON.stringify(rst);
                        return callback(rst);
                    } else {
                        rst = { status: -1, dataInputs: [] };
                        rst = JSON.stringify(rst);
                        return callback(rst);
                    }
                }
                //进行文件拷贝，将数据放置到geo_data目录之下,并存储到数据库(考虑抽出来作为一个函数)
                var ext = testdataPath.substr(testdataPath.lastIndexOf('.') + 1);
                var type = 'FILE';
                if (ext == 'zip') {
                    type = 'ZIP';
                } else if (ext == 'xml') {
                    type = 'XML';
                }
                //生成数据id
                var gdid = "gd_" + uuid.v1();
                var fname = gdid + '.' + ext;
                var geo_data_Path = setting.dirname + '/geo_data/' + fname;
                var gd_tag = stateItem.Item.$.File;
                //同步进行文件拷贝
                fs.writeFileSync(geo_data_Path, fs.readFileSync(testdataPath));
                //添加记录信息
                eventOutputs.outputs.push({
                    DataId: gdid,
                    StateId: stateItem.Item.$.State,
                    Event: stateItem.Item.$.Event,
                    DataName: gd_tag
                });
                var stats = fs.statSync(geo_data_Path);
                //存入数据库
                var geodata = {
                    gd_id: gdid,
                    gd_tag: gd_tag,
                    gd_type: type,
                    gd_size: stats.size - 16,
                    gd_value: fname
                };
                geodataList.push(geodata);

                //将这一个测试数据所得结果push到configFileContent之中
                configFileContent.push(eventOutputs);
            }

        })

        //添加处理函数
        var addFile = function (i) {
            //向redis中添加记录
            GeoDataCtrl.addData(geodataList[i], function (err, result) {
                if (err) {
                    rst = { status: -1, dataInputs: [] };
                } else {
                    if (i < geodataList.length - 1) {
                        addFile(i + 1);
                    } else {
                        rst = { status: 1, dataOutputs: configFileContent };
                        rst = JSON.stringify(rst);
                        callback(rst);
                    }
                }
            })
        };
        if (geodataList.length) {
            addFile(0);
        } else {
            rst = { status: 0, dataInputs: [] };
            rst = JSON.stringify(rst);
            callback(rst);
        }
    })
}

testifyCtrl.delTestify = function (msid, testifyPath, callback) {
    // var testifyFolder = setting.modelpath + msid + '/testify/' + testifyPath;
    // var configPath = setting.modelpath + msid + '/testify/config.json';
    // var configData = fs.readFileSync(configPath).toString();
    // var configJSON = JSON.parse(configData);
    // try {
    //     //删除记录
    //     for (var i = 0; i < configJSON.length; i++) {
    //         if (testifyPath == configJSON[i].path) {
    //             configJSON.splice(i, 1);
    //             fs.writeFileSync(configPath, JSON.stringify(configJSON));
    //             //删除文件
    //             FileOpera.rmdir(testifyFolder);
    //             return callback(null, true);
    //         }
    //     }
    //     return callback(null, false);
    // }
    // catch (ex) {
    //     return callback(ex);
    // }
    ModelSerModel.getByOID(msid, function (err, msr) {
        if (err) {
            return callback(err);
        }
        var testifyFolder = setting.dirname + '/geo_model/' + msr.ms_path + 'testify/' + testifyPath;
        if (testifyPath == 'Default') {
            var message = "Default data can not be deleted, please choose another one";
            return callback(message);
        } else {
            FileOpera.rmdir(testifyFolder);
            return callback(null, true);
        }

    })
};

//检查数据标签是否合法
testifyCtrl.checkTestify = function (msid, titleContent, tagContent, callback) {
    ModelSerRunModel.getByOID(msid, function (err, msr) {
        if (err) {
            return callback(err);
        }
        var testifyDataRoot = setting.dirname + '/geo_model/' + msr.msr_ms.ms_path + 'testify';
        var str = "Default";
        //得到testify一级目录下的所有文件夹，这就意味着得到了几个测试数据
        FileOpera.getAllFolder(testifyDataRoot, function (filefolders) {
            for (var i = 0; i < filefolders.length; i++) {
                //检查title是否合法，忽视大小写
                if (titleContent.toLocaleLowerCase() == filefolders[i].toLocaleLowerCase() || titleContent.toLocaleLowerCase() == str.toLocaleLowerCase()) {
                    var errMessage = "Title name is invalid, please change to other";
                    return callback(errMessage);
                }
                //检查tag标签是否已经被使用过
                var configPath = testifyDataRoot + '/' + filefolders[i] + '/config.xml';
                //获取config.xml信息
                var data = fs.readFileSync(configPath);
                xmlparse(data, { explicitArray: false, ignoreAttrs: false }, function (err, json) {
                    if (err) {
                        return callback(err);
                    }
                    var datatag = json.DebugData.$.tag;
                    if (datatag == tagContent) {
                        var errMessage = "Tag content is invalid, please change to another name";
                        return callback(errMessage);
                    }

                });

            }
            return callback(null, true);
        })
    })
}

//获取下载文件路径并返回
testifyCtrl.getTestifyPath = function (msid, path, dataid, callback) {
    ModelSerModel.getByOID(msid, function (err, msr) {
        if (err) {
            return callback(err, 'error');
        }
        if (msr == null) {
            return callback('Error: Model service information is null!', null);
        }
        var testifyPath = setting.dirname + '/geo_model/' + msr.ms_path + 'testify/' + path + '/' + dataid;
        return callback(null,testifyPath);
    })
}

//获取默认测试数据目录下所有数据路径
testifyCtrl.getAllTestifyPath = function (msid, path, callback) {
    ModelSerModel.getByOID(msid, function (err, msr) {
        if (err) {
            return callback(err, 'error');
        }
        if (msr == null) {
            return callback('Error: Model service information is null!', null);
        }
        var testifyPath = setting.dirname + '/geo_model/' + msr.ms_path + 'testify/' + path;
        var configPath = testifyPath + '/config.xml';
        try {
            var filestat = fs.statSync(configPath);
        } catch (e) {
            if (e.code == 'ENOENT') {
                return callback('Error: get file stat error!', null);
            } else {
                return callback('error', null);
            }
        }

        var data = fs.readFileSync(configPath);
        //存放输入数据路径
        var configFileContent = {};
        var inputPathContent = [];
        xmlparse(data, { explicitArray: false, ignoreAttrs: false }, function (err, json) {
            if (err) {
                console.log("error in parse config file: " + err, null);
            }
            // var inputs = {
            //     name: '',
            //     path: ''
            // };
            var stateItem = json.DebugData;
            if (stateItem.Item instanceof Array) {
                for (var i = 0; i < stateItem.Item.length; i++) {
                    var dataPath = testifyPath + '/' + stateItem.Item[i].$.File;
                    inputPathContent.push({
                        name: stateItem.Item[i].$.File,
                        path: dataPath
                    });
                }
            } else {
                var dataPath = testifyPath + '/' + stateItem.Item.$.File;
                inputPathContent.push({
                    name: stateItem.Item.$.File,
                    path: dataPath
                })
            }
        })
        configFileContent.parentpath = testifyPath;
        configFileContent.filetozip = inputPathContent;

        callback(null, configFileContent);
    })
}