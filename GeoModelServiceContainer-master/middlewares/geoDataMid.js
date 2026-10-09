/**
 * Created by Franklin on 2017/5/27.
 */

var formidable = require('formidable');
var uuid = require('node-uuid');
var fs = require('fs');
var parseString  = require('xml2js').parseString;
var setting = require('../setting');
var MidBase = require('./midBase');
var GeoDataCtrl = require('../control/geoDataControl');

var GeoDataMid = function () { };
GeoDataMid.__proto__ = MidBase;
module.exports = GeoDataMid;

GeoDataMid.postStreamData = function (req, callback) {
    var data = req.body.data;
    var gd_tag = '';
    var gd_destroy = 'FALSE';
    if (req.body.gd_tag) {
        gd_tag = req.body.gd_tag;
    }
    if (req.body.gd_destroy) {
        gd_destroy = req.body.gd_destroy;
    }
    console.log("parsing...");
    //生成数据ID
    parseString(data, function(errors, response){
        var ext = "";
        if(errors){
            
        }
        else{
            ext = ".xml";
        }
        var gdid = 'gd_' + uuid.v1();
        var filename = gdid + ext;
        var options = { encoding: 'utf8' };
        fs.writeFile(setting.dirname + '/geo_data/' + filename, data, options, function (err) {
            if (err) {
                return callback(err);
            }
            console.log("write success");

            fs.stat(setting.dirname + '/geo_data/' + filename, (err, stats) => {
                if (err) {
                    return callback(err);
                }
                //存入数据库
                var geodata = {
                    gd_id: gdid,
                    gd_tag: gd_tag,
                    gd_type: 'FILE',
                    gd_size: stats.size,
                    gd_value: filename
                };
                //添加记录
                GeoDataCtrl.addData(geodata, (err, blsuc) =>{
                    if(err){
                        return callback(err);
                    }
                    return callback(null,gdid);
                });
            });
        });
    });
    
}

GeoDataMid.postFileData = function (req, callback) {
    var form = new formidable.IncomingForm();               //创建上传表单
    form.encoding = 'utf-8';		                        //设置编辑
    form.uploadDir = setting.dirname + '/geo_data/';   //设置上传目录
    form.keepExtensions = true;                             //保留后缀
    form.maxFieldSize  = 1024 * 1024 * 50;                   //字段大小
    form.maxFileSize = 500 * 1024 * 1024 * 1024;                 //文件大小

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        //找数据的后缀名
        if(files.myfile == undefined){
            return callback(new Error(""));
        }
        var ext = files.myfile.name;
        ext = ext.substr(ext.lastIndexOf('.') + 1);
        var type = 'RAW';
        
        
        if (ext == 'zip') {
            type = 'ZIP';
        }
        else if (ext == 'xml') {
            type = 'XML';
        }

        //生成数据ID
        var gdid = 'gd_' + uuid.v1();
        var fname = gdid + '.' + ext;

        //读取文件状态
        if (files.myfile == undefined) {
            return callback(new Error('Can not find data file!'));
        }
        var gd_tag = '';
        if (fields.gd_tag) {
            gd_tag = fields.gd_tag;
        }
        fs.stat(files.myfile.path, function (err, stats) {
            if (err) {
                return callback(err);
            }
            //重命名
            fs.rename(files.myfile.path, setting.dirname + '/geo_data/' + fname, function () {
                //存入数据库
                var geodata = {
                    gd_id: gdid,
                    gd_tag: gd_tag,
                    gd_type: type,
                    gd_size: stats.size - 16,
                    gd_value: fname
                };

                //添加记录
                GeoDataCtrl.addData(geodata, function (err, blsuc) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, gdid);
                });
            });
        });
    });
}

GeoDataMid.postUrlData = function (req, callback) {
    var url = req.body.data;
    var gd_tag = '';
    if (req.body.gd_tag) {
        gd_tag = req.body.gd_tag;
    }
    GeoDataCtrl.downloadByURL(url, {gd_tag : gd_tag}, this.returnFunction(callback, 'Error in downloading data by URL'));
}