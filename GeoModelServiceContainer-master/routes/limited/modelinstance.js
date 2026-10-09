var ModelSerCtrl = require('../../control/modelSerControl');
var ModelSerRunCtrl = require('../../control/modelSerRunControl');

module.exports = function (app) {
    // 模型实例页面
    app.route('/modelins/all')
        .get(function (req, res, next) {
            res.render('modelInstance',{
                    blmodelser : true
                });
        });

    // 单个运行实例的操作
    app.route('/modelins/:guid')
        .get(function(req, res, next){
            var ac = req.query.ac;
            var guid = req.params.guid;
            if(ac == 'detail'){
                ModelSerRunCtrl.getByGUID(guid, function(err, msr){
                    if(err){
                        return res.redirect('/modelins/all');
                    }
                    if(msr == null){
                        return res.redirect('/modelins/all');
                    }
                    return res.redirect('/modelserrun/' + msr._id);
                });
            }
            else{
                return res.end(JSON.stringify({
                    result : 'err',
                    code : -1,
                    message : 'Unknown CMD!'
                }));
            }
        })
        .put(function(req, res, next){
            var ac = req.query.ac;
            var guid = req.params.guid;
            if(ac == 'detail'){
                ModelSerRunCtrl.getByGUID(guid, function(err, msr){
                    if(err){
                        return res.redirect('/modelins/all');
                    }
                    if(msr == null){
                        return res.redirect('/modelins/all');
                    }
                    return res.redirect('/modelserrun/' + msr._id);
                });
            }
            return res.end(JSON.stringify({
                result : 'err',
                code : -3,
                message : 'Unknown cmd!'
            }));
        });

    //获取所有模型实例
    app.route('/modelins/json/all')
        .get(function (req, res, next) {
            var miss = app.modelInsColl.getAllIns();
            return res.end(JSON.stringify({
                result : "suc",
                code : 0,
                data : miss
            }));
        });
};