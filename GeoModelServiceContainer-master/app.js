var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var ModelIns = require('./model/modelInstance');
var ModelInsCollection = require('./model/modelInsCollection');
var FileUploadRecord = require('./model/fileUpload');
var init = require('./init');
var settings = require('./setting');
var debugSetting = require('./debugSetting.json');
var SysCtrl = require('./control/sysControl');
var msrCtrl = require('./control/modelSerRunControl');

var routes = require('./routes/index');
var TaskCtrl = require('./control/taskControl');

var app = express();
global.app = app;

//init setting
init();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '10000000kb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'wfsiudhjkfhoihiewhrlkjflkjasd',
  cookie: { maxAge: 3600000 * 2 },
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('etag');

//正在运行的模型实例集合
app.modelInsColl = new ModelInsCollection();

//创建文件传输记录变量
global.fileupload = new FileUploadRecord();

//创建一个全局变量
global.basefilename = '';

//http request
routes(app);

//schedule task start
TaskCtrl.init();

//socket connection
var socket = require('./socket/mc_socket');
socket(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//debug for model-instance
if(debugSetting.debug)
{
  var date = new Date();
  msrCtrl.getByGUID(debugSetting.debugGUID, function(err, msr){
    if(msr != null){
      var mis = {
        guid : debugSetting.debugGUID,
        socket : null,
        ms : msr.msr_ms,
        log : [],
        input : msr.msr_input,
        output : msr.msr_output,
        event : '',
        Flag : 1,
        start : date.toLocaleString(),
        state : 'MC_READY',
        cp : msr.msr_controlparams
      };
      var modelIns = new ModelIns(mis);
      app.modelInsColl.addIns(modelIns);
    }
    global.debug = 'Debug Mode';
  });
}

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception Happened!')
  console.log('Message : ' + err.message);
  // console.log(JSON.stringify(err));
  global.app.modelInsColl.killAllInstance();
});

app.taskInstanceColl = [];
var ip = SysCtrl.getIPSync();
if (ip) {
  app.centerHost = SysCtrl.getIPSync();
  app.centerPort = settings.port;
} module.exports = app;
