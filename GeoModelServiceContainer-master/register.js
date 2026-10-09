const TaskCtrl = require('./control/taskControl');

var host = '172.21.212.223';
var port = 8061;

TaskCtrl.register(host, port, 1, function (err, result) {
   if(err){
       return console.log('Error : ' + err);
   }
   console.log(result);
});