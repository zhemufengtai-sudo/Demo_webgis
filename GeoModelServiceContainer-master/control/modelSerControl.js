/**
 * Created by Franklin on 16-3-27.
 * Control for ModelService
 */
// var fs = require('fs');
var fs = require('graceful-fs');
var path = require('path');

// var ObjectId = require('mongodb').ObjectID;
//使用bson创建ObjectID
var ObjectId = require('bson').ObjectID;
var uuid = require('node-uuid');
var request = require('request');

var setting = require('../setting');
// var ModelSerModel = require('../model/modelService');
// var ModelSerModel = require('../model/modelService_n');
var ModelSerModel = require('../model/dbSwitcher').modelService;
// var ModelSerRunModel = require('../model/modelSerRun');
// var ModelSerRunModel = require('../model/modelSerRun_n');
var ModelSerRunModel = require('../model/dbSwitcher').modelSerRun;
var FileOpera = require('../utils/fileOpera');
// var Child = require('../model/child');
// var Child = require('../model/child_n');
var Child = require('../model/dbSwitcher').child;
// var remoteReqCtrl = require('./remoteReqControl');
var ControlBase = require('./controlBase');
var ParamCheck = require('../utils/paramCheck');
var CommonMethod = require('../utils/commonMethod');
var SystemCtrl = require('./sysControl');
var ModelSerRunCtrl = require('./modelSerRunControl');
var NoticeCtrl = require('../control/noticeCtrl');
var testifyCtrl = require('../control/testifyCtrl');
// var registerModel = require('../model/register');
// var registerModel = require('../model/register_n');
var registerModel = require('../model/dbSwitcher').register;
var MDLParser = require('../utils/mdlParser');
var GeoDataCtrl = require('./geoDataControl');
var systemSettingModel = require('../model/dbSwitcher').systemSetting;

var ModelSerControl = function () {
};
ModelSerControl.__proto__ = ControlBase;
ModelSerControl.model = ModelSerModel;

module.exports = ModelSerControl;

////////////////远程服务

//搜索子节点模型服务信息信息
ModelSerControl.getChildModelSer = function (callback) {
    Child.getAllAvai(function (err, children) {
        if (err) {
            return callback(err);
        }

        if (children.length == 0) {
            return callback(null, [])
        }

        var pending = (function (pcallback) {
            var count = 0;
            return function (index) {
                count++;
                return function (err, data) {
                    count--;
                    if (err) {
                        children[index].ping = 'err';
                    }
                    else {
                        children[index].ping = 'suc';
                        children[index].ms = data;
                    }
                    if (count == 0) {
                        pcallback();
                    }
                }
            }
        });

        var done = pending(function () {
            return callback(null, children);
        });

        for (var i = 0; i < children.length; i++) {
            remoteReqCtrl.getRequestJSON('http://' + children[i].host + ':' + children[i].port + '/modelser/json/all?token=' + children[i].access_token, done(i));
        }
    });
};

//搜索单个子节点模型服务信息
ModelSerControl.getChildModelSerByHost = function (host, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        Child.getByHost(host, function (err, child) {
            if (err) {
                return callback(err);
            }
            remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/all?token=' + child.access_token, this.returnFunction(callback, 'Error in getting rmt model services by host!'));
        }.bind(this));
    }
}

//查询子节点的所有模型服务运行实例
ModelSerControl.getAllRmtMis = function (headers, callback) {
    Child.getAllAvai(function (err, children) {
        if (err) {
            return callback(err);
        }

        var pending = (function (i, host) {
            count++;
            return function (err, mis) {
                count--;
                if (!err) {
                    children[i].mis = mis;
                }
                if (count == 0) {
                    return callback(null, children[i]);
                }
            }
        });

        var count = 0;
        for (var i = 0; i < children.length; i++) {
            remoteReqCtrl.getRequestJSON('http://' + children[i].host + ':' + children[i].port + '/modelins/json/all?token=' + children[i].access_token, pending(i));
        }
    });
};
//查询子节点的所有模型服务运行实例
ModelSerControl.getAllRmtMisByHost = function (host, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        Child.getByHost(host, function (err, child) {
            if (err) {
                return callback(err);
            }
            remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelins/json/all?token=' + child.access_token,
                this.returnFunction(callback, 'error in getting rmt model service instances'));
        }.bind(this));
    }
};

//查询某个子节点某个模型服务运行实例
ModelSerControl.getRmtMis = function (host, guid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, guid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelins/json/' + guid + '?token=' + child.access_token, this.returnFunction(callback, "error in get rmt model service instance"));
                }
            }.bind(this));
        }
    }
};

//得到远程模型的详细信息
ModelSerControl.getRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/' + msid + '?token=' + child.access_token, this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//启动远程模型
ModelSerControl.startRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.putRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=start&token=' + child.access_token, this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//关闭远程模型
ModelSerControl.stopRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.putRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=stop&token=' + child.access_token, this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//获取远程模型输入信息
ModelSerControl.getRmtInputDate = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/inputdata/json/' + msid + '?token=' + child.access_token, this.returnFunction(callback, "error in get input data of rmt model service"));
                }
            }.bind(this));
        }
    }
};

//运行远程模型
ModelSerControl.runRmtModelSer = function (host, msid, inputdata, outputdata, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, host)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=run&inputdata=' + inputdata + '&outputdata=' + outputdata + '&token=' + child.access_token, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, data);
                    });
                }
            });
        }
    }
};

//删除远程模型服务
ModelSerControl.deleteRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.deleteRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?token=' + child.access_token, this.returnFunction(callback, "error in get input data of rmt model service"));
            }.bind(this));
        }
    }
};

//远程上传模型
ModelSerControl.postRmtModelSer = function (req, host, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        Child.getByHost(host, function (err, child) {
            if (err) {
                return callback(err);
            }
            remoteReqCtrl.postRequest(req, 'http://' + child.host + ':' + child.port + '/modelser/' + req.sessionID + '?token=' + child.access_token, this.returnFunction(callback, "error in get input data of rmt model service"));
        }.bind(this));
    }
};

//远程上传模型进度
ModelSerControl.getRmtModelSerProgress = function (req, host, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        Child.getByHost(host, function (err, child) {
            if (err) {
                return callback(err);
            }
            var url = 'http://' + host + ':' + child.port + '/modelser/file/' + req.sessionID + '?token=' + child.access_token;
            remoteReqCtrl.getRequest(req, url, this.returnFunction(callback, "error in get rmt model service file progress"));
        }.bind(this));
    }
};

//远程查看图像
ModelSerControl.getRmtImg = function (host, imgname, res, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, imgname)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.getRequestPipe(res, 'http://' + child.host + ':' + child.port + '/images/modelImg/' + imgname);
                return callback(null, true);
            });
        }
    }
};

///////////////本地服务

//搜寻本地可用模型信息
ModelSerControl.getLocalModelSer = function (callback) {
    ModelSerModel.getAll('AVAI', this.returnFunction(callback, 'error in getting all model services'));
};

//搜寻本地可用模型信息
ModelSerControl.getOnlineLocalModelSer = function (callback) {
    //ModelSerModel.getAll('ONLINE', this.returnFunction(callback, 'error in getting all model services'));
    ModelSerModel.getAllPid(this.returnFunction(callback, 'error in getting all model services'));
};

//搜寻本地可用模型信息
ModelSerControl.getLocalModelSerByPage = function (start, count, callback) {
    try {
        start = parseInt(start);
        count = parseInt(count);
    }
    catch (ex) {
        return callback(ex);
    }
    ModelSerModel.getAllByPage(start, count, this.returnFunction(callback, 'error in getting all model services'));
};

//搜寻本地可用模型信息(包括管理员私有)
ModelSerControl.getLocalModelSerByAdmin = function (callback) {
    ModelSerModel.getAll('ADMIN', this.returnFunction(callback, 'error in getting all model services'));
}

//模型压缩包文件结构验证
//成功返回 isValidate == true，失败返回 错误信息
//status == 0 表示后台读取数据库或者文件出错
ModelSerControl.validate = function (modelPath, callback) {
    var configPath = modelPath + 'package.config';
    var rst = {
        status: 1,
        isValidate: true,
        cfgfile: true,
        cfg: [],
        mdl: true,
        start: true
    };
    fs.stat(configPath, function (err, stat) {
        if (err && err.code == 'ENOENT') {
            rst.cfgfile = false;
            rst.isValidate = false;
            callback(rst);
        }
        else if (err) {
            callback({ status: 0 });
        }
        else if (stat) {
            ModelSerControl.readCfgBypath(configPath, function (err, cfg) {
                if (err) {
                    callback({ status: 0 });
                }
                else {
                    //验证config文件
                    {
                        if (!cfg.host) {
                            rst.isValidate = false;
                            rst.cfg.push('host');
                        }
                        else if (!cfg.port) {
                            rst.isValidate = false;
                            rst.cfg.push('port');
                        }
                        else if (!cfg.start) {
                            rst.isValidate = false;
                            rst.cfg.push('start');
                        }
                        else if (!cfg.type) {
                            rst.isValidate = false;
                            rst.cfg.push('type');
                        }
                        else if (!cfg.mdl) {
                            rst.isValidate = false;
                            rst.cfg.push('mdl');
                        }
                        if (!rst.isValidate) {
                            callback(rst);
                        }
                    }
                    //验证 模型启动文件、mdl
                    var startPath = modelPath + cfg.start;
                    var mdlPath = modelPath + cfg.mdl;
                    fs.stat(startPath, function (err, stat) {
                        if (err && err.code == 'ENOENT') {
                            rst.start = false;
                            rst.isValidate = false;
                            fs.stat(mdlPath, function (err, stat2) {
                                if (err && err.code == 'ENOENT') {
                                    rst.mdl = false;
                                    rst.isValidate = false;
                                    callback(rst);
                                }
                                else if (err) {
                                    callback({ status: 0 });
                                }
                                else if (stat2) {
                                    callback(rst);
                                }
                            });
                        }
                        else if (err) {
                            callback({ status: 0 });
                        }
                        else if (stat) {
                            fs.stat(mdlPath, function (err, stat2) {
                                if (err && err.code == 'ENOENT') {
                                    rst.mdl = false;
                                    rst.isValidate = false;
                                    callback(rst);
                                }
                                else if (err) {
                                    callback({ status: 0 });
                                }
                                else if (stat2) {
                                    callback(rst);
                                }
                            });
                        }
                    });
                }
            });
        }

    });
};



//新增模型服务
//先解压到以_oid命名的文件夹中，验证成功在添加记录，失败不添加记录并删除该文件夹
ModelSerControl.addNewModelSer = function (fields, files, callback) {
    let date = new Date();
    let img = null;
    if (files.ms_img) {
        if (files.ms_img.size != 0) {
            img = uuid.v1() + path.extname(files.ms_img.path);
            fs.renameSync(files.ms_img.path, setting.dirname + '/public/images/modelImg/' + img);
        }
        else {
            FileOpera.rmdir(files.ms_img.path);
        }
    }

    if (!files.file_model) {
        return callback(new Error('No package file!'));
    }

    //产生新的OID
    let oid = new ObjectId().toString();

    //解压路径
    let model_path = setting.dirname + '/geo_model/' + oid.toString() + '/';
    //MD5码
    FileOpera.getMD5(files.file_model.path, function (err, md5_value) {
        if (err) {
            return callback(err);
        }

        //! remove by Franklin Zhang at 21-3-29
        // if (fields.batch == true) {
        //     md5_value = -1;
        // }
        mid = null;
        fields.m_register = false;
        if (mid != undefined || mid != null) {
            fields.m_register = true;
            if (fields.m_id) {
                mid = fields.m_id;
            }
        }

        CommonMethod.Uncompress(files.file_model.path, model_path, function (err) {
            if (err) {
                return callback(err);
            }

            // //添加默认测试数据，不用异步请求，两者不相关
            // testifyCtrl.addDefaultTestify(oid.toString(),ModelSerControl.getInputData);

            //删除文件
            //modified by wangming, 不删除模型部署包，以便于门户服务的迁移
            //FileOpera.rmdir(files.file_model.path);

            ModelSerModel.readMDLByPath(setting.dirname + '/geo_model/' + oid + '/model/', function (err, mdl) {
                if (err) {
                    console.log(err);
                    return callback(err, { status: 1, mdl: false });
                }

                try {
                    // 添加模型运行文件权限
                    if (setting.platform == 2) {
                        FileOpera.chmod(model_path + mdl.ModelClass.Runtime.entry, 'exec');
                    }
                }
                catch (ex) {

                }
                try {
                    fields.m_name = mdl.ModelClass.$.name;
                    fields.dirname = CommonMethod.makeUpDirName(mdl.ModelClass.$.name);
                    let category = mdl.ModelClass.AttributeSet.Categories.Category;
                    if (category.constructor == Array) {
                        category = category[0];
                    }
                    else if (category.constructor == Object) {
                        category = category;
                    }
                    fields.m_type = category.$.path + ' - ' + category.$.principle;
                    let attr = mdl.ModelClass.AttributeSet.LocalAttributes.LocalAttribute;
                    if (attr.constructor == Array) {
                        var i;
                        for (i = 0; i < attr.length; i++) {
                            if (attr[i].$.local == 'ZH_CN') {
                                attr = attr[i];
                                break;
                            }
                        }
                        if (i == attr.length) {
                            attr = attr[0];
                        }
                    }
                    else if (attr.constructor == Object) {
                        attr = attr;
                    }
                    fields.m_url = attr.$.wiki;
                    fields.ms_des = attr.Abstract;
                    fields.mv_num = mdl.ModelClass.Runtime.$.version;
                }
                catch (ex) {
                    return callback(ex);
                }
                //新路径
                let newPath = setting.dirname + '/geo_model/' + fields.dirname.replace(/\s+/g, "_") + '_' + oid.toString();
                let copyPath = setting.dirname + '/geo_model/packages/' + oid.toString() + ".zip";

                //进行部署包拷贝，拷贝成功后再删除部署包
                fs.rename(files.file_model.path, copyPath, function (err, result) {
                    if (err) {
                        console.log("copy file error");
                    }
                    console.log("copy file success!");
                    //生成新的纪录

                    let limit = -1;
                    if (fields.batch) {
                        limit = 0;
                    }

                    let newmodelser = {
                        _id: oid,
                        ms_model: Object.assign({
                            m_name: fields.m_name,
                            m_type: fields.m_type,
                            m_url: fields.m_url,
                            p_id: md5_value,
                            m_id: mid,
                            m_register: fields.m_register
                        }, fields.m_model_append),
                        ms_limited: fields.ms_limited,
                        ms_permission: fields.ms_permission,
                        mv_num: fields.mv_num,
                        ms_des: fields.ms_des,
                        ms_update: date,
                        ms_platform: setting.platform,
                        ms_path: fields.dirname.replace(/\s+/g, "_") + '_' + oid.toString() + '/',
                        ms_img: img,
                        ms_xml: JSON.stringify(mdl),
                        //进行环境检测将服务状态改为-1
                        ms_status: limit,
                        ms_user: {
                            u_name: fields.u_name,
                            u_email: fields.u_email
                        }
                    };

                    let ms = new ModelSerModel(newmodelser);
                    ModelSerModel.save(ms, function (err, data) {
                        if (err) {
                            console.log(err);
                            callback(null, { status: 0 });
                        }
                        else {
                            fs.rename(model_path, newPath, (err) => {
                                if (err) {
                                    console.log(err);
                                    callback(null, { status: 0 });
                                }
                                ////添加运行实例临时文件目录
                                FileOpera.BuildDir(newPath + '/instance/', function () {
                                    callback(null, { isValidate: true, data: ms });
                                });

                            });

                        }
                    });
                });
            });
        });
    });
};

//将记录放置在回收站
//并删除文件
ModelSerControl.deleteToTrush = function (_oid, callback) {
    var oid = _oid;
    ModelSerModel.getByOID(_oid, function (err, item) {
        if (err) {
            return callback(err);
        }
        item.ms_status = -1;
        ModelSerModel.update(item, function (err, mess) {
            if (err) {
                return callback(err);
            }
            //删除文件
            FileOpera.rmdir(setting.dirname + '/geo_model/' + item.ms_path);
            //删除模型包
            FileOpera.rmdir(setting.dirname + '/geo_model/' + 'packages/' + oid + '.zip');
            return callback(null, item);
        });
    });
};

//根据OID查询模型服务信息
ModelSerControl.getByOID = function (msid, callback) {
    ModelSerModel.getByOID(msid, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

//根据MID查询模型服务
ModelSerControl.getByMID = function (mid, callback) {
    ModelSerModel.getByMID(mid, this.returnFunction(callback, 'error in getting model service by MID'));
};

//根据PID查询模型服务
ModelSerControl.getByPID = function (pid, callback) {
    ModelSerModel.getByPID(pid, this.returnFunction(callback, 'error in getting model service by PID'));
};

//根据PID查询模型服务
ModelSerControl.getByPIDforPortal = function (mid, callback) {
    ModelSerModel.getByPIDforPortal(mid, this.returnFunction(callback, 'error in getting model service by PID for portal'));
};

//批量开启模型
ModelSerControl.batchStart = function (msids, callback) {
    try {
        var msids = JSON.parse(msids);
        ModelSerModel.batchStart(msids, this.returnFunction(callback, 'error in batch updating model service!'));
    }
    catch (ex) {
        return callback(ex);
    }
}

//批量开启模型
ModelSerControl.batchStop = function (msids, callback) {
    try {
        var msids = JSON.parse(msids);
        ModelSerModel.batchStop(msids, this.returnFunction(callback, 'error in batch updating model service!'));
    }
    catch (ex) {
        return callback(ex);
    }
}

//批量锁定模型
ModelSerControl.batchLock = function (msids, callback) {
    try {
        var msids = JSON.parse(msids);
        ModelSerModel.batchLock(msids, this.returnFunction(callback, 'error in batch updating model service!'));
    }
    catch (ex) {
        return callback(ex);
    }
}

//批量解锁启模型
ModelSerControl.batchUnlock = function (msids, callback) {
    try {
        var msids = JSON.parse(msids);
        ModelSerModel.batchUnlock(msids, this.returnFunction(callback, 'error in batch updating model service!'));
    }
    catch (ex) {
        return callback(ex);
    }
}

//更新模型服务信息
ModelSerControl.update = function (ms, callback) {
    ModelSerModel.update(ms, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

//运行模型服务
ModelSerControl.run = function (msid, inputData, outputData, cp, user, callback) {
    console.log("run model --- enter")
    // if (app.modelInsColl.ModelInsArr.length > setting.maxins) {
    //     return callback(new Error('Over max concurrency!'));
    // }

    if (inputData == undefined || inputData == null) {
        return callback(new Error('No input data!'));
    }

    if (outputData == undefined || outputData == null) {
        outputData = [];
    }
    if (typeof outputData == 'string') {
        outputData = JSON.parse(outputData);
    }
    ModelSerControl.getInputData(msid, function (err, data) {
        if (err) { return callback(err); }
        var params = data.Params;
        data = data.States;
        // Data Info Completion
        for (var k = 0; k < data.length; k++) {
            for (var i = 0; i < data[k].Event.length; i++) {
                if (data[k].Event[i].$.type == 'noresponse') {
                    //! Output Data
                    var j;
                    for (j = 0; j < outputData.length; j++) {
                        if ((outputData[j].StateId == data[k].$.id || outputData[j].StateName == data[k].$.name) && outputData[j].Event == data[k].Event[i].$.name) {
                            outputData[j].StateId = data[k].$.id;
                            outputData[j].StateName = data[k].$.name;
                            outputData[j].StateDes = data[k].$.description;
                            outputData[j].Multiple = data[k].$.multiple;
                            if (outputData[j].Destroyed == undefined || outputData[j].Destroyed == null) {
                                outputData[j]['Destroyed'] = false;
                            }
                            if (outputData[j].DataId == undefined || outputData[j].DataId == null) {
                                outputData[j]['DataId'] = '';
                                // outputData[j]['DataId'] = 'gd_' + uuid.v1();
                            }
                            if (outputData[j].Multiple && outputData[j].Multiple == 'True') {
                                outputData[j].DataId = [];
                            }
                            if (outputData[j].Tag == undefined || outputData[j].Tag == null) {
                                outputData[j]['Tag'] = data[k].$.name + '-' + data[k].Event[i].$.name;
                            }
                            // //add TimeData属性
                            // outputData[j]['TimeData'] = [];
                            break;
                        }
                    }
                    if (j == outputData.length) {
                        var dataId = '';
                        if (data[k].Event[i].$.multiple && data[k].Event[i].$.multiple == 'True') {
                            dataId = [];
                        }
                        var item = {
                            StateId: data[k].$.id,
                            StateName: data[k].$.name,
                            StateDes: data[k].$.description,
                            Event: data[k].Event[i].$.name,
                            Multiple: data[k].Event[i].$.multiple,
                            Destroyed: false,
                            Tag: data[k].$.name + '-' + data[k].Event[i].$.name,
                            DataId: dataId,
                            TimeData: []
                        };
                        outputData.push(item);
                    }
                }
                else if (data[k].Event[i].$.type == 'response') {
                    //! Input Data
                    var j;
                    for (j = 0; j < inputData.length; j++) {
                        if ((inputData[j].StateId == undefined || inputData[j].StateId == "") && (inputData[j].StateName == undefined || inputData[j].StateName == ""))
                            return callback(new Error("Input Data is Error!"))
                        if ((inputData[j].StateId == data[k].$.id || inputData[j].StateName == data[k].$.name) && inputData[j].Event == data[k].Event[i].$.name) {
                            inputData[j].StateId = data[k].$.id;
                            inputData[j].StateName = data[k].$.name;
                            inputData[j].StateDes = data[k].$.description;
                            if (inputData[j].Destroyed == undefined || inputData[j].Destroyed == null) {
                                inputData[j].Destroyed = false;
                            }
                            // if(inputData[j].DataId == undefined || inputData[j].DataId == null){
                            //     inputData[j].DataId = 'gd_' + uuid.v1();
                            // }
                            if (inputData[j].Tag == undefined || inputData[j].Tag == null) {
                                //! TODO GET IN REDIS
                                inputData[j].Tag = '';
                            }
                            inputData[j].Requested = false;
                            break;
                        }
                    }
                    if (j == inputData.length) {
                        var item = {
                            StateId: data[k].$.id,
                            StateName: data[k].$.name,
                            StateDes: data[k].$.description,
                            Event: data[k].Event[i].$.name,
                            Destroyed: false,
                            Tag: data[k].$.name + '-' + data[k].Event[i].$.name,
                            Requested: false,
                            DataId: ''
                        };
                        inputData.push(item);
                    }

                }
            }
        }

        // Parameters Completion
        // Control Parameters
        var ccp = {};
        if (cp == undefined || cp == null) {
            for (var i = 0; i < params.ControlParameters.length; i++) {
                ccp[params.ControlParameters[i].$.key] = params.ControlParameters[i].$.defaultValue;
            }
        }
        else {
            if (typeof cp == 'string') {
                try {
                    cp = JSON.parse(cp);
                }
                catch (ex) {
                    cp = [];
                }
            }
            for (var i = 0; i < params.ControlParameters.length; i++) {
                ccp[params.ControlParameters[i].$.key] = params.ControlParameters[i].$.defaultValue;
                if (cp.hasOwnProperty(params.ControlParameters[i].$.key)) {
                    ccp[params.ControlParameters[i].$.key] = cp[params.ControlParameters[i].$.key];
                }
            }
        }

        // get model service info
        ModelSerModel.getByOID(msid, function (err, ms) {
            if (err) {
                return callback(err);
            }
            if (ms.ms_status != 1) {
                return callback(new Error('Service is not available'));
            }

            //向内存中添加模型运行实例
            var guid = app.modelInsColl.createIns(ms, inputData, outputData, ccp);

            var date = new Date();
            //添加纪录
            var msr = {
                _id: new ObjectId(),
                ms_id: ms._id,
                msr_ms: ms,
                msr_datetime: date.toLocaleString(),
                msr_span: 0,
                msr_user: user,
                msr_guid: guid,
                msr_input: inputData,
                msr_output: outputData,
                msr_status: 0,
                msr_logs: [],
                m_logs: [],
                msr_runninginfo: {
                    InvokeErr: "",
                    StdOut: "",
                    StdErr: ""
                },
                msr_processparams: [],
                msr_controlparams: {}
            };
            //先存储模型运行记录表，后开始调用模型，当运行成功后将msr_status变为1，运行错误则为-1
            ModelSerRunCtrl.addItem(msr, function (err, msr) {
                if (err) {
                    return callback(err);
                }
                ModelSerModel.run(msid, guid, function (err, stdout, stderr) {
                    // console.log('[DEBUG] Process finished!');
                    ModelSerRunModel.getByGUID(guid, function (err2, item) {
                        // console.log('[DEBUG] Record checking in process finishing!');
                        if (err2) {
                            return console.log(JSON.stringify(err2));
                        }
                        if (item == null) {
                            return console.log('Can not find MSR when it is ended !');
                        }
                        if (err) {
                            // item.msr_runninginfo.InvokeErr = JSON.stringify(err);
                            item.msr_runninginfo.InvokeErr = '';
                        }
                        if (stdout) {
                            item.msr_runninginfo.StdOut = JSON.stringify(stdout);
                        }
                        if (stderr) {
                            item.msr_runninginfo.StdErr = JSON.stringify(stderr);
                        }
                        var mis = global.app.modelInsColl.getByGUID(guid);

                        //ModelSerControl.taskFinished(item, function (err,result) {});

                        //没有配置环境，进程无法启动
                        if (mis.state == "MC_READY" && mis.socket == null) {
                            global.app.modelInsColl.removeByGUID(guid);
                            item.msr_status = -1;
                            ModelSerRunModel.update(item, function (err, res) {
                                if (err) {
                                    return console.log(JSON.stringify(err2));
                                }
                            })
                            ModelSerControl.taskFinished(item, function (err, result) { });
                        }
                        else {
                            ModelSerRunModel.updateRunningInfo(item._id, item.msr_runninginfo, function (err, res) {

                                // console.log('[DEBUG] Record updating finished in process finishing!');
                                if (err) {
                                    return console.log(JSON.stringify(err2));
                                }

                            });
                        }
                    });

                }, function (err, ms) {
                    if (err) {
                        return callback(err);
                    }
                    //绑定内存实例的ms属性
                    global.app.modelInsColl.bindMs(guid, ms);

                    //存储通知消息
                    var notice = {
                        time: new Date(),
                        title: ms.ms_model.m_name + ' is running!',
                        detail: '',
                        type: 'start-run',
                        hasRead: false
                    };
                    NoticeCtrl.save(notice, function (err, data) {
                        if (err) {
                            console.log(JSON.stringify(err));
                        }
                    });

                    return callback(null, msr);
                });
            });
        });

    });
}

//获取所有门户网站模型服务
ModelSerControl.getCloudModelsers = function (callback) {
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ModelItemToContainerServlet', this.returnFunction(callback, 'error in get cloud model service'));
};

//获取模型门户所有类别
ModelSerControl.getCloudModelserCategory = function (callback) {
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ModelRepositoryServlet', function (err, categories) {
        if (err) {
            return callback(err);
        }
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].children.length > 0) {
                categories[i]['nodes'] = [];
            }
            for (var j = 0; j < categories[i].children.length; j++) {
                var index = ModelSerControl.getCategoryById(categories, categories[i].children[j]);
                if (index != -1) {
                    categories[index]['backColor'] = '#FFFFFF';
                    categories[index]['text'] = categories[index]['name'];
                    if (categories[index]['isLeaf'] === 'true') {
                        categories[index]['selectable'] = true;
                        categories[index]['icon'] = "fa fa-book";
                        categories[index]['selectedIcon'] = "fa fa-check";
                    }
                    else {
                        categories[index]['selectable'] = false;
                        categories[index]['state'] = {
                            expanded: false
                        };
                    }
                    categories[i].nodes.push(categories[index]);
                }
            }
        }

        return callback(null, categories[0]);
    });
};

ModelSerControl.getCategoryById = function (array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id == id) {
            return i;
        }
    }
    return -1;
};

//获取某一条目下的所有模型部署包
ModelSerControl.getCloudModelPackageByMid = function (mid, callback) {
    mid = CommonMethod.Encode64(CommonMethod.Encode64(mid));
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetComputerServicesServlet?modelItemId=' + mid, function (err, packages) {
        if (err) {
            return callback(err);
        }
        var count = 0;
        if (packages.length == 0) {
            return callback(null, packages);
        }
        var pending = function (index) {
            count++;
            return function (err, ms) {
                if (ms.length != 0) {
                    packages[index]['pulled'] = true;
                    packages[index]['ms_id'] = ms[0]._id;
                }
                else {
                    packages[index]['pulled'] = false;
                }

                count--;
                if (count == 0) {
                    return callback(null, packages);
                }
            }
        };

        for (var i = 0; i < packages.length; i++) {
            if (packages[i].id && packages[i].id != '')
                ModelSerModel.getByPID(packages[i].id, pending(i));
        }
    });
};

//获取某一类别下的所有模型
ModelSerControl.getCloudModelByCategoryId = function (id, page, callback) {
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/modelItemServlet?uid=' + id + '&page=' + page + '&sortType=name&TagOrClass=class', function (err, items) {
        if (err) {
            return callback(err);
        }
        var itemsCount = items.count;
        items = items.modelItems;
        if (items.length == 0) {
            return callback(null, {
                count: 0,
                items: []
            });
        }
        var count = 0;
        var pending = function (index) {
            count++;
            return function (err, mss) {
                if (mss.length != 0) {
                    items[index]['pulled'] = true;
                }
                else {
                    items[index]['pulled'] = false;
                }
                count--;
                if (count == 0) {
                    return callback(null, {
                        count: itemsCount,
                        items: items
                    });
                }
            }

        };
        for (var i = 0; i < items.length; i++) {
            ModelSerModel.getByMID(items[i].model_id, pending(i));
        }
    });
};

//上传模型部署包
ModelSerControl.uploadPackage = function (msid, mid, pkg_name, pkg_version, pkg_des, mupload, portal_uname, portal_pwd, callback) {
    var pending = function () {
        SystemCtrl.loginPortal(portal_uname, portal_pwd, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result) {
                var pending2 = function () {
                    remoteReqCtrl.postRequestJSONWithFormData('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/UploadPackageZipServlet', {
                        id: mid,
                        file: fs.createReadStream(setting.dirname + '/geo_model/' + 'packages/' + msid + '.zip')
                    }, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                        if (data == null) {
                            return callback(new Error('portal result in null!'));
                        }
                        if (data.result == 'no') {
                            return callback(new Error('Error in login portal!'));
                        }
                        var resJson = data;
                        var url = 'http://' + setting.portal.host + ':' + setting.portal.port +
                            '/GeoModeling/DeploymentPackageHandleServlet';
                        // '?calcName=' + pkg_name + '&calcDesc=' + pkg_des + '&calcPlatform=1&modelItemId=' + mid + '&calcFcId=' + resJson.fcId + '&calcFileName=' + resJson.result;
                        url = encodeURI(url);
                        remoteReqCtrl.postRequestJSONWithForm(url, {
                            calcName: pkg_name,
                            calcDesc: pkg_des,
                            calcPlatform: 1,
                            modelItemId: mid,
                            calcFcId: resJson.fcId,
                            calcFileName: resJson.result
                        }, function (err, data) {
                            if (err) {
                                return callback(err);
                            }
                            if (data.result == 'no') {
                                return callback(new Error('Link fail in portal !'));
                            }
                            ModelSerModel.getByOID(msid, function (err, ms) {
                                if (err) {
                                    return callback(err);
                                }
                                ms.ms_model.m_id = mid;
                                ModelSerControl.update(ms, function (err, result) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    return callback(null, {
                                        fcid: resJson.fcId
                                    });
                                });
                            });
                        });
                    });
                };
                if (mupload == 'on') {
                    if (!fs.existsSync(setting.dirname + '/geo_model/' + 'packages/' + msid + '.zip')) {
                        CommonMethod.compress(setting.dirname + '/geo_model/' + 'packages/' + msid + '.zip', setting.dirname + '/geo_model/' + msid);
                    }
                    pending2();
                }
                else {
                    ModelSerControl.getByOID(msid, function (err, ms) {
                        if (err) {
                            return callback(err);
                        }
                        remoteReqCtrl.postRequestJSONWithForm('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/RegisterComputerServiceServlet', {
                            port: setting.port,
                            userid: portal_uname,
                            password: portal_pwd,
                            pinfo: JSON.stringify({
                                name: pkg_name,
                                desc: pkg_des,
                                pid: ms.ms_model.p_id,
                                mid: mid
                            })
                        }, function (err, result) {
                            if (err) {
                                return callback(err);
                            }
                            if (result.result == 'suc') {
                                ms.ms_model.m_id = mid;
                                ModelSerControl.update(ms, function (err, result) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    return callback(null, {
                                        fcid: 'virtual'
                                    });
                                });
                            }
                            else if (result == 'error') {
                                return callback(new Error(result.message));
                            }
                            else {
                                return callback(new Error('No Response!'));
                            }
                        });
                    });
                }
            }
            else {
                return callback(new Error('Login fail!', -1));
            }
        });
    };

    if (!portal_uname) {
        SystemCtrl.getPortalToken(function (err, token) {
            if (err) {
                return callback(err);
            }
            portal_uname = token['portal_uname'];
            portal_pwd = token['portal_pwd'];
            pending();
        });
    }
    else {
        pending();
    }
};

//登记模型服务
ModelSerControl.RegisterModelService = function (msid, callback) {
    ModelSerModel.getByOID(msid, function (err, ms) {
        if (err) {
            return callback(err);
        }
        if (ms == null) {
            return callback('Can not find model service');
        }
        SystemCtrl.getPortalToken(function (err, token) {
            if (err) {
                return callback(err);
            }
            portal_uname = token['portal_uname'];
            portal_pwd = token['portal_pwd'];
            SystemCtrl.loginPortal(portal_uname, portal_pwd, function (err, result) {
                if (err) {
                    return callback('Can not login Portal');
                } else if (!result) {
                    return callback('Can not login Portal');
                }
                ModelSerModel.readMDLStream(ms, function (err, mdlstream) {
                    if (err) {
                        return callback(err);
                    }
                    //添加从数据库中获取服务器注册的信息
                    registerModel.getByWhere({}, function (err, data) {
                        var rst;
                        if (err) {
                            console.log('err in getBywhere of register data !');
                            return callback('UnRegister the server machine');
                        }
                        else if (data.length == 0) {
                            console.log('err in getBywhere of register data !');
                            return callback('UnRegister the server machine');
                        }
                        else if (!data[0].registered) {
                            console.log('err in getBywhere of register data !');
                            return callback('UnRegister the server machine');
                        }
                        //默认只会有一条记录
                        var serviceInfo = data[0].info;
                        remoteReqCtrl.postRequestJSONWithFormData('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerModelOperateServlet', {
                            mid: ms._id,
                            name: ms.ms_model.m_name,
                            description: ms.ms_des,
                            hostId: serviceInfo,
                            mdl: mdlstream
                        }, function (err, data) {
                            if (err) {
                                return callback(err);
                            }
                            if (data.result == 'suc') {
                                ms.ms_model.m_register = true;
                                ms.registerId = data.message;
                                ModelSerModel.update(ms, function (err, result) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    return callback(null, true);
                                });
                            }
                            else if (data.result == 'error') {
                                return callback('Error : ' + data.message);
                            }
                            else {
                                return callback('Unknown Error ');
                            }
                        });
                    });
                });
            });

        });
    });
};

//退登模型服务
ModelSerControl.UnregisterModelService = function (msid, callback) {
    ModelSerModel.getByOID(msid, function (err, ms) {
        if (err) {
            return callback(err);
        }
        if (ms == null) {
            return callback('Can not find model service');
        }

        SystemCtrl.getPortalToken(function (err, token) {
            if (err) {
                return callback(err);
            }
            portal_uname = token['portal_uname'];
            portal_pwd = token['portal_pwd'];
            SystemCtrl.loginPortal(portal_uname, portal_pwd, function (err, result) {
                if (err) {
                    return callback('Can not login Portal');
                } else if (!result) {
                    return callback('Can not login Portal');
                }
                //get 请求注销模型服务登记， post请求注册模型服务
                var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerModelOperateServlet?ComputableModelId=' + ms.registerId;
                remoteReqCtrl.getRequestJSON(url, function (err, data) {
                    if (err) {
                        return callback(err);
                    }
                    if (data.result == 'suc') {
                        ms.ms_model.m_register = false;
                        ModelSerModel.update(ms, function (err, result) {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, true);
                        });
                    }
                    else if (data.result == 'error') {
                        return callback('Error : ' + data.message);
                    }
                    else {
                        return callback('Unknown Error ');
                    }
                    ms.ms_model.m_register = false;
                    ModelSerControl.update(ms, this.returnFunction(callback, 'Error in unregistering this model service!'));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

//根据OID更新门户的ModelItemID
ModelSerControl.getMIDByOID = function (oid, callback) {
    if (ParamCheck.checkParam(callback, oid)) {
        ModelSerModel.getByOID(oid, function (err, ms) {
            if (err) {
                return callback(err);
            }
            if (item.ms_model.p_id) {
                return callback(null, ms.ms_model.mid);
            }
            else {
                return callback(new Error('No PID'));
            }
        });
    }
};

//根据PID更新门户的ModelItemID
ModelSerControl.getMIDByPID = function (pid, callback) {
    if (pid == -1) {
        return callback(new Error());
    }
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/DeploymentPackageHandleServlet?uid=' + pid, function (err, data) {
        if (err) {
            return callback(err);
        }
        if (data.modelItemId) {
            return callback(null, data.modelItemId);
        }
        else {
            return callback(new Error('can not get MID'));
        }
    });
};

//得到初始输入数据
ModelSerControl.getInputData = function (ms_id, callback) {
    ModelSerModel.getByOID(ms_id, function (err, ms) {
        if (err) {
            return callback(err);
        }
        ModelSerModel.readMDL(ms, function (err, mdl) {
            if (err) {
                return callback(err);
            }
            try {
                var dataDecs = null;
                if (mdl.ModelClass.Behavior.RelatedDatasets != null) {
                    dataDecs = mdl.ModelClass.Behavior.RelatedDatasets.DatasetItem;
                }
                else if (mdl.ModelClass.Behavior.DatasetDeclarations != null) {
                    dataDecs = mdl.ModelClass.Behavior.DatasetDeclarations.DatasetDeclaration;
                }
                var state = mdl.ModelClass.Behavior.StateGroup.States.State;
                var params = mdl.ModelClass.Behavior.Parameters;
                if (params == undefined || params == null) {
                    params = {
                        ProcessParameters: [],
                        ControlParameters: []
                    }
                }
                if (params.ProcessParameters == undefined || params.ProcessParameters == null || params.ProcessParameters.Add == undefined || params.ProcessParameters.Add == null) {
                    params.ProcessParameters = [];
                }
                else if (Array.isArray(params.ProcessParameters.Add)) {
                    params.ProcessParameters = params.ProcessParameters.Add;
                }
                else {
                    params.ProcessParameters = [params.ProcessParameters.Add];
                }

                if (params.ControlParameters == undefined || params.ControlParameters == null || params.ControlParameters.Add == undefined || params.ControlParameters.Add == null) {
                    params.ControlParameters = [];
                }
                else if (Array.isArray(params.ControlParameters.Add)) {
                    params.ControlParameters = params.ControlParameters.Add;
                }
                else {
                    params.ControlParameters = [params.ControlParameters.Add];
                }

                if (!state.length) {
                    state = [state];
                }
                for (var k = 0; k < state.length; k++) {
                    if (!state[k].Event.length) {
                        state[k].Event = [state[k].Event]
                    }
                    for (var i = 0; i < state[k].Event.length; i++) {
                        for (var j = 0; j < dataDecs.length; j++) {
                            if (state[k].Event[i].hasOwnProperty('ResponseParameter')) {
                                if (state[k].Event[i].ResponseParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state[k].Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state[k].Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                            else if (state[k].Event[i].hasOwnProperty('DispatchParameter')) {
                                if (state[k].Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state[k].Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state[k].Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                            else if (state[k].Event[i].hasOwnProperty('ControlParameter')) {
                                if (state[k].Event[i].ControlParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state[k].Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state[k].Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                        }
                    }
                }
                var arr = state;
                return callback(null, {
                    States: arr,
                    Permission: ms.ms_permission,
                    Params: params
                });
            }
            catch (newerr) {
                console.log('Error in data makeup ; ' + newerr);
                return callback(newerr);
            }
        });
    });
};

ModelSerControl.readMDLByPath = function (path, callback) {
    ModelSerModel.readMDLByPath(path, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    })
};

ModelSerControl.getMSDetail = function (msid, cb) {
    ModelSerModel.getMSDetail(msid, function (err, rst) {
        err ? cb(err) : cb(null, rst);
    })
};

ModelSerControl.parseMDLStr = function (mdlStr, callback) {
    ModelSerModel.parseMDLStr(mdlStr, function (err, json) {
        if (err) {
            return callback(err);
        }
        else {
            return callback(null, json);
        }
    })
};

ModelSerControl.readCfg = function (ms, callback) {
    ModelSerModel.readCfg(ms, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

ModelSerControl.readCfgBypath = function (path, callback) {
    ModelSerModel.readCfgBypath(path, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

ModelSerControl.getRmtPreparationData = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/' + msid, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, data);
                    });
                }
            });
        }
    }
};

//从门户网站或本机获取runtime节点
ModelSerControl.getRuntimeByPid = function (pid, place, cb) {
    var runtime = {};
    if (place == 'local') {
        ModelSerModel.getOffLineModelByPID(pid, function (err, ms) {
            if (err) {
                return cb(err);
            }
            else {
                if (!ms || ms.length == 0)
                    return cb({ code: 'could not find related model!' });
                ms = ms[0];
                ModelSerModel.readMDL(ms, function (err, mdl) {
                    if (err) {
                        return cb(err);
                    }
                    else {
                        if (!mdl)
                            return cb({ code: 'explain MDL error!' });
                        ModelSerControl.getRuntimeFromMDL(mdl, function (demands) {
                            return cb(null, demands);
                        });
                    }
                })
            }
        })
    }
    else if (place == 'portal') {
        var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetMDLFromPidServlet?pid=' + pid;
        remoteReqCtrl.getByServer(url, null, function (err, mdlStr) {
            if (err) {
                return cb(err);
            }
            else {
                if (mdlStr && mdlStr != '') {
                    ModelSerControl.parseMDLStr(mdlStr, function (err, mdl) {
                        if (err) {
                            return cb(err);
                        }
                        else {
                            ModelSerControl.getRuntimeFromMDL(mdl, function (demands) {
                                return cb(null, demands);
                            })
                        }
                    });
                }
                else {
                    return cb(null, []);
                }
            }
        })
    }
};


ModelSerControl.getRuntimeFromMDL = function (mdl, cb) {
    var softDemands = [], hardDemands = [];
    //修改节点信息

    var hardJSON = mdl.ModelClass.Runtime.HardwareConfigures.Add;
    var softJSON = mdl.ModelClass.Runtime.SoftwareConfigures.Add;
    if (hardJSON == undefined) {
        hardJSON = [];
        //兼容老版本节点为INSERT
        let oldhardJSON = mdl.ModelClass.Runtime.HardwareConfigures.INSERT;
        if (oldhardJSON !== undefined) {
            //判断是array类型还是Object
            if (oldhardJSON instanceof Array) {
                if (oldhardJSON.length != 0) {
                    for (var i = 0; i < oldhardJSON.length; i++) {
                        //modified to ensure the old version mdl can be used
                        // hardDemands.push({ name: hardJSON[i].$.name, value: hardJSON[i]._ });
                        hardDemands.push({ name: oldhardJSON[i].$.name, value: oldhardJSON[i]._ });
                    }
                }
            } else {
                hardDemands.push({ name: oldhardJSON.$.name, value: oldhardJSON._ });
            }
        } else {
            hardJSON = [];
        }
    } else {
        //判断是array类型还是Object
        if (hardJSON instanceof Array) {
            if (hardJSON.length != 0) {
                for (var i = 0; i < hardJSON.length; i++) {
                    //modified to ensure the old version mdl can be used
                    // hardDemands.push({ name: hardJSON[i].$.name, value: hardJSON[i]._ });
                    hardDemands.push({ name: hardJSON[i].$.key, value: hardJSON[i].$.value });
                }
            }
        } else {
            hardDemands.push({ name: hardJSON.$.key, value: hardJSON.$.value });
        }
    }

    if (softJSON == undefined) {
        softJSON = [];
        let oldsoftJSON = mdl.ModelClass.Runtime.SoftwareConfigures.INSERT;
        if (oldsoftJSON !== undefined) {
            //判断是老版mdl还是新版mdl字段在于platform
            if (oldsoftJSON instanceof Array) {
                if (oldsoftJSON.length != 0) {
                    for (var j = 0; j < oldsoftJSON.length; j++) {
                        softDemands.push({
                            name: oldsoftJSON[j].$.name,
                            platform: oldsoftJSON[j].$.platform == undefined ? 'null' : oldsoftJSON[j].$.platform,
                            version: oldsoftJSON[j]._
                        });
                    }
                }
            } else {
                softDemands.push({
                    name: oldsoftJSON.$.name,
                    platform: oldsoftJSON.$.platform == undefined ? 'null' : oldsoftJSON.$.platform,
                    version: oldsoftJSON.$._
                });
            }
        } else {
            softJSON = [];
        }
    } else {
        //判断是老版mdl还是新版mdl字段在于platform
        if (softJSON instanceof Array) {
            if (softJSON.length != 0) {
                for (var j = 0; j < softJSON.length; j++) {
                    softDemands.push({
                        name: softJSON[j].$.key,
                        platform: softJSON[j].$.platform == 'null' ? false : softJSON[j].$.platform,
                        version: softJSON[j].$.value
                    });
                }
            }
        } else {
            softDemands.push({
                name: softJSON.$.key,
                platform: softJSON.$.platform == 'null' ? false : softJSON.$.platform,
                version: softJSON.$.value
            });
        }

    }

    cb({
        swe: softDemands,
        hwe: hardDemands
    });
};

ModelSerControl.addDefaultTestify = function (msid, cb) {
    testifyCtrl.addDefaultTestify(msid, ModelSerControl.getInputData, cb);
};

// 根据OID更新数据库modelservice下的ms_status字段
ModelSerControl.updateMsByOID = function (ms_id, callback) {
    ModelSerModel.getByOID(ms_id, function (err, ms) {
        if (err) {
            return callback(err);
        }
        if (ms.ms_status == 0) {
            return callback(null, ms.ms_id);
        } else {
            ms.ms_status = 0;
            ModelSerModel.update(ms, function (err, result) {
                if (err) {
                    return callback(err);
                }
                return callback(null, result);
            })
        }
    })
};

// 模型部署时环境匹配失败后根据OID删除模型部署包并在本地数据库中删除该数据记录
ModelSerControl.deleteMsDeployPackageByOID = function (ms_id, callback) {
    ModelSerModel.getByOID(ms_id, function (err, item) {
        if (err) {
            return callback(err);
        }
        //删除文件
        FileOpera.rmdir(setting.dirname + '/geo_model/' + item.ms_path);
        //删除存放在temp文件下的模型部署包
        FileOpera.rmdir(setting.dirname + '/geo_model/' + 'packages/' + ms_id + '.zip');
        //删除模型服务记录
        ModelSerModel.delete(ms_id, function (err, result) {
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        })
    })
};

//根据pid获取模型部署包路径
ModelSerControl.getDeployPackagePathByPid = function (pid, callback) {
    ModelSerModel.getByPID(pid, function (err, ms) {
        if (err) {
            return callback(err);
        } else {
            if (!ms || ms.length == 0)
                return callback({ code: 'could not found relate model!' });
            ms = ms[0];
            var path = setting.dirname + '/geo_model/' + 'packages/' + ms._id + '.zip';
            var filename = ms._id + '.zip';
            var result = {
                path: path,
                filename: filename
            };
            return callback(null, result);
        }
    })
}

//得到模型服务State的逻辑流程图
ModelSerControl.getModelDiagram = function (msid, callback) {
    ModelSerModel.getByOID(msid, function (err, data) {
        if (err) {
            return callback(err);
        }
        if (data == undefined || data == null) {
            return callback(new Error('No record!'));
        }
        try {
            var mdl = new MDLParser();
            mdl.loadFromJSONStream(data.ms_xml);
            return callback(null, mdl.Behavior);
        } catch (error) {
            return callback(new Error('Error in parse MDL!'));
        }
    })
}

//任务结束
ModelSerControl.taskFinished = function (msr, callback) {//这个回调函数是打印结果是否正确
    console.log("Task Model has run successfully!")
    var task = null;
    for (var i = 0; i < global.tasks.length; i++) {
        if (global.tasks[i].msrid == msr._id) {
            task = global.tasks[i];
            break;
        }
    }
    if (task == null) {
        return;
    }

    // SystemCtrl.getTaskServerInfo -> getTaskServerInfo
    getTaskServerInfo(function (err, server) {
        if (err) {
            return callback(err);
        }
        CommonMethod.getMac(function (err, mac) {
            if (err) {
                return callback(err);
            }
            var outputs = [];

            //! local network
            // if(task.type == 1){
            //     for(var i = 0; i < msr.msr_output.length; i++){
            //         var url = null;
            //         if(msr.msr_output[i].DataId != ''){
            //             url = 'http://' + task.ipport + '/geodata/' + msr.msr_output[i].DataId;
            //         }
            //         outputs.push({
            //             "StateName" : msr.msr_output[i].StateName,
            //             "Event" : msr.msr_output[i].Event,
            //             "Url" : url,
            //             "Tag" : msr.msr_output[i].Tag
            //         })
            //     }
            //     // Repetitive code can be extracted as a single function
            //     var form = {
            //         mac : mac,
            //         status : msr.msr_status,
            //         outputs : JSON.stringify(outputs)
            //     }
            //     var url = 'http://' + server.ip + ':' + server.port.toString() + '/task/' + task.taskid;
            //     request.put(url, {
            //         form : form
            //     }, function (err, response) {
            //         if(err){
            //             return callback(err);
            //         }
            //         var resJson = JSON.parse(response.body);
            //         if(resJson['result'] == 'suc'){
            //             //Task finished , remove this task from global tasks
            //             var taskid = task.taskid;
            //             for(var j = 0; j < global.tasks.length; j++){
            //                 if(taskid == global.tasks[j].taskid){
            //                     global.tasks.splice(j, 1);
            //                 }
            //             }
            //             return callback(null, true);
            //         }
            //         return callback(null, false);
            //     });
            // }else if(task.type == 2){
            //Internet, which need to upload output data to DataExchange Server or Data Container
            // get DataExchange Server or Data Container
            ModelSerControl.getDataServer(server, function (err, dataServer) {
                if (err) {
                    return callback(err);
                }
                var size = msr.msr_output.length;
                var count = 0;
                var userName = task.username;
                // build the callback function

                var pending = function (index) {
                    count++;
                    return function (err, result) {
                        count--;
                        if (err) {
                            console.error("Upload failed:", err.message);
                            // return callback(err);
                            result = {
                                suffix : "",
                                url : "Error in uploading data!" + err.message
                            }
                        }
                        if (!result){
                            result = {
                                suffix : "",
                                url : ""
                            }
                        }
                        for (var i = 0; i < outputs.length; i++) {
                            if (msr.msr_output[index].StateName == outputs[i].StateName && msr.msr_output[index].Event == outputs[i].Event) {
                                if (typeof outputs[i].Url == "object" && outputs[i].Url.length) {
                                    outputs[i].Url.push(result.url);
                                    console.log("From thrid ... ");
                                }
                                else {
                                    outputs[i].Url = [outputs[i].Url];
                                    outputs[i].Url.push(result.url)
                                    console.log("The second ... ");
                                }
                                break;
                            }
                        }
                        if (i == outputs.length) {
                            outputs.push({
                                "StateName": msr.msr_output[index].StateName,
                                "Event": msr.msr_output[index].Event,
                                "Url": result.url,
                                "Tag": msr.msr_output[index].Tag,
                                "Suffix": result.suffix
                            });
                            // console.log("The first ... ");
                        }
                        if (count == 0) {
                            //handle the data and put the result to the TaskServer
                            // !!important
                            if (msr.m_logs) {
                                var form = {
                                    mac: mac,
                                    status: msr.msr_status,
                                    outputs: JSON.stringify(outputs),
                                    note: JSON.stringify({
                                        runninginfo: msr.msr_runninginfo,
                                        logs: msr.msr_logs,
                                        m_logs: msr.m_logs,
                                    }),
                                    msr_logs: JSON.stringify(msr.msr_logs),
                                    m_logs: msr.m_logs.join('\n'),
                                };
                            } else {
                                var form = {
                                    mac: mac,
                                    status: msr.msr_status,
                                    outputs: JSON.stringify(outputs),
                                    note: JSON.stringify({
                                        runninginfo: msr.msr_runninginfo,
                                        logs: msr.msr_logs,
                                        m_logs: msr.m_logs,
                                    }),
                                    msr_logs: JSON.stringify(msr.msr_logs),
                                    m_logs: msr.m_logs,
                                }
                            }
                            var url = 'http://' + server.ip + ':' + server.port.toString() + '/task/' + task.taskid;
                            request.put(url, { form: form }, function (err, response) {
                                if (err) {
                                    return callback(err);
                                }
                                var resJson = JSON.parse(response.body);
                                if (resJson['result'] == 'suc') {
                                    //Task finished , remove this task from global tasks
                                    var taskid = task.taskid;
                                    for (var j = 0; j < global.tasks.length; j++) {
                                        if (taskid == global.tasks[j].taskid) {
                                            global.tasks.splice(j, 1);
                                        }
                                    }
                                    return callback(null, true);
                                }
                                return callback(null, false);
                            })
                        }
                    }
                };

                //judge the type
                var serverType = dataServer.type;
                var ipAndPort = dataServer.ipAndPort;
                if (serverType == 1) {
                    for (var i = 0; i < size; i++) {
                        //Output data post to the DataExchange server
                        var dataId = msr.msr_output[i].DataId;
                        if((typeof dataId == "object") && dataId.length){
                            for(var k = 0; k < dataId.length; k++){
                                ModelSerControl.uploadOutputData(dataId[k], ipAndPort, pending(i));
                            }
                        }
                        else{
                            ModelSerControl.uploadOutputData(dataId, ipAndPort, pending(i));
                        }
                    }
                } else {
                    for (var i = 0; i < size; i++) {
                        //Output data post to the Data Container server
                        var dataId = msr.msr_output[i].DataId;
                        if((typeof dataId == "object") && dataId.length){
                            for(var k = 0; k < dataId.length; k++){
                                ModelSerControl.uploadOutputDataToDataServer(dataId[k], ipAndPort, userName, pending(i));
                            }
                        }
                        else{
                            ModelSerControl.uploadOutputDataToDataServer(dataId, ipAndPort, userName, pending(i));
                        }
                    }
                }
            })
            //}
        });
    });
}

//! post output data to data exchange server by data id
ModelSerControl.uploadOutputData = function (dataId, dataExchangeServer, callback) {
    //add judge, judge the output data result is or not null
    if (dataId === '' || dataId == null) {
        return callback(null, false);
    }
    GeoDataCtrl.getByKey(dataId, function (err, gd) {
        if (err) {
            return callback(err);
        }
        var outputPath = '';
        if (fs.existsSync(gd.gd_value)) {
            outputPath = gd.gd_value;
        }
        else {
            outputPath = setting.dirname + '/geo_data/' + gd.gd_value;
        }

        var ext = gd.gd_value.substr(gd.gd_value.lastIndexOf('.') + 1);
        // build post form 
        var formData = {
            datatag: gd.gd_tag,
            datafile: fs.createReadStream(outputPath)
        };
        var url = 'http://' + dataExchangeServer + '/data';
        var options = {
            uri: url,
            formData: formData,
            headers: {
                'content-type': 'multipart/form-data'
            }
        };
        request.post(options, function (err, response) {
            if (err) {
                return callback(err);
            }
            var resJson = JSON.parse(response.body);
            if (resJson.result == 'suc') {
                var pwd = resJson.data.d_pwd;
                pwd = CommonMethod.decryption(pwd);
                var id = resJson.data.id;
                var dataUrl = 'http://' + dataExchangeServer + '/data/' + id + '?pwd=' + pwd;
                var result = {
                    suffix: ext,
                    url: dataUrl
                };
                return callback(null, result);
            }
            return callback(null, false);
        })
    })


}

//! get suitable data exchange server through request method(recommend)
ModelSerControl.getDataServer = function (server, callback) {
    let url = 'http://' + server.ip + ':' + server.port + '/dxserver?ac=recommend';
    request.get(url, function (err, response) {
        if (err) {
            return callback(err);
        }
        var resJson = JSON.parse(response.body);
        if (resJson.result == 'suc') {
            let ip = resJson.data.ds_ip;
            let port = resJson.data.ds_port;
            let ipAndPort = ip + ':' + port;
            let type = resJson.data.type;
            let dataExchangeServer = {
                ipAndPort: ipAndPort,
                type: type
            };
            return callback(null, dataExchangeServer);
        }
        return callback(resJson.message);
    })
}

//! post output data to data service container by dataId
ModelSerControl.uploadOutputDataToDataServer = function (dataId, dataStoreServer, userName, callback) {
    //add judge, judge the output data result is or not null
    if (dataId === '' || dataId == null) {
        return callback(null, false);
    }
    GeoDataCtrl.getByKey(dataId, function (err, gd) {
        if (err) {
            return callback(err);
        }
        var outputPath = '';
        if (fs.existsSync(gd.gd_value)) {
            outputPath = gd.gd_value;
        }
        else {
            outputPath = setting.dirname + '/geo_data/' + gd.gd_value;
        }
        var ext = gd.gd_value.substr(gd.gd_value.lastIndexOf('.') + 1);
        //get fileName and file ext(fileName not include ext)
        var fileName = '';
        if (gd.gd_tag.lastIndexOf('.') == -1) {
            fileName = dataId;
        } else {
            fileName = gd.gd_tag.substr(0, gd.gd_tag.lastIndexOf('.'));
        }
        //build post form
        var formData = {
            file: fs.createReadStream(outputPath)
        };
        var url = 'http://' + dataStoreServer + '/data';
        var options = {
            uri: url,
            formData: formData,
            headers: {
                'content-type': 'multipart/form-data'
            }
        };

        request.post(options, function (err, response) {
            console.log("1request --- ");
            if (err) {
                return callback(err);
            }
            var resJson = JSON.parse(response.body);
            if (resJson.code == 0) {
                var pwd = resJson.data.source_store_id;
                //Splicing url
                var dataUrl = 'http://' + dataStoreServer + '/data';
                var form = {
                    author: userName,
                    fileName: fileName,
                    sourceStoreId: pwd,
                    suffix: ext,
                    type: "OTHER",
                    fromWhere: "MODELCONTAINER"
                };

                //Post request to add data to resource
                request.post(dataUrl, { body: form, json: true }, function (err, result) {
                    console.log("2request --- ");
                    if (err) {
                        return callback(err);
                    }
                    var resultJson = result.body;
                    if (resultJson.code == 0) {
                        console.log("3request --- ");
                        //Splicing result url
                        var resultUrl = 'http://' + dataStoreServer + '/data' + pwd;
                        var outputResult = {
                            suffix: ext,
                            url: resultUrl
                        };
                        return callback(null, outputResult);
                    } else {
                        return callback(null, false);
                    }
                })
            } else {
                return callback(null, false);
            }
        })
    })
}

function getTaskServerInfo(callback) {
    systemSettingModel.getValueByIndex('taskServer', function (err, item) {
        if (err) {
            return callback(err);
        }
        systemSettingModel.getValueByIndex('taskType', function (err, itemType) {
            if (err) {
                return callback(err);
            }
            var server = item.ss_value;
            var ip = server.substr(0, server.indexOf(':'));
            var port = parseInt(server.substr(server.indexOf(':') + 1));
            return callback(null, {
                ip: ip,
                port: port,
                type: parseInt(itemType.ss_value)
            });
        });
    });
}