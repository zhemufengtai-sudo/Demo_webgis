var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var formidable = require('formidable');
var uuid = require('node-uuid');
var unzip = require('unzip');

var NoticeCtrl = require('../../control/noticeCtrl');
var setting = require('../../setting');
var ModelSerRunCtrl = require('../../control/modelSerRunControl');
var ModelSerCtrl = require('../../control/modelSerControl');
var ModelIns = require('../../model/modelInstance');
var TaskCtrl = require('../../control/taskControl');

var ModelSerMid = require('../../middlewares/modelserMid');
var RouteBase = require('../routeBase');

var SWECtrl = require('../../control/softwareEnCtrl');
var HWECtrl = require('../../control/hardwareEnCtrl');
var testifyCtrl = require('../../control/testifyCtrl');

module.exports = function(app)
{
    //! View 界面
    // 管理员界面
    // 云服务
    app.route('/modelser/cloud')
        .get(function(req, res, next){
            res.render('cloudModelSers', {
                blmodelser : true
            });
        });
    //模型运行准备界面
    app.route('/modelser/preparation/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function(err, ms)
            {
                if(err)
                {
                    return res.end('Error in get modelService model : ' + JSON.stringify(err));
                }
                if(ms == null)
                {
                    return res.end("Can not find model service ! ");
                }
                
                return res.render('modelRunPro',{
                    // user:req.session.user,
                    modelSer:ms,
                    host:'localhost'
                });
            });
        });


    //! API
    //新增模型服务,新增判断type=1，是从门户进行直接部署
    app.route('/modelser')
        .post(function (req, res, next) {
            ModelSerMid.NewModelSer(req, function (err, rst) {
                if (err) {
                    if (rst) {
                        return res.end(JSON.stringify({
                            result: 'err',
                            code : -2,
                            message: rst
                        }));
                    } else {
                        return res.end(JSON.stringify({
                            result: 'err',
                            code : -1,
                            message: err.message
                        }));
                    }

                }
                if(rst.status == 0){
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : -3,
                        message : rst
                    }));
                }
                if(!rst.isValidate){
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : -4,
                        message : rst
                    }));
                }
                var type = 0;
                try{
                    type = parseInt(req.query.type);
                }catch (ex){
                    
                }
                if(type == 0){
                    res.end(JSON.stringify({
                        result : 'suc',
                        code : 1,
                        data : rst.data
                    }));
                }else{
                    //更改数据库记录， type = 1,从门户进行部署模型
                    var ms = rst.data;
                    ms.ms_status = 1;
                    ModelSerCtrl.update(ms, RouteBase.returnFunction(res, "Error in starting service!", null, -1, [
                        function(){TaskCtrl.synchronize(function(){});}
                    ]));
                    res.end(JSON.stringify({
                        result : 'suc',
                        code : 1,
                        data : rst.data
                    }));
                }            
            });
        });

    //获取上传文件百分比
    app.route('/modelser/file')
        .get(function (req, res, next) {
            console.log('sessionId:' + req.sessionID);
            console.log(global.fileupload.get(req.sessionID));
            var client = global.fileupload.get(req.sessionID);
            if (client != -1) {
                if (client.value == 100) {
                    global.fileupload.remove(client.sessionId);
                }
                res.end(JSON.stringify({
                    value:client.value
                }));
            }
            else {
                res.end(JSON.stringify({
                    value:100
                }));
            }
        });

    //通过PID下载模型部署包
    app.route('/modelser/cloud/packages/:pid')
        .get(function(req, res, next){
            var ac = req.query.ac;
            var fields = req.query.fields;
            var pid = req.params.pid;
            if(ac == 'download'){
                return ModelSerMid.getCloudPackage(fields, pid, RouteBase.returnFunction(res, 'error in down a model service!'));
            }
        });
    
    //展示某个模型服务及对模型的相关操作
    app.route('/modelser/:msid')
        //获取模型
        .get(function(req,res,next){
            var msid = req.params.msid;
            //获取全部模型页面
            if(msid == 'all'){
                //查询本地数据库全部数据
                ModelSerCtrl.getLocalModelSer(function(err, data)
                {
                    if(err)
                    {
                        return res.end('Error!');
                    }
                    return res.render('modelSers',
                        {
                            data:data,
                            blmodelser:true,
                            host:'localhost'
                        });
                });
            }
            //上传模型页面
            else if(msid == 'new'){
                //新增模型服务页面
                res.render('modelSerNew',
                    {
                        blmodelser : true,
                        host: 'localhost'
                    });
            }
            else{
                //展示某个模型
                ModelSerCtrl.getByOID(msid, function(err, ms){
                    if(err)
                    {
                        return res.end(JSON.stringify({
                            result : 'err',
                            code : -1,
                            message : "Error in get model information!"
                        }));
                    }
                    ModelSerRunCtrl.getByMSID(msid, function (err, msrs) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                result : 'err',
                                code : -1,
                                message : "Error in get model running records information!"
                            }));
                        }
                        return res.render('modelSer',{
                            // user:req.session.user,
                            modelSer : ms,
                            msrs : msrs,
                            blmodelser : true,
                            host : 'localhost',
                            port : setting.port
                        });
                    });
                });
            }
        })
        //更新模型
        .put(function (req, res, next) {
            var msid = req.params.msid;
            //停止服务
            if(req.query.ac == "stop")
            {
                if(msid == 'all'){
                    msids = req.query.msids;
                    ModelSerCtrl.batchStop(msids, RouteBase.returnFunction(res, 'Error in batch starting model services!', null, -1, [
                        function(){TaskCtrl.synchronize(function(){});}
                    ]));
                }
                else{
                    ModelSerCtrl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                code : -1,
                                message : "Error in getting model service information!"
                            }));
                        }
                        if(ms.ms_status == 0)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                code : -2,
                                message : "Service has been stopped!"
                            }));
                        }
                        else
                        {
                            ms.ms_status = 0;
                            ModelSerCtrl.update(ms, RouteBase.returnFunction(res, "Error in stoping service!", null, -1, [
                                function(){TaskCtrl.synchronize(function(){});}
                            ]));
                        }
                    });
                }
            }
            //开启服务
            else if(req.query.ac == "start")
            {
                if(msid == 'all'){
                    msids = req.query.msids;
                    ModelSerCtrl.batchStart(msids, RouteBase.returnFunction(res, 'Error in batch starting model services!', null, -1, [
                        function(){TaskCtrl.synchronize(function(){});}
                    ]));
                }
                else{
                    ModelSerCtrl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                code : -1,
                                message : "Error in getting model service information!"
                            }));
                        }
                        if(ms.ms_status == 1)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                code : -2,
                                message : "Service has been started!"
                            }));
                        }
                        else
                        {
                            ms.ms_status = 1;
                            ModelSerCtrl.update(ms, RouteBase.returnFunction(res, "Error in starting service!", null, -1, [
                                function(){TaskCtrl.synchronize(function(){});}
                            ]));
                        }
                    });
                }
            }
            //锁定服务
            else if(req.query.ac == "lock")
            {
                if(msid == 'all'){
                    msids = req.query.msids;
                    ModelSerCtrl.batchLock(msids, RouteBase.returnFunction(res, 'Error in batch starting model services!', null, -1, [
                        function(){TaskCtrl.synchronize(function(){});}
                    ]));
                }
                else{
                    ModelSerCtrl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                code : -1,
                                message : "Error in getting model service information!"
                            }));
                        }
                        if(ms.ms_limited == 1)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                code : -2,
                                message : "Service has been locked!"
                            }));
                        }
                        else
                        {
                            ms.ms_limited = 1;
                            ModelSerCtrl.update(ms, RouteBase.returnFunction(res, 'Error in locking model services!', null, -1, [
                                function(){TaskCtrl.synchronize(function(){});}
                            ]));
                        }
                    });
                }
            }
            //解锁服务
            else if(req.query.ac == "unlock")
            {
                if(msid == 'all'){
                    msids = req.query.msids;
                    ModelSerCtrl.batchUnlock(msids, RouteBase.returnFunction(res, 'Error in batch starting model services!', null, -1, [
                        function(){TaskCtrl.synchronize(function(){});}
                    ]));
                }
                else{
                    ModelSerCtrl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                code : -1,
                                message : "Error in getting model service information!"
                            }));
                        }
                        if(ms.ms_limited == 0)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                code : -2,
                                message : "Service has been unlocked!"
                            }));
                        }
                        else
                        {
                            ms.ms_limited = 0;
                            ModelSerCtrl.update(ms, RouteBase.returnFunction(res, 'Error in unlocking model services!', null, -1, [
                                function(){TaskCtrl.synchronize(function(){});}
                            ]));
                        }
                    });
                }
            }
            //登记服务
            else if(req.query.ac == 'register'){
                ModelSerCtrl.RegisterModelService(msid, RouteBase.returnFunction(res, 'Error in registering model service'));
            }
            //退登服务
            else if(req.query.ac == 'unregister'){
                ModelSerCtrl.UnregisterModelService(msid, RouteBase.returnFunction(res, 'Error in registering model service'));
            }
        })
        //删除模型服务
        .delete(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.deleteToTrush(msid, function (err, item) {
                if(err)
                {
                    return res.end(JSON.stringify({
                        result : "err",
                        code : -1,
                        message : "Error in getting model service information!"
                    }));
                }
                // 存储通知消息
                var noticeData = {
                    time:new Date(),
                    title:item.ms_model.m_name + ' deleted!',
                    detail:'',
                    type:'del-ms',
                    hasRead:false
                };
                NoticeCtrl.save(noticeData, RouteBase.returnFunction(res, "Error in deleting model service!"));
            });
        });

    // 下载mdl
    app.route('/modelser/mdl/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function (err, ms) {
                if(err)
                {
                    return res.end('error');
                }
                ModelSerCtrl.readCfg(ms,function (err, cfg) {
                    var filename = cfg.mdl;
                    var cfgPath = __dirname + '/../geo_model/' + ms.ms_path + filename;
                    fs.readFile(cfgPath, function (err, data) {
                        if(err)
                        {
                            return res.end('error');
                        }
                        res.set({
                            'Content-Type': 'file/xml',
                            'Content-Length': data.length });
                        var name = path.basename(filename);
                        res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(name));
                        res.end(data);
                    })
                });
            });
        });

    
    app.route('/modelser/testify/:msid')
        //删除测试数据
        .delete(function (req, res, next) {
            var msid = req.params.msid;
            var path = req.query.path;
            testifyCtrl.delTestify(msid, path, RouteBase.returnFunction(res, 'Error in deleting test data!'));
        });
        
    //获取某个Model_Service的JSON数据
    app.route('/modelser/json/:msid')
        .get(function(req,res,next) {
            var msid = req.params.msid;
            if(msid == 'all')
            {
                if(req.query.type == 'admin'){
                    next();
                }
                else{
                    ModelSerCtrl.getLocalModelSer(RouteBase.returnFunction(res, 'Error in getting all local model services'));
                }
            }
            else
            {
                ModelSerCtrl.getByOID(msid, function(err, ms)
                {
                    if(err)
                    {
                        return res.end(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in get modelSer"
                        }));
                    }
                    ModelSerRunCtrl.getByMSID(msid, function (err, msrs) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":"Error in get modelSerRun"
                            }));
                        }
                        return res.end(JSON.stringify({
                            'res' : 'suc',
                            modelSer : ms,
                            msrs : msrs
                        }));
                    });
                });
            }
        });

    //从数据库获取软硬件信息进行匹配,type类型匹配选择是软件还是硬件
    app.route('/modelser/tabledata/:pid')
        .get(function(req,res,next){
            var pid = req.params.pid;
            var place = req.query.place;
            var type = req.query.type;
            var enviroCtrl;
            if(type === 'swe'){
                enviroCtrl = SWECtrl;
            }else if(type === 'hwe'){
                enviroCtrl = HWECtrl;
            }

            enviroCtrl.getMatchTabledata(pid,place,function(err,data){
                if(err){
                    return res.end(JSON.stringify({err: err}));
                }
                return res.end(JSON.stringify({tabledata:data}));
            })
        });
    
    //新增接口，从其他服务器获取模型部署环境信息与该服务容器进行匹配，type选择是硬件还是软件
    app.route('/modelser/EnviroTable/:pid')
        .get(function(req,res,next){
            var pid = req.params.pid;
            var type = req.query.type;
            // sourceId 包含ip和端口, example: "172.21.212.119:8060"
            var sourceId = req.query.sourceId;
            var place = req.query.place;
            var enviroCtrl;
            if(type === 'swe'){
                enviroCtrl = SWECtrl;
            }else if(type === 'hwe'){
                enviroCtrl = HWECtrl;
            }

            enviroCtrl.getMatchTabledataFromServer(pid, sourceId, place,function(err,data){
                if(err){
                    return res.end(JSON.stringify({err: err}));
                }
                return res.end(JSON.stringify({tabledata:data}));
            })

        });

    //新增接口，从其他服务器获取模型部署包进行模型上传部署
    app.route('/modelser/deployService/:pid')
        .get(function(req,res,next){
            var pid = req.params.pid;
            var sourceId = req.query.sourceId;

            ModelSerMid.ModelMigration(pid,sourceId,RouteBase.returnFunction(res,'Error in Migration model service'));
        })
    
    //从本机获取Runtime节点信息(预留query参数给门户，判断是本地还是门户检测)
    app.route('/modelser/mdlRuntime/:pid')
       .get(function(req,res,next){
           var pid = req.params.pid;
           var place = req.query.place;
           ModelSerCtrl.getRuntimeByPid(pid,place,function(err,data){
               if(err){
                   res.end(JSON.stringify({err: err}));
               }
               return res.end(JSON.stringify({tabledata:data}));
           })
       });
}