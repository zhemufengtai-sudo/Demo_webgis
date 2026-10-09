var RouteBase = require('../routeBase');
var ModelSerRunCtrl = require('../../control/modelSerRunControl');
var zip = require('node-native-zip');
var GeoDataCtrl = require('../../control/geoDataControl');
var ModelSerCtrl = require('../../control/modelSerControl');

module.exports = function (app) {
    //! View 界面
    //获取模型服务记录界面
    app.route('/public/modelserrun/:msrid')
        .get(function (req, res, next) {
            var msrid = req.params.msrid;
            ModelSerRunCtrl.getByOID(msrid, function (err, msr) {
                if (err) {
                    return res.end('Error : ' + err);
                }
                if (msr == null) {
                    return res.end("Err : Msr is NULL ! ");
                }
                ModelSerCtrl.getByOID(msr.ms_id, function (err, ms) {
                    if (err) {
                        return res.end('Error : ' + err);
                    }
                    if (ms.ms_limited == 1) {
                        if (req.session.user) {
                            ModelSerAccessCtrl.authMsrID(msrid, req.session.user, req.session.pwd, function (err, result) {
                                if (err) {
                                    return res.end('Error : ' + err);
                                }
                                if (result) {
                                    return res.render('customModelSerRun', {
                                        msr: msr
                                    });
                                }
                            });
                        }
                        else {
                            return res.render('customLogin');
                        }
                    }
                    else {
                        return res.render('customModelSerRun', {
                            msr: msr
                        });
                    }
                });
            });
        })
        .post(function (req, res, next) {
            var msrid = req.params.msrid;
            ModelSerAccessCtrl.authMsrID(msrid, req.body.username, req.body.pwd, function (err, result) {
                if (err) {
                    return res.end('Error : ' + JSON.stringify(err));
                }
                if (result) {
                    req.session.user = req.body.username;
                    req.session.pwd = req.body.pwd;
                    return res.redirect('/public/modelserrun/' + msrid);
                }
                else {
                    res.end('User name or password error !');
                }
            });
        });

    //! API
    app.route('/modelserrun/json/:msrid')
        .get(function (req, res, next) {
            var msrid = req.params.msrid;
            if (msrid == 'all') {
                next();
            }
            else {
                ModelSerRunCtrl.getByOID(msrid, RouteBase.returnFunction(res, 'Error in getting MSR!'));
            }

        });

    //根据msrid下载模型运行日志
    app.route('/modelser/downloadLog/:msrid')
        .get(function (req, res, next) {
            var msrid = req.params.msrid;
            ModelSerRunCtrl.getModelSerLogs(msrid, function (err, result) {
                if (err) {
                    return res.end('error');
                }
                fs.readFile(result.path, function (err, data) {
                    if (err) {
                        return res.end('error');
                    }

                    res.set({
                        'Content-Type': 'file/*',
                        'Content-Length': data.length
                    });
                    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(result.filename));
                    res.end(data);
                })
            });
        });

    //获取模型运行中间数据API
    app.route('/modelserrun/processdata/:msrid')
        .get(function (req, res, next) {
            var msrid = req.params.msrid;
            if (msrid == "all") {
                return res.end('error');
            } else {
                //将过程数据打包进行传输
                ModelSerRunCtrl.getProcessDataByOID(msrid, function (err, data) {
                    if (err) {
                        return res.end('Error: ' + JSON.stringify(err));
                    }
                    var processDataPath = [];
                    //for 循环根据数据id获取数据名称
                    if (data.length == 0) {
                        return res.end('this model has no process data');
                    } else {
                        GeoDataCtrl.getByKeyArray(data,function(err,processDataPath){
                            if(err){
                                return res.end('error');
                            }
                            var archive = new zip();
                            archive.addFiles(processDataPath, function (err) {
                                if (err) {
                                    console.log("err while adding files", err);
                                    return res.end('error');
                                }
                                var buff = archive.toBuffer();
                                var zipname = 'default.zip';
                                res.set({
                                    'Content-Type': 'file/*',
                                    'Content-Length': buff.length
                                });
                                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(zipname));
                                res.end(buff);
                            })
                        });
                        
                    }
                });
            }

        });

    //将模型运行结果数据上传至特定数据服务器
    app.route('/modelserrun/output/:msrid')
       .post(function(req ,res , next){
            var msrid = req.params.msrid;
            var ip = '';
            try{
                ip = req.body.ip;
            }catch(ex){
                console.log('input error');
            }
            var port = 0;
            try{
                port = parseInt(req.body.port);
            }catch(ex){
                console.log('input error');
            }
            var userName = 'njgis';
            try{
                userName = req.body.userName;
            }catch(ex){
                console.log('input error');
            }
            //进行判断
            if(ip === '' || port == 0){
               return res.end(JSON.stringify({
                result : 'err',
                code : -1,
                message : 'Please input the right parameter information!'
               }));
            }

            ModelSerRunCtrl.uploadOutputToServer(msrid,ip,port,userName,function(err, result){
                if(err){
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : -1,
                        message : 'Please input the right parameter information!'
                       }));
                }
                return res.end(JSON.stringify({
                    result : 'suc',
                    code : 1,
                    data : result
                }));
            })      
       })
}