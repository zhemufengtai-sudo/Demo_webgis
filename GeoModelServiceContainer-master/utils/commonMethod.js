/**
 * Created by Franklin on 2017/4/5.
 */
const exec = require('child_process').exec;
const fs = require('fs');
var zipper = require("zip-local");
var crypto = require('crypto');
// var unzip = require('unzip');
var net = require('net');
var http = require('http');
var stringRandom = require('string-random');
var os = require('os');
var fileOpera = require('./fileOpera');

var settings = require('../setting');
const path = require('path');
const AdmZip = require('adm-zip-iconv');
const iconv = require('iconv-lite');

function CommonMethod() { }

//得到当前时间
CommonMethod.getDateTimeNow = function () {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    return currentdate;
};

//得到延后或者提前的零点数据
CommonMethod.getStartDate = function (offset) {
    var date = new Date();
    date = new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' 00:00:00');
    date.setDate(date.getDate() + offset);
    return date;
};

var Month_en = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
//得到月份的单词
CommonMethod.getMonthWord = function (index) {
    return Month_en[index];
};

//解压
CommonMethod.Uncompress = function(zip_file, file_path, callback){
    if(settings.platform == 2){
        exec('unzip '+ '-O '+ 'GBK ' + zip_file + ' -d ' + file_path, function(err, stdout, stderr){
            return callback();
        });
    }
    else if(settings.platform == 1){
        //! Method 1: common method
        // fs.createReadStream(zip_file).pipe(unzip.Extract({path: file_path}))
        //     .on('close',function () {
        //         return callback();
        //     });
        //! TODO can use npm "adm-zip-iconv" Fengyuan Zhang at 23-8-28
        //! var zip = new AdmZip("./my_file.zip", "GBK");
        try {
            const zip = new AdmZip(zip_file,"GBK");

            //get zip all entries
            const zipEntries = zip.getEntries(); // 获取所有文件条目

            zipEntries.forEach(entry => {
                const entryName = iconv.decode(Buffer.from(entry.entryName), 'utf-8');

                const fullPath = path.join(file_path, entryName);
                if (entry.isDirectory) {
                    fs.mkdirSync(fullPath, { recursive: true });
                } else {
                    fs.mkdirSync(path.dirname(fullPath), { recursive: true});
                    fs.writeFileSync(fullPath, entry.getData());
                }
            });
            return callback();
        } catch (error) {
            return callback(error);
        }

        //! Method 2: invoke dependent uncompressing method 
        // var cmdPath = "\"" + settings.dirname + "/geo_dataMapping/WinRAR/WinRAR.exe"+ "\"" + " " + "x -y " + zip_file + " " + file_path;
        // cmdPath = CommonMethod.CmdReplace(cmdPath);
        // cmdPath = CommonMethod.setSep(cmdPath);
        // //! Check if the directory is existing
        // fileOpera.BuildDir(file_path,function(){
        //     exec(cmdPath,function(e, stdout, stderr){
        //         if(!e){
        //             return callback();
        //         }else{
        //             return callback(e);
        //         }
        //     })
        // })
    }
    else if(settings.platform == 3){
        exec('unzip '+ zip_file + ' -d ' + file_path, function(err, stdout, stderr){
            return callback();
        });
    }

};

//压缩
CommonMethod.compress = function (file, path) {
    zipper.sync.zip(path).compress().save(file);
};

//加密
CommonMethod.crypto = function (buffer, key) {
    if (key == undefined || key == null) {
        key = settings.crypto.key;
    }
    var encrypted = "";
    var cip = crypto.createCipher(settings.crypto.algorithm, key);
    encrypted += cip.update(buffer, 'binary', 'hex');
    encrypted += cip.final('hex');
    return encrypted;
};

//解密
CommonMethod.decrypto = function (buffer, key) {
    if (key == null || key == undefined) {
        key = settings.crypto.key;
    }
    try {
        var decrypted = "";
        var decipher = crypto.createDecipher(settings.crypto.algorithm, key);
        decrypted += decipher.update(buffer, 'hex', 'binary');
        decrypted += decipher.final('binary');
        return decrypted;
    }
    catch (ex) {
        return "";
    }
};

//! SHA256
CommonMethod.SHA256 = function(key){
    var sha256 = crypto.createHash('SHA256');
    return sha256.update(key).digest('hex');
}

//获取MD5值
CommonMethod.md5 = function (buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
};

//Encode64加密
CommonMethod.Encode64 = function (a) {
    var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv" + "wxyz0123456789+/" + "=";
    var b = "";
    var c, chr2, chr3 = "";
    var d, enc2, enc3, enc4 = "";
    var i = 0;
    do {
        c = a.charCodeAt(i++);
        chr2 = a.charCodeAt(i++);
        chr3 = a.charCodeAt(i++);
        d = c >> 2;
        enc2 = ((c & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64
        } else if (isNaN(chr3)) {
            enc4 = 64
        };
        b = b + keyStr.charAt(d) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        c = chr2 = chr3 = "";
        d = enc2 = enc3 = enc4 = ""
    } while (i < a.length);
    return b;
}

//启动一个Nodejs进程去执行JS文件 -- 一般用于高IO处理
CommonMethod.childProcess = function (args, callback) {
    const exePath = path.resolve(settings.dirname, 'container_node.exe');
    const cmd = `${exePath} ${args}`;
    console.log("cmd:", cmd);
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            return callback(err, {
                stdout: null,
                stderr: null});
        }
        return callback(null, {
            stdout: stdout,
            stderr: stderr
        })
    });
};

CommonMethod.portIsOccupied = function (port, callback) {
    // 创建服务并监听该端口
    var server = net.createServer().listen(port);
    server.on('listening', function () {
        server.close();
        callback(false);
    });
    server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            callback(true);
        }
    });
};

CommonMethod.getPort = function (cb) {
    var server = http.createServer();
    server.listen(0);
    server.on('listening', function () {
        var port = server.address().port;
        server.close();
        cb(port);
    });
};

CommonMethod.getIP = function (request) {
    var host = request.connection.remoteAddress;
    host = host.substr(host.lastIndexOf(':') + 1);
    if (host == "1") {
        host = "127.0.0.1";
    }
    return host;
};

//数组包含
CommonMethod.array_contain = function (array, obj) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == obj) {
            return true;
        }
    }
    return false;
};

CommonMethod.createGUID = function () {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
};

// 'yyyy-mm-dd hh:mm'
CommonMethod.timestamp2String = function (timestamp) {
    var date = new Date(timestamp);
    return date.getFullYear() + '-' +
        (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-' +
        date.getDate() + ' ' +
        (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' +
        (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes());
};

// 检查并补全文件路径最后的斜杠
CommonMethod.makeupDir = function (dir) {
    if (typeof dir != 'string') {
        return '';
    }
    var sep = '\\';
    if (settings.platform == 2) {
        sep = '/';
    }
    if (dir[dir.length - 1] != '/' && dir[dir.length - 1] != '\\') {
        dir = dir + sep;
    }
    return dir;
};

// 返回不同系统的斜杠
CommonMethod.setSep = function (cmd) {
    var sep = '\\';
    if (settings.platform == 2) {
        var cmd = cmd.replace(/\\/g, "/");
    }
    else if(settings.platform == 3){
        var cmd = cmd.replace(/\\/g, "/");
    }
    else {
        var cmd = cmd.replace(/\//g, "\\");
        var cmd = cmd.replace(/\\\\/g, "\\");
    }
    return cmd;
}

// 返回不同系统的斜杠
CommonMethod.CmdReplace = function (cmd) {
    cmd = cmd.replace(/\/\//g, "\\");
    return cmd;
}

// 深度拷贝JSON对象
CommonMethod.deepClone = function (data) {
    var type = typeof data;
    var obj;
    if (type === 'array') {
        obj = [];
    } else if (type === 'object') {
        obj = {};
    } else {
        //不再具有下一层次
        return data;
    }
    if (type === 'array') {
        for (var i = 0, len = data.length; i < len; i++) {
            obj.push(deepClone(data[i]));
        }
    } else if (type === 'object') {
        for (var key in data) {
            obj[key] = CommonMethod.deepClone(data[key]);
        }
    }
    return obj;
}

CommonMethod.Wait = function (delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay) {

    }
}

//! Check the object is json, if yes, return; if not, parse it as JSON and return
CommonMethod.checkJSON = function(obj) {
    try {
        if (typeof obj == "string"){
            return JSON.parse(obj)
        }
        return obj;
    }
    catch(ex){
        throw new Error('Parameter is not a number!')
    }
}

CommonMethod.makeUpDirName = function (dirname) {
    dirname = dirname.replace(':', '_');
    dirname = dirname.replace(' ', '_');
    dirname = dirname.replace('?', '_');
    dirname = dirname.replace('*', '_');
    dirname = dirname.replace('<', '_');
    dirname = dirname.replace('>', '_');
    return dirname;
}

//! GeoDataExchangeServer encryption
CommonMethod.encryption = function (buffer) {
    //! hex
    buffer = Buffer.from(buffer).toString('hex')

    //! base64
    buffer = Buffer.from(buffer).toString('base64');

    //! confusion
    buffer = stringRandom(5, { specials: true }) + buffer + stringRandom(5, { specials: true });

    //! base64
    buffer = Buffer.from(buffer).toString('base64');

    return buffer;
}

//! GeoDataExchangeServer decryption
CommonMethod.decryption = function(buffer){
    try{
        //! de base64
        buffer = new Buffer.from(buffer, 'base64').toString();

        //! de confusion
        buffer = buffer.substr(5);
        buffer = buffer.substr(0, buffer.length - 5);

        //! de base64
        buffer = new Buffer.from(buffer, 'base64').toString();

        //! de hex
        buffer = new Buffer.from(buffer, 'hex').toString();
        return buffer;
    }
    catch(ex){
        return "";
    }
}

//! get Mac address
CommonMethod.getMac = function(callback){
    if(os.type() == 'Windows_NT'){
        network = os.networkInterfaces();
        var keys = Object.keys(network);
        var macs = [];
        for(var i = 0; i < keys.length; i++){
            var obj = network[keys[i]];
            if(obj.length){
                for(var j = 0; j < obj.length; j++){
                    if(obj[j].family == 'IPv4'){
                        if(obj[j].mac != '00:00:00:00:00:00'){
                            macs.push(obj[j].mac);
                        }
                    }
                }
            }
        }
        if(macs.length > 0){
            return callback(null, macs[0]);
        }
        return callback(null, '00:00:00:00:00:00');
    }
    else if(os.type() == 'Linux'){
        network = os.networkInterfaces();
        var keys = Object.keys(network);
        var macs = [];
        for(var i = 0; i < keys.length; i++){
            var obj = network[keys[i]];
            if(obj.length){
                for(var j = 0; j < obj.length; j++){
                    if(obj[j].family == 'IPv4'){
                        if(obj[j].mac != '00:00:00:00:00:00'){
                            macs.push(obj[j].mac);
                        }
                    }
                }
            }
        }
        if(macs.length > 0){
            return callback(null, macs[0]);
        }
        return callback(null, '00:00:00:00:00:00');
    }
    else if(os.type() == 'Darwin'){
        network = os.networkInterfaces();
        var keys = Object.keys(network);
        var macs = [];
        for(var i = 0; i < keys.length; i++){
            var obj = network[keys[i]];
            if(obj.length){
                for(var j = 0; j < obj.length; j++){
                    if(obj[j].family == 'IPv4'){
                        if(obj[j].mac != '00:00:00:00:00:00'){
                            macs.push(obj[j].mac);
                        }
                    }
                }
            }
        }
        if(macs.length > 0){
            return callback(null, macs[0]);
        }
        return callback(null, '00:00:00:00:00:00');
    }
    else{
        return callback(Error('Unknown system!'));
    }
}

module.exports = CommonMethod;