//created by wangming on 2018.1.24
var formidable = require('formidable');
var unzip = require('unzip');
var fs = require('graceful-fs');
var uuid = require('node-uuid');
// var ObjectId = require('mongodb').ObjectID;
var ObjectId = require('bson').ObjectID;
var Setting = require('../setting');
var ControlBase = require('./controlBase');
var path = require('path');
var setting = require('../setting');

// var VisualizeSerModel = require('../model/visualizeService');
// var VisualizeSerModel = require('../model/visualizeService_n');
var VisualizeSerModel = require('../model/dbSwitcher').visualizeService;
var FileOpera = require('../utils/fileOpera');
var CommonMethod = require('../utils/commonMethod');

var DataVisualizeControl = function () { };

DataVisualizeControl.__proto__ = ControlBase;

module.exports = DataVisualizeControl;

//新增可视化服务
DataVisualizeControl.NewVisualizeSer = function (req, callback) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = Setting.visualizationpath + 'tmp/';
    form.keepExtensions = true;
    form.maxFieldsSize = 1024 * 1024 * 1024;

    //解析请求
    form.parse(req, function (err, fields, files) {
        if (err) {
            return callback(err);
        }
        fields.u_name = '[Unknown]';
        fields.u_email = '[Unknown]';
        if (req.session.admin) {
            fields.u_name = req.session.admin;
            fields.u_email = '[Unknown]';
        }
        DataVisualizeControl.addNewVisualizeSer(fields, files, this.returnFunction(callback, 'err in new a visualization service'));
    }.bind(this));

    //初始化文件传输进度
    global.fileupload.add({
        sessionId: req.sessionID,
        process: 0
    });
    //上传过程中传递进度
    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent = Math.round(bytesReceived / bytesExpected * 100);
        var newItem = {
            sessionId: req.sessionID,
            value: percent
        };
        global.fileupload.update(newItem);
    });
};

//新增可视化服务，先解压到以_oid命名的文件夹，验证成功再添加记录，失败不添加记录并删除文件夹
DataVisualizeControl.addNewVisualizeSer = function (fields, files, callback) {
    var date = new Date();
    var sSnapshot = null;
    if (files.ms_img) {
        //var imgType = files.ms_img.name.split('.')[1];
        var imageBuf = fs.readFileSync(files.ms_img.path);
        if (imageBuf.length != 0) {
            //生成数据快照
            sSnapshot = 'data:image/png;base64,' + imageBuf.toString("base64");
        }else{
            var imageBuf = fs.readFileSync(setting.visualizationpath + '../public/images/logo1.png');
            //生成数据快照
            sSnapshot = 'data:image/png;base64,' + imageBuf.toString("base64");
        }

    } else {
        var imageBuf = fs.readFileSync(setting.visualizationpath + '../public/images/logo1.png');
        //生成数据快照
        sSnapshot = 'data:image/png;base64,' + imageBuf.toString("base64");
    }



    // if (files.ms_img) {
    //     if (files.ms_img.size != 0) {
    //         img = uuid.v1() + path.extname(files.ms_img.path);
    //         fs.renameSync(files.ms_img.path, setting.visualizationpath + '../public/images/visualizationImg/' + img);
    //     } else {
    //         FileOpera.rmdir(files.ms_img.path);
    //     }
    // }

    if (!files.file_visualize) {
        return callback(new Error("No Package file"));
    }

    //生成新的oid
    var oid = new ObjectId().toString();

    //解压路径
    var visualize_path = setting.visualizationpath + oid.toString() + '/';
    //MD5码
    FileOpera.getMD5(files.file_visualize.path, function (err, md5_value) {
        if (err) {
            return callback(err);
        }
        //解压文件并进行数据库的存储
        CommonMethod.Uncompress(files.file_visualize.path, visualize_path, function (err) {
            if (err) {
                return callback(err);
            }

            //Linux上添加模型运行权限文件
            if (setting.platform == 2) {
                //未完成

            }

            //删除文件
            FileOpera.rmdir(files.file_visualize.path);

            //读取可视化服务部署包里面的DataVisualizationMethod.xml文件
            VisualizeSerModel.readConfigByPath(setting.visualizationpath + oid + '/DataVisualizationMethod.xml', function (err, cfg) {
                if (err) {
                    console.log(err);
                    return callback(err, { status: 1, cfg: false });
                }

                try {
                    fields.vs_name = cfg.DataVisualizationMethod.$.wkname;
                    var attr = cfg.DataVisualizationMethod.Localizations.Localization;
                    if (attr.constructor == Array) {
                        var i;
                        for (i = 0; i < attr.length; i++) {
                            if (attr[i].$.local == 'ZH_CN') {
                                attr = attr[i];
                                break;
                            }
                            if (i == attr.length) {
                                attr = attr[0];
                            }
                        }
                    } else if (attr.constructor == Object) {
                        attr = attr;
                    }
                    //test
                    var result = attr.Abstract.replace(/[\r\n]/g, '').trim();
                    fields.vs_des = result;
                    fields.vs_url = attr.Wiki.Add;
                } catch (ex) {
                    return callback(ex);
                }
                //新路径
                var newPath = setting.visualizationpath + fields.vs_name + '_' + oid.toString();

                //生成新的可视化数据记录
                var newvisualizeser = {
                    _id: oid,
                    vs_model: Object.assign({
                        vs_name: fields.vs_name,
                        p_id: md5_value,
                        vs_url: fields.vs_url
                    }, fields.v_visualize_append),
                    vs_user: {
                        u_name: fields.u_name,
                        u_email: fields.u_email
                    },
                    vs_update: date.toLocaleString(),
                    vs_path: fields.vs_name + '_' + oid.toString() + '/',
                    vs_status: 0,
                    vs_source: 0,
                    vs_limited: fields.vs_limited,
                    vs_img: sSnapshot,
                    vs_des: fields.vs_des
                };

                var vs = new VisualizeSerModel(newvisualizeser);
                VisualizeSerModel.save(vs, function (err, data) {
                    if (err) {
                        console.log(err);
                        callback(null, { status: 0 });
                    } else {
                        fs.rename(visualize_path, newPath, (err) => {
                            if (err) {
                                console.log(err);
                                callback(null, { status: 0 });
                            }
                            return callback(null, { isValidate: true, data: vs });
                        });
                    }
                });
            });
        });
    });

};

//获取本地所有可视化服务信息
DataVisualizeControl.getLocalVisualizeSer = function (callback) {
    VisualizeSerModel.getAll('AVAI', this.returnFunction(callback, 'error in getting all visualize services'));
};

//根据OID获取可视化服务信息
DataVisualizeControl.getByOID = function (vsid, callback) {
    VisualizeSerModel.getByOID(vsid, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

//调用可视化服务获取调用路径信息
DataVisualizeControl.getInvokeVisualizeSer = function(vsid,callback){
    VisualizeSerModel.getByOID(vsid,function(err,data){
        if(err){
            return callback(err);
        }
        var content = {
            path: ''
        };
        var filePath = '/visualization/' + data.vs_path + 'index.html?filename1=' + '/geodata/';
        content.path = filePath;
        return callback(null,content);
    })
}

//更新可视化服务信息
DataVisualizeControl.update = function (vs, callback) {
    VisualizeSerModel.update(vs, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    })
};

//将记录放置在回收站，并删除文件
DataVisualizeControl.deleteToTrush = function (_oid, callback) {
    var oid = _oid;
    VisualizeSerModel.getByOID(oid, function (err, item) {
        if (err) {
            return callback(err);
        }
        item.vs_status = -1;
        VisualizeSerModel.update(item, function (err, vs) {
            if (err) {
                return callback(err);
            }
            //删除文件
            FileOpera.rmdir(setting.visualizationpath + vs.vs_path);
            return callback(null, item);
        });
    });
};

//检查数据容器是否可用
DataVisualizeControl.checkServer = function (server, form, callback) {

}