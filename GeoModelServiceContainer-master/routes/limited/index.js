var express = require('express');
var router = express.Router();

var childRouter = require('./child');
var dataRouter = require('./data');
var modelInstanceRouter = require('./modelinstance');
var modelSerRouter = require('./modelser');
var modelSerRunRouter = require('./modelserrun');
var noticeRouter = require('./notice');
var rmtModelSerRouter = require('./rmtmodelser');
var systemRouter = require('./system');
var dataVisualizationRoute = require('./dataVisualizationRoute');
var environmentMatch = require('./environmentMatch');


module.exports = function(app)
{
    childRouter(app);

    dataRouter(app);

    modelInstanceRouter(app);

    modelSerRouter(app);

    modelSerRunRouter(app);

    noticeRouter(app);

    rmtModelSerRouter(app);

    noticeRouter(app);

    systemRouter(app);

    //add by wangming at 2018.4.5
    dataVisualizationRoute(app);

    //environment match
    environmentMatch(app);

}