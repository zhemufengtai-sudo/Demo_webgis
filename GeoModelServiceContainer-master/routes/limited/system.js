var fs = require('fs');
var SysControl = require('../../control/sysControl');
var RouteBase = require('../routeBase');
var registerCtrl = require('../../control/registerCtrl');
var sweCtrl = require('../../control/softwareEnCtrl');
var hweCtrl = require('../../control/hardwareEnCtrl');
var commonMethod = require('../../utils/commonMethod');
var languageCtrl = require('../../control/languagesCtrl');
var assemblyCtrl = require('../../control/assembly');
var PortalCtrl = require('../../control/portalControl');

module.exports = function(app)
{
    //! View
    //得到当前状态页面
    app.route('/status')
        .get(function(req, res, next)
        {
            res.render('status');
        });

    //环境匹配界面
    app.route('/setting/enviroment')
        .get(function (req, res, next) {
            res.render('enviro',{
                openli:'setting-li'
            });
        });

    //管理员页面渲染
    app.route('/admininfo')
        .get(function(req, res, next){
            res.render('userInfo');
        });

    //! API
    //获取语言配置
    app.route('/languages')
        .get(function(req, res, next){
            var type = req.query.type;
            if(type == 'currect'){
                var language = global.configLanguage;
                if(language == undefined){
                    return res.end(JSON.stringify({
                        result : 'fail',
                        code : -1,
                        message : 'language configuration is null!'
                    }));
                }
                return res.end(JSON.stringify({
                    result : 'suc',
                    code : 1,
                    data : language
                }));
            }
            else{
                languageCtrl.getAllLanguageConfig(RouteBase.returnFunction(res, 'Error in getting All language configs'));
            }
        })
        .put(function(req, res, next){
            var language = req.query.language;
            languageCtrl.setCurrentSetting(language, RouteBase.returnFunction(res, 'Error in setting language config'));
        });
    
    //获取当前状态JSON数据
    app.route('/json/status')
        .get(function(req, res, next)
        {
            SysControl.getState(function(err,sysinfo)
            {
                res.end(JSON.stringify(sysinfo));
            });
        });
    
    //获取系统信息JSON
    app.route('/info')
        .get(function(req,res,next)
        {
            SysControl.getInfo(req.headers, RouteBase.returnFunction(res, 'Error in getting setting!'));
        });

    //获取依赖项
    app.route('/assemblies')
        .get(function(req, res, next){
            assemblyCtrl.getAssemblies(RouteBase.returnFunction(res, 'Error in getting assemblies!'));
        });

    //获取环境匹配数据
    app.route('/settings')
        .get(function(req, res, next){
            SysControl.getSettings(RouteBase.returnFunction(res, 'Error in getting setting!'));
        });

    //获取父节点
    app.route('/parent')
        .get(function(req, res, next){
            SysControl.getParent(RouteBase.returnFunction(res, 'Error in getting parent!'));
        })
        .put(function(req, res, next){
            var ac = req.query.ac;
            var host = req.query.host;
            var port = req.query.port;
            if(ac == 'reset'){
                host = req.connection.remoteAddress;
                host = host.substr(host.lastIndexOf(':') + 1);
                SysControl.resetParent(host, RouteBase.returnFunction(res, 'Error in resetting parent!'));
            }
            else{
                SysControl.setParent(host, port, RouteBase.returnFunction(res, 'Error in updating parent!'));
            }
        });

    //检查服务节点是否存在
    app.route('/checkserver/:server')
        .get(function(req, res, next){
            var server = req.params.server;
            SysControl.checkServer(server, function(err, data){
                if(err || data.result == 'err'){
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : -1,
                        message : "Error in checking server!"
                    }));
                }
                if(data.result == 'OK'){
                    return res.end(JSON.stringify({
                        result : 'suc',
                        code : 1,
                        data : "OK"
                    }));
                }
            });
        });
    
    //模型服务容器向门户进行注册
    app.route('/system/registration')
        .get(function (req, res, next) {
            var ac = req.query.ac;
            if(ac == 'register'){
                SysControl.register(function (rst) {
                    return res.end(rst)
                })
            }
            else if(ac == 'deregister'){
                SysControl.deregister(function (rst) {
                    return res.end(rst)
                });
            }
        });

    //设置界面
    app.route('/setting')
        .get(function (req, res, next) {
            res.render('setting',{
                openli:'setting-li'
            });
        });
    //获取CPU使用率
    app.route('/setting/cpurate')
        .get(function(req,res,next){
            SysControl.getCpuState(RouteBase.returnFunction(res,'error in getting cpurate'));
        });

    //获取系统数据库中软件环境信息
    app.route('/setting/softwareInfo')
        .get(function(req,res,next){
            sweCtrl.getAllDataToPortal(RouteBase.returnFunction(res,'error in getting software information'));
        });

    /*环境字典路由
       type: hardware software
       method: auto get
       ac: update new del
    */
    app.route('/setting/enviro')
        .get(function(req,res,next){
            var type = req.query.type;
            //get the query method
            var method = req.query.method;
            var enviroCtrl = null;
            if(type === 'hardware' || type === 'hwe'){
                enviroCtrl = hweCtrl;
            }else if(type === 'software' || type === 'swe'){
                enviroCtrl = sweCtrl;
            }
            var ab = req.query.AB;
            var getAll = null;
            if(ab && ab !='A'){
                getAll = enviroCtrl.getAllA;
            }
            else{
                getAll = enviroCtrl.getAllB;
            }

            if(method == 'auto'){
                enviroCtrl.autoDetect(function (data) {
                    return res.end(data);
                })
            }
            else if(method == 'get'){
                getAll(function (data) {
                    return res.end(data);
                })
            }
            
        })
        .post(function(req,res,next){
            var type = req.query.type;
            var ac = req.query.ac;
            var method = req.query.method;
            var newEnviro = req.body;
            var resCallback = function(data){
                return res.end(data);
            }
            var enviroCtrl = null;
            //判断类型
            if(type === 'hardware'){
               enviroCtrl = hweCtrl;
            }else if(type === 'software'){
                enviroCtrl = sweCtrl;
            }

            if(method){
                if(method === 'auto'){
                    enviroCtrl.addByAuto(newEnviro.itemsID,resCallback);
                }
                else if(method == 'select'){
                    enviroCtrl.addBySelect(newEnviro.itemsID,resCallback);
                }
                else{
                    if(ac == 'update'){
                        enviroCtrl.updateItem(newEnviro,resCallback)
                    }
                    else if(ac == 'new'){
                        enviroCtrl.addItem(newEnviro,resCallback)
                    }
                    else if(ac == 'del'){
                        enviroCtrl.deleteItem(newEnviro._id,resCallback)
                    }
                }
            }
        });


    //管理员信息
    app.route('/json/admininfo')
        .get(function(req, res, next){
            SysControl.getAdminInfo(RouteBase.returnFunction(res, 'Error in getting admin info!', 'ss_value'));
        })
        .put(function(req, res, next){
            SysControl.alterNameAndPwdWithAuth(req.query.adminName, req.query.pwd, req.query.newAdminName, req.query.newAdminPwd, RouteBase.returnFunction(res, 'Error in alter admin info!'));
        });
    //管理员登录
    app.route('/login')
        .get(function(req, res, next){
            res.render('login')
        })
        .post(function(req, res, next){
            SysControl.adminLogin(req.body.adminname, req.body.adminpwd, function(err, result){
                if(err){
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : -1,
                        message : JSON.stringify(err)
                    }));
                }
                if(result){
                    req.session.admin = req.body.adminname;
                    // req.session.isLoggedIn = true;
                    return res.end(JSON.stringify({
                        result : 'suc',
                        code : 1,
                        data : true
                    }));
                }
                else{
                    return res.end(JSON.stringify({
                        result : 'suc',
                        code : 1,
                        data : false
                    }));
                }
            });
        });
    
    //获取、设置门户用户名信息
    app.route('/json/portalinfo')
        .get(function(req, res, next){
            SysControl.getPortalUName(RouteBase.returnFunction(res, 'Error in getting portal name!', 'ss_value'));
        })
        .put(function(req, res, next){
            var portalname = req.query.portalname;
            var portalpwd = req.query.portalpwd;
            if(req.query.ac == 'refresh'){
                //! Post information
                PortalCtrl.postServiceList(portalname, RouteBase.returnFunction(res, 'Error in posting information!'));
            }
            else{
                SysControl.setPortalInfo(portalname, portalpwd, function(err, result){
                    if(err){
                        return res.end(JSON.stringify({
                            result : 'err',
                            code : -1,
                            message : err
                        }));
                    }
                    if(result.result == 'suc'){
                        //! Post information
                        PortalCtrl.postServiceList(portalname, function(err, result){
                            if(err){
    
                            }
                            if(result){
                                
                            }
                        });
    
                        return res.end(JSON.stringify({
                            result : 'suc',
                            code : 1,
                            data : '1'
                        }));
                    }
                    else{
                        return res.end(JSON.stringify({
                            result : 'fail',
                            code : -2,
                            data : '0'
                        }));
                    }
                });
            }
        })
        .delete(function(req, res, next){
            SysControl.clearPortalInfo(RouteBase.returnFunction(res, 'Error in unregistering portal info!', 'ss_value'))
        });
    //获取IPToken
    app.route('/token')
        .get(function(req, res, next){
            SysControl.getToken(req.query.ip, RouteBase.returnFunction(res, 'Error in getting token!'));
        });

    //判断本机IP是否在注册之后发生变化路由
    app.route('/json/checkIP')
       .get(function(req,res,next){
           SysControl.checkMachineIP(function (rst){
               return res.end(rst);
           });
       })
       .put(function(req,res,next){
           var portalname = req.query.portalname;
           var portalpwd = req.query.portalpwd;
           SysControl.updateServer(portalname, portalpwd, function (err, result) {
            if(err){
                return res.end(JSON.stringify({
                    result : 'err',
                    message : err
                }));
            }
            if(result.result == 'suc'){
                return res.end(JSON.stringify({
                    result : 'suc',
                    data : '1'
                }));
            }
            else{
                return res.end(JSON.stringify({
                    result : 'fail',
                    data : '0'
                }));
            }
        });
 })
}