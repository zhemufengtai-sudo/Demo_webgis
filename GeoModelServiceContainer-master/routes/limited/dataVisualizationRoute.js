// Created by wangming on 2018.1.23
var RouteBase = require('../routeBase');
var NoticeCtrl = require('../../control/noticeCtrl');
var setting = require('../../setting');
var DataVisualizeControl = require('../../control/dataVisualizeControl');
var NoticeCtrl = require('../../control/noticeCtrl');

module.exports = function (app) {

    app.route('/dataVisualize/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            var ac = req.query.ac;
            //获取全部可视化服务页面
            if (msid == 'all') {
                //查询本地数据库中全部可视化服务数据
                DataVisualizeControl.getLocalVisualizeSer(function(err,data){
                    if(err){
                        return res.end('Error!');
                    }

                    return res.render('dataVisualization');
                })

                
            }
            //上传可视化服务页面
            else if (msid == 'new') {
                //新增可视化服务页面

                res.render('dataVisualizationNew', {
                    blmodelser: true,
                    host: 'localhost'
                });

            } 
            //获取可视化文件包上传百分比
            else if (msid == 'file') {
                console.log('sessionId:' + req.sessionID);
                console.log(global.fileupload.get(req.sessionID));
                var client = global.fileupload.get(req.sessionID);
                if (client != -1) {
                    if (client.value == 100) {
                        global.fileupload.remove(client.sessionId);
                    }
                    res.end(JSON.stringify({
                        value: client.value
                    }));
                }
                else {
                    res.end(JSON.stringify({
                        value: 100
                    }));
                }
            }
            //单个可视化服务
            else{
                if(ac == 'invoke'){
                    //调用单个可视化服务
                    DataVisualizeControl.getInvokeVisualizeSer(msid,function(err,data){
                        if(err){
                            return res.end(JSON.stringify({
                                result: 'err',
                                message:JSON.stringify(err)
                            }))
                        }

                        return res.end(JSON.stringify({
                            result: 'suc',
                            data: data
                        }));
                    })

                }else{
                    console.log("fuck!!!");
                }

            }
        })
        //更新可视化服务
        .put(function(req,res,next){
            var msid = req.params.msid;
            //停止服务
            if(req.query.ac == "stop"){
                if(msid == 'all'){
                    //该接口留给批量停止可视化服务，还未实现
                    console.log("hahahaha");
                }else{
                    DataVisualizeControl.getByOID(msid, function(err,vs){
                        if(err){
                            return res.send(JSON.stringify({
                                "res": "Error",
                                "mess":JSON.stringify(err)
                            }));
                        }
                        if(vs.vs_status == 0){
                            return res.end(JSON.stringify({
                                "res": "Stopped"
                            }));
                        }
                        else{
                            vs.vs_status = 0;
                            //更新数据库
                            DataVisualizeControl.update(vs, function(err,data){
                                if(err){
                                    return res.end(JSON.stringify({
                                        "res": "Error",
                                        "mess": JSON.stringify(err)
                                    }));
                                }
                                return res.end(JSON.stringify({
                                    "res": "Success"
                                }));
                            })
                        }
                    });
                }
            }

            //开启服务
            else if(req.query.ac == "start"){
                if(msid == 'all'){
                    //该接口留给批量开启可视化服务，还未实现
                    console.log("hahahaha");
                }else{
                    DataVisualizeControl.getByOID(msid, function(err,vs){
                        if(err){
                            return res.end(JSON.stringify({
                                "res": "Error",
                                "mess": JSON.stringify(err)
                            }));
                        }
                        if(vs.vs_status == 1){
                            return res.end(JSON.stringify({
                                "res": "Started"
                            }));
                        }
                        else{
                            vs.vs_status = 1;
                            DataVisualizeControl.update(vs, function(err,data){
                                if(err){
                                    return res.end(JSON.stringify({
                                        "res": "Error",
                                        "mess": JSON.stringify(err)
                                    }));
                                }
                                return res.end(JSON.stringify({
                                    "res": "Success"
                                }));
                            })
                        }
                    });
                }
            }
        })
        //删除可视化服务
        .delete(function(req,res,next){
            var msid = req.params.msid;
            DataVisualizeControl.deleteToTrush(msid,function(err,item){
                if (err) {
                    return res.end(JSON.stringify({
                        res: 'err',
                        err: err
                    }));
                }
                var noticeData = {
                    time: new Date(),
                    title: item.vs_model.vs_name + '已删除！',
                    detail: '',
                    type: 'del-vs',
                    hasRead: false
                };
                NoticeCtrl.save(noticeData, function(err,data){
                    if(err){
                        return res.end(JSON.stringify({
                            "res": "Error",
                            "mess": "Error in add notice"
                        }));
                    }
                    return res.end(JSON.stringify({
                        res: 'suc'
                    }));
                });
            });
        });

    app.route('/dataVisualize')
        //新增数据可视化服务
        .post(function (req, res, next) {
            DataVisualizeControl.NewVisualizeSer(req, function (err, rst) {
                if (err) {
                    if (rst) {
                        return res.end(JSON.stringify({
                            result: 'err',
                            message: rst
                        }));
                    } else {
                        return res.end(JSON.stringify({
                            result: 'err',
                            message: err
                        }));
                    }
                }
                if (rst.status == 0) {
                    return res.end(JSON.stringify({
                        result: 'err',
                        message: rst
                    }));
                }
                if (!rst.isValidate) {
                    return res.end(JSON.stringify({
                        result: 'err',
                        message: rst
                    }));
                }
                res.end(JSON.stringify({
                    result: 'suc',
                    data: rst.data
                }));
            });

        });
    
    //获取某个visualize_service的JSON数据
    app.route('/dataVisualize/json/:msid')
        .get(function (req,res,next){
            var msid = req.params.msid;
            if(msid == 'all'){
                DataVisualizeControl.getLocalVisualizeSer(RouteBase.returnFunction(res, "Error in getting all local Visualize service"));
            }else{
                //获取单个可视化资源服务（未完成）
                console.log('hahhaha');
            }
        });
    
    app.route('/dataVisualize/check/:server')
         .get(function(req,res,next){
             var server = req.params.server;
             var testUsername = "admin";
             var testpassword = "123";
             var form = {
                 "username": testUsername,
                 "password": testpassword
             }
             //进行请求获取结果
             DataVisualizeControl.checkServer(server,form,function(result){
                 //将1转为OK,以便于后台处理
                 return res.end(JSON.stringify(result));
             });
         })
    


};
