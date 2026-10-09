var formidable = require('formidable');
var fs = require('fs');
var uuid = require('node-uuid');

var RouteBase = require('../routeBase');
var GeoDataCtrl = require('../../control/geoDataControl');
var ModelSerRunCtrl = require('../../control/modelSerRunControl');
var setting = require('../../setting');
var remoteReqCtrl = require('../../control/remoteReqControl');
var childCtrl = require('../../control/childControl');

module.exports = function (app) {
    //! View
    //数据缓存页面
    app.route('/geodata/all')
        .get(function (req, res, next) {
            return res.render('dataCollection');
        });

    //! API
    //得到全部数据的JSON
    app.route('/geodata/json/all')
        .get(function (req, res, next) {
            GeoDataCtrl.getAllData(RouteBase.returnFunction(res, 'Error in getting all geo data!'));
        });
    
    //删除数据
    app.route('/geodata/:gdid')
        .delete(function(req, res, next){
            var gdid = req.params.gdid;
            if(gdid == 'all'){
                if(req.query.day){
                    var day = req.query.day;
                    day = parseInt(day);
                    GeoDataCtrl.deleteByDay(day, RouteBase.returnFunction(res, 'Error in delete geo-data by month'));
                }
            }
            else{
                GeoDataCtrl.delete(gdid, RouteBase.returnFunction(res, 'Error in delete a geo-data!'));
            }
        });
}