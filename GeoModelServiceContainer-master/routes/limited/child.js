var ChildCtrl = require('../../control/childControl');
var CommonMethod = require('../../utils/commonMethod');
var RouteBase = require('../routeBase');

module.exports = function (app) {
    // 新增节点
    app.route('/child-node')
        .post(function (req, res, next) {
            var host = CommonMethod.getIP(req);
            if (req.body.platform == undefined || req.body.port == undefined) {
                return res.end(JSON.stringify({
                    result: 'err',
                    code : -1,
                    message: 'Platform, port or both are NULL!'
                }));
            }
            var port = req.body.port;
            var platform = req.body.platform;
            var access_token = req.body.access_token;
            //新增判断语句以解决添加本机为子节点的情况(构建了一个status对象以帮助前台判断)
            if (host == "127.0.0.1") {
                var status = {
                    host: host
                };
                return res.end(JSON.stringify({
                    result: 'suc',
                    code : 1,
                    data: status
                }));
            } else {
                ChildCtrl.AddNewChild({
                    host: host,
                    port: port,
                    platform: platform,
                    accepted: false,
                    access_token: access_token
                }, RouteBase.returnFunction(res, 'error in adding new child!'));
            }
        })
        .get(function (req, res, next) {
            var host = CommonMethod.getIP(req);
            ChildCtrl.getByHost(host, RouteBase.returnFunction(res, 'error in finding the child'));
        });
    
    // 删除某一节点
    app.route('/child-node/delete')
        .get(function (req, res, next) {
            console.log(req);
            var host = CommonMethod.getIP(req);
            if (host == "127.0.0.1") {
                var status = {
                    host: host
                };
                return res.end(JSON.stringify({
                    result: 'suc',
                    code : 1,
                    data: status
                }));
            } else {
                ChildCtrl.getByHost(host, function (err, data) {
                    var oid = data._id;
                    ChildCtrl.delete(oid, RouteBase.returnFunction(res, 'error in finding the child'));
                });
            }
        });
    
    // 获取节点的页面及操作
    app.route('/child-node/:cid')
        .get(function (req, res, next) {
            var cid = req.params.cid;
            if (cid == 'all') {
                ChildCtrl.getAll(function (err, clds) {
                    if (err) {
                        return res.end('Error : ' + err);
                    }
                    res.render('child-nodes', {
                        clds: clds,
                        blmodelser_r: true
                    });
                });
            }
            else {
                ChildCtrl.getByOID(cid, function (err, cld) {
                    if (err) {
                        return res.end('Error : ' + err);
                    }
                    else {
                        res.render('child-node', {
                            host: cld.host
                        });
                    }
                });
            }
        })
        .put(function (req, res, next){
            var cid = req.params.cid;
            if(req.query.ac == 'accept'){
                ChildCtrl.Accept(cid, RouteBase.returnFunction(res, 'error in accepting a child request'));
            }
        })
        .delete(function(req, res, next){
            var cid = req.params.cid;
            ChildCtrl.remove(cid, RouteBase.returnFunction(res, 'Error in removing a child node'));
        });

    // 单个节点的信息
    app.route('/child-node/json/:cid')
        .get(function (req, res, next) {
            var cid = req.params.cid;
            if (cid == 'all') {
                ChildCtrl.getAllWithPing(RouteBase.returnFunction(res, "Error in getting children node!"));
            }
            else {
                ChildCtrl.getByOID(cid, RouteBase.returnFunction(res, "Error in getting a child node!"));
            }
        });
};