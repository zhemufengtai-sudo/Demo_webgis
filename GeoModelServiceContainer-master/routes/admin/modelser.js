var ModelSerCtrl = require('../../control/modelSerControl');
var RouteBase = require('../routeBase');

 module.exports = function(app){
     app.route('/modelser/json/all')
        .get(function(req, res, next){
            if(req.query.type == 'admin'){
                ModelSerCtrl.getLocalModelSerByAdmin(RouteBase.returnFunction(res, 'Error in getting all model services'));
            }
        });
 }