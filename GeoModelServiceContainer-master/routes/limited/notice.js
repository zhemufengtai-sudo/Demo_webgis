var NoticeCtrl = require('../../control/noticeCtrl');
var RouteBase = require('../routeBase');

module.exports = function (app) {
    app.route('/note')
        .get(function(req, res, next) {
            res.render('notice');
        });

    app.route('/notices/:oid')
        .get(function(req, res, next){
            var oid = req.params.oid;
            if(oid == 'all'){
                var type = null;
                var read = null;
                if(req.query.type && req.query.type != 'all'){
                    type = req.query.type;
                }
                if(req.query.read && req.query.read != 'all'){
                    read = req.query.read;
                }
                NoticeCtrl.getAllNoticeByTypeAndRead(type, read, RouteBase.returnFunction(res, 'Error in getting all notices!'));
            }
        })
        .put(function(req, res, next){
            var oid = req.params.oid;
            if(req.query.type == 'read'){
                if(oid == 'all'){
                    NoticeCtrl.markAllAsRead(RouteBase.returnFunction(res, 'Error in marking all notices as read!'));
                }
                else{
                    NoticeCtrl.markAsRead(oid, RouteBase.returnFunction(res, 'Error in marking all notices as read!'));
                }
            }
        });
};