/**
 * Created by Franklin on 2016/8/1.
 * Control for GeoData
 */
// var GeoData = require('../model/geoData');
// var GeoData = require('../model/geoData_n');
var GeoData = require('../model/dbSwitcher').geoData;
var ParamCheck = require('../utils/paramCheck');
var RemoteReqControl = require('./remoteReqControl');
var CommonMethod = require('../utils/commonMethod');
var FileOpera = require('../utils/fileOpera');
var Settings = require('../setting');
var fs = require('fs');
var Promise = require('bluebird');
var Path = require('path');
var request = require('request');
var uuid = require('node-uuid');
const axios = require('axios');

function GeoDataCtrl() { }

module.exports = GeoDataCtrl;

//添加数据
GeoDataCtrl.addData = function (data, callback) {
    data['gd_datetime'] = CommonMethod.getDateTimeNow();
    GeoData.save(data, function (err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
};

//获取数据
GeoDataCtrl.getByKey = function (key, callback) {
    GeoData.getByKey(key, function (err, data) {
        if (err) {
            return callback(err);
        }
        //! TODO 找到这个数据的权限信息
        if (data.length != 0) {
            return callback(null, data[0]);
        }
        return callback(null, null);
    });
};

//更新数据
GeoDataCtrl.update = function (data, callback) {
    GeoData.updateByGdid(data, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

//删除数据
GeoDataCtrl.delete = function (key, callback) {
    GeoData.getByKey(key, function (err, item) {
        if (err) {
            return callback(err);
        }
        if (item == null) {
            return callback(null, {
                res: 'suc'
            });
        }
        if (item.length != undefined) {
            item = item[0];
        }
        FileOpera.rmdir(Settings.dirname + '/geo_data/' + item.gd_value);
        GeoData.remove(key, function (err, res) {
            if (err) {
                return callback(err);
            }
            return callback(null, {
                res: 'suc'
            });
        });
    });
};

//删除N天之前的数据
GeoDataCtrl.deleteByDay = function (day, callback) {
    if (ParamCheck.checkParam(callback, day)) {
        var date_now = new Date(new Date() - day * 24 * 60 * 60 * 1000);
        GeoDataCtrl.getAllData(function (err, data) {
            if (err) {
                return callback(err);
            }
            var count = data.length;
            for (var i = 0; i < data.length; i++) {
                var date = new Date(data[i].gd_datetime);
                if (date < date_now) {
                    GeoDataCtrl.delete(data[i].gd_id, function (err, data) {
                        count = count - 1;
                        if (count == 0) {
                            return callback(null, true);
                        }
                    });
                }
                else {
                    count = count - 1;
                    if (count == 0) {
                        return callback(null, true);
                    }
                }
            }
        });
    }
}

//删除运行实例中间数据
GeoDataCtrl.deleteAllInstanceTempData = function (callback) {
    //! TODO
}

//删除调试数据
GeoDataCtrl.deleteDebugData = function (callback) {
    //删除数据实体
    GeoData.getAllDebugData(function (err, items) {
        if (err) {
            return callback(err);
        }
        var dataCount = 0;
        var cb = function (index) {
            dataCount++;
            return function (err, data) {
                dataCount--;
                // if(err){
                //     //! TODO Data check error
                //     return;
                // }
                // if(data){
                //     FileOpera.rmdir(__dirname + '/../geo_data/' + items[index].gd_value);
                // }
                if (dataCount == 0) {
                    // GeoData.deleteDebugData(function(err, data){
                    //     if(err){
                    //         return callback(err);
                    //     }
                    //     return callback(null, true);
                    // });
                    return callback(null, true);
                }
            }
        }
        for (var i = 0; i < items.length; i++) {
            GeoDataCtrl.delete(items[i].gd_id, cb(i));
        }
        if (items.length == 0) {
            return callback(null, true);
        }
    });
}

//获取全部数据
GeoDataCtrl.getAllData = function (callback) {
    GeoData.getAll(function (err, items) {
        if (err) {
            return callback(err);
        }
        return callback(null, items);
    });
};

//上传数据流数据
GeoDataCtrl.addStreamData = function (gdid, gdtag, data, callback) {

    //存入数据库
    var geodata = {
        gd_id: gdid,
        gd_tag: gdtag,
        gd_type: 'STREAM',
        gd_value: data
    };

    //添加记录
    GeoDataCtrl.addData(geodata, function (err, blsuc) {
        if (err) {
            return res.end('Error : ' + err)
        }
        return res.end(JSON.stringify(
            {
                res: 'suc',
                gd_id: gdid
            }));
    });
};

//判断数据是否存在
GeoDataCtrl.exist = function (gdid, cb) {
    GeoData.getByKey(gdid, function (err, data) {
        if (err) {
            return cb(err);
        }
        if (data != null) {
            return cb(null, true);
        }
        return cb(null, false);
    });
};

//根据URL下载数据
GeoDataCtrl.downloadByURL = function (url, params, callback) {
    url = url.replace("http://geomodeling.njnu.edu.cn/dataTransferServer/", "http://221.224.35.86:38083/");
    request.get(url)
        .on('error', function (err) {
            console.log('err');
            return callback(err);
        })
        .on('response', function (res) {
            // console.log('返回内容：',JSON.stringify(res, null, 2));
            // console.log('状态码:', res.statusCode);
            // console.log('响应头:', JSON.stringify(res.headers, null, 2));

            if (res.statusCode !== 200) {
                return callback(new Error(`Failed to download data, status: ${res.statusCode}`));
            }

            const resContent = res.headers['content-disposition'];
            if (!resContent) {
                console.log('err');
                return callback(new Error("No content-disposition header."));
            }

            //生成数据ID
            let gdid = 'gd_' + uuid.v1();

            //找数据的后缀
            let ext = resContent.substr(resContent.lastIndexOf('.') + 1).replace("\"", "");
            let fname = gdid + '.' + ext;
            let zipFilePath = Settings.dirname + '/geo_data/' + fname;
            let type = "RAW";
            if (ext == 'zip') {
                type = 'ZIP';
            } else if (ext == 'xml') {
                type = "XML";
            }
            const writeStream = fs.createWriteStream(zipFilePath);
            res.pipe(writeStream).on('close', function () {
                writeStream.close();
            });
            writeStream.on('finish', function () {
                fs.stat(zipFilePath, function (err, stats) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }
                    //if (stats.size - 16 > Settings.data_size || type == 'ZIP') {
                    //存入数据库
                    var geodata = {
                        gd_id: gdid,
                        gd_tag: params.gd_tag,
                        gd_type: type,
                        gd_size: stats.size,
                        gd_value: fname
                    };

                    //添加纪录
                    GeoDataCtrl.addData(geodata, function (err, blsuc) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, gdid);
                    });
                    //} 
                    // else {
                    //     //读取数据
                    //     fs.readFile(zipFilePath, function (err, data) {
                    //         if (err) {
                    //             return callback(err);
                    //         }
                    //         var geodata = {
                    //             gd_id: gdid,
                    //             gd_tag: params.gd_tag,
                    //             gd_type: 'STREAM',
                    //             gd_size: stats.size - 16,
                    //             gd_value: data
                    //         };

                    //         //添加记录
                    //         GeoDataCtrl.addData(geodata, function (err, blsuc) {
                    //             if (err) {
                    //                 return callback(err);
                    //             }
                    //             fs.unlinkSync(zipFilePath);
                    //             return callback(null, gdid);
                    //         });
                    //     });
                    // }
                });
            });
        });
}

// 拿到数据坐标，下载数据并添加到数据库中
GeoDataCtrl.onReceivedDataPosition = function (dataPosition) {
    var self = this;
    var url = null;
    if (dataPosition.posType == 'LOCAL') {
        url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/detail/' + dataPosition.gdid;
        // url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/' + dataPosition.gdid;
    }
    else if (dataPosition.posType == 'MODEL SERVICE') {
        url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/detail/' + dataPosition.gdid;
        // url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/' + dataPosition.gdid;
    }
    else if (dataPosition.posType == 'DATA SERVICE') {
        url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/detail/' + dataPosition.gdid;
        // url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/' + dataPosition.gdid;
    }
    // 先查询有没有
    GeoDataCtrl.exist(dataPosition.gdid, function (err, exist) {
        if (err) {

        }
        else {
            if (exist) {

            }
            else {
                // 请求数据文件
                new Promise(function (resolve, reject) {
                    // request(url,function (err, response, body) {
                    //     if(err){
                    //         console.log(err);
                    //         // let data = JSON.stringify({error:err});
                    //         // return res.end(data);
                    //     }
                    //     else{
                    //         // res.set({
                    //         //     'Content-Type': response.headers['Content-Type'],
                    //         //     'Content-Length': response.headers['Content-Length']
                    //         // });
                    //         // res.setHeader('Content-Disposition', response.headers['content-disposition']);
                    //         // return res.end(new Buffer(body));
                    //
                    //         // save file
                    //         var hasFname = false;
                    //         var fname = response.headers['content-disposition'];
                    //         if(fname){
                    //             var index = fname.indexOf('filename=');
                    //             if(index != -1){
                    //                 fname = fname.substring(index + 9);
                    //                 hasFname = true;
                    //             }
                    //         }
                    //         if(!hasFname){
                    //             fname = 'gd_' + uuid.v1();
                    //         }
                    //         fname = Path.join(__dirname, '../geo_data',fname);
                    //         var stream = fs.createWriteStream(fname).pipe(body);
                    //     }
                    // });

                    RemoteReqControl.getByServer(url, null, function (err, res) {
                        if (err) {
                            return reject(err);
                        }
                        else {
                            return resolve(JSON.parse(res));
                        }
                    })
                })
                    // 保存数据
                    .then(function (gd) {
                        return new Promise(function (resolve, reject) {
                            if (gd.error) {
                                return reject(new Error(gd.error));
                            }

                            // if(gd.gd_type == 'STREAM'){
                            //     GeoDataCtrl.addData(gd,function (err, rst) {
                            //         if(err){
                            //             return reject(err);
                            //         }
                            //     })
                            // }
                            // else if(gd.gd_type == 'FILE'){

                            // output data has no fname!
                            var fname = gd.gd_fname;
                            var extName = Path.extname(fname);
                            // var extName = null;
                            var path = Path.join(Settings.dirname, '/geo_data/' + fname);
                            var fdata = null;
                            if (gd.gd_type == 'STREAM') {
                                gd.gd_type = 'FILE';
                                fdata = gd.gd_value;
                            }
                            else if (gd.gd_type == 'FILE' || gd.gd_type == 'XML') {
                                fdata = new Buffer(gd.gd_value, 'binary');
                            }
                            else if (gd.gd_type == 'ZIP') {
                                fdata = new Buffer(gd.gd_value, 'binary');
                            }
                            // TODO 写入二进制数据有时候不对！
                            fs.writeFile(path, fdata, function (err) {
                                if (err) {
                                    return reject(err);
                                }
                                else {
                                    if (extName == '.zip') {
                                        gd.gd_type = 'ZIP';
                                    }
                                    else if (extName == '.xml') {
                                        gd.gd_type = 'FILE';
                                    }

                                    gd.gd_value = fname;
                                    GeoDataCtrl.addData(gd, function (err, rst) {
                                        if (err) {
                                            return reject(err);
                                        }
                                    })
                                }
                            });
                            // }
                        })
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            }
        }
    });
};

//add by wangming at 2018.4.23 根据包含数据id的数组，获取所有数据的路径组成数组返回
GeoDataCtrl.getByKeyArray = function (KeyArray, callback) {
    if (KeyArray.length == 0) {
        return callback(null, []);
    }
    var count = 0;

    var pending = function (index) {
        count++;
        return function (err, result) {
            count--;
            if (err) {
                return callback(err, []);
            } else {
                KeyArray[index].path = Settings.dirname + '/geo_data/' + result.gd_value;
            }
            if (count == 0) {
                return callback(null, KeyArray);
            }
        }
    };

    for (var i = 0; i < KeyArray.length; i++) {
        GeoDataCtrl.getByKey(KeyArray[i].path, pending(i));
    }
}