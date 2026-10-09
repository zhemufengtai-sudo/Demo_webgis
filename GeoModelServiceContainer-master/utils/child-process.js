/**
 * Created by SCR on 5.24.
 */
var child_process = require('child_process');
var commonMethod = require('./commonMethod');

var childprocess = function () {
    
};

module.exports = childprocess;

childprocess.newVisualization = function (gdid,host, cb) {
    try{
        //调试端口可能会重复
        commonMethod.getPort(function (port) {
            var cp = child_process.fork(__dirname + '/../control/UDX_Visualization.js',[],{execArgv:['--debug='+port]});
            cp.send({code:'start',gdid:gdid,host:host});
            cp.on('message',function (m) {
                if(m.code == 'stop'){
                    if(m.rst){
                        cp.kill();
                        return cb(null,JSON.stringify(m.rst));
                    }
                }
            });
        });
    }
    catch(e){
        return cb(e);
    }
};