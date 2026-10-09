/**
 * Created by Franklin on 16-3-23.
 * Control for System
 */
var os = require('os');
var crypto = require('crypto');
var fs = require('fs');
// var ObjectId = require('mongoose').Types.ObjectId;
const ObjectId = require('bson').ObjectID;
var exec = require('child_process').exec;
var iconv = require('iconv-lite');

var setting = require('../setting');
// var systemSettingModel = require('../model/systemSetting');
// var systemSettingModel = require('../model/systemSetting_n');
var systemSettingModel = require('../model/dbSwitcher').systemSetting;
var ControlBase = require('./controlBase');
// var RemoteControl = require('./remoteReqControl');

// var RegisterModel = require('../model/register');
// var RegisterModel = require('../model/register_n');
var RegisterModel = require('../model/dbSwitcher').register;

var ParamCheck = require('../utils/paramCheck');
var CommonMethod = require('../utils/commonMethod');
// var registerCtrl = require('./registerCtrl');
var ModelBase = require('../utils/commonBase');
const { returnFunction } = require('../utils/commonBase');
// const PortalControl = require('./portalControl');
var SysControl = function () { };
SysControl.__proto__ = ControlBase;

SysControl.model = RegisterModel;

module.exports = SysControl;

SysControl.getCpuState = function (callback) {
    var cpuinfo = {
        'precent': 0
    };
    //windows cpustate
    if (setting.platform == 1) {
        exec('wmic cpu get LoadPercentage', function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                return callback(err);
            }
            var array = stdout.split("\r\r\n");
            array.pop();
            array.pop();
            //获取cpu瞬时百分比
            var precent = array[1].split(" ");
            cpuinfo.precent = Number(precent[0]);
            return callback(null, cpuinfo);
        })
    } else if (setting.platform == 2) {
        //获取Linux系统的平均负载，结果返回一个数组，包含1,5,15分钟平均负载
        var result = os.loadavg();
        //此处取1分钟的平均负载
        var str = Number(result[0] * 100);
        cpuinfo.precent = str;
        return callback(null, cpuinfo);

    }
};
SysControl.getState = function (callback) {
    var sysinfo =
        {
            'hostname': os.hostname(),
            'systemtype': os.type(),
            'platform': os.platform(),
            'release': os.release(),
            'uptime': os.uptime(),
            'loadavg': os.loadavg(),
            'totalmem': os.totalmem(),
            'freemem': os.freemem(),
            'cpus': os.cpus(),
            'disk': ''
        };
    //windows disk
    if (setting.platform == 1) {
        exec('wmic logicaldisk get caption,size,freespace', function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                return callback(err);
            }
            var array = stdout.split("\r\r\n");
            array.pop();
            array.pop();
            array.shift();
            var i, j;
            for (i = 0; i < array.length; i++) {
                if (setting.dirname[0].toLocaleLowerCase() == array[i][0].toLocaleLowerCase()) {
                    var space = array[i].split(" ");
                    var ele = [];
                    for (j = 0; j < space.length; j++) {
                        if (+space[j]) {
                            ele.push(+space[j]);
                        }
                    }
                    sysinfo.disk = [Math.round(( + ele[1] - ele[0]) / ( + ele[1]) * 100), setting.dirname[0].toLocaleUpperCase()];
                    sysinfo.disksize = [Math.round(ele[0] / 1024 / 1024 / 1024), Math.round(ele[1] / 1024 / 1024 / 1024)];
                    // console.log(ele);
                    break;
                }
            }
            // sysinfo.disk = array;
            return callback(null, sysinfo);
        });
    }
    else if (setting.platform == 2) {
        // exec('df -h', function(err, stdout, stderr)
        // {
        //     if(err)
        //     {
        //         console.log(err);
        //         return callback(err);
        //     }
        //     var array = stdout.split("\r\r\n");
        //     array.pop();
        //     array.pop();
        //     array.shift();
        //     var i,j;
        //     for(i=0;i<array.length;i++){
        //         if(__dirname[0].toLocaleLowerCase() == array[i][0].toLocaleLowerCase()){
        //             var space = array[i].split(" ");
        //             var ele = [];
        //             for(j=0;j<space.length;j++){
        //                 if (+space[j]){
        //                     ele.push(+space[j]);
        //                 }
        //             }
        //             sysinfo.disk = [Math.round((+ele[1]-ele[0])/(+ele[1])*100),__dirname[0].toLocaleUpperCase()];
        //             // console.log(ele);
        //             break;
        //         }
        //     }
        //     // sysinfo.disk = array;
        //     return callback(null, sysinfo);
        // });
        var spawn = require('child_process').spawn,
            free = spawn('df', ['-B1']);

        // 捕获标准输出并将其打印到控制台
        free.stdout.on('data', function (data) {
            // console.log('标准输出：\n' + data);
            // console.log(data.toString());
            var diskInfo = data.toString().split('\n');
            var i;
            try {
                for (var i = 0; i < diskInfo.length; i++) {
                    if (diskInfo[i].endsWith('/')) {  // 匹配根分区
                        var parts = diskInfo[i].split(/\s+/).filter(Boolean);

                        // parts数组结构示例：
                        // [文件系统, 1K-块, 已用, 可用, 已用%, 挂载点]
                        var usedBytes = parseInt(parts[2]) * 1024;  // 已用字节
                        var totalBytes = parseInt(parts[1]) * 1024; // 总字节

                        sysinfo.disk = [Math.round((usedBytes / totalBytes) * 100), '磁'];
                        sysinfo.disksize = [
                            Math.round((totalBytes - usedBytes) / 1024 / 1024 / 1024), // 可用GB
                            Math.round(totalBytes / 1024 / 1024 / 1024)                // 总GB
                        ];
                        break;
                    }
                }
            }
            catch (ex) {
                console.error('Parse disk info error:', ex);
            }
            return callback(null, sysinfo);
        });
    }
};

SysControl.getIPSync = function () {
    // windows
    if (setting.platform == 1) {
        var hasFind = false;
        var interfaces = os.networkInterfaces();
        var IPv4 = '127.0.0.1';
        for (var key in interfaces) {
            if (key.match(/\s*vmware\s*network\s*adapter/i))
                continue;
            for (let i = 0; i < interfaces[key].length; i++) {
                var details = interfaces[key][i];
                if (details.family == 'IPv4') {
                    if (details.address != '127.0.0.1') {
                        IPv4 = details.address;
                        hasFind = true;
                        return IPv4;
                    }
                }
            }
        }
        if (!hasFind) {
            return null;
        }
    }
    else if (setting.platform == 2) {
        //TODO get ip of linux
    }
};

//TO DO 
SysControl.getIP = function (cb) {
    var exec = require('child_process').exec;
    let ipv4 = '';
    let hasFind = false;
    //windows disk
    if (setting.platform == 1) {
        var interfaces = os.networkInterfaces();
        for (var key in interfaces) {
            // if (key.match(/\s*vethernet\s*vmware\s*network\s*adapter/i))
            //     continue;
            if (/(loopback|vmware|internal|vethernet)/gi.test(key))
                continue;
            if (ipv4 != '') break;
            var alias = 0;
            for (let item of interfaces[key]) {
                if (item.family === 'IPv4') {
                    if (item.address !== '127.0.0.1') {
                        ipv4 = item.address;
                        hasFind = true;
                        return cb(null, ipv4);
                    }
                }
            }
        }
        if (!hasFind) {
            return cb('can\'t find local IP!');

        }
    }
    else if (setting.platform == 2) {
        //TODO get ip of linux , the same as windows
        var interfaces = os.networkInterfaces();
        var IPv4 = '127.0.0.1';
        for (var key in interfaces) {
            if (/(loopback|vmware|internal|vethernet)/gi.test(key))
                continue;
            var alias = 0;
            interfaces[key].forEach(function (details) {
                if (details.family == 'IPv4') {
                    if (details.address != '127.0.0.1') {
                        IPv4 = details.address;
                        hasFind = true;
                        return cb(null, IPv4);
                    }
                }
            });
        }
        if (!hasFind) {
            return cb('can\'t find local IP!');
        }
    }
};

SysControl.getRegisterInfo = function (callback) {
    SysControl.getState(function (err, sysInfo) {
        if (err) {
            console.log('err in get sys info!');
            return callback(err);
        }
        else {
            SysControl.getIP(function (err, ip) {
                if (err) {
                    console.log('err in get ip!');
                    return callback(err);
                }
                //初始化注册信息，其他信息由用户自己来填
                var registerInfo = {
                    _id: new ObjectId().toString(),
                    hostname: sysInfo.hostname,
                    software: sysInfo.cpus,
                    hardware: sysInfo.disk,
                    disksize: sysInfo.disksize,
                    host: ip,
                    port: setting.port,
                    platform: setting.platform,
                    registered: false,
                    info: ''
                };
                //添加注册信息到数据库的功能
                return callback(null, registerInfo);
            });
        }
    });
};

SysControl.getInfo = function (headers, callback) {
    systemSettingModel.getValueByIndex('sysinfo', function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

SysControl.getValueByIndex = function (ss_index, callback) {
    systemSettingModel.getValueByIndex(ss_index, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    })
};

///////////////////////////////////门户
//! login in portal
SysControl.loginPortal = function (uname, pwd, callback) {

    //! Login in 
    var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/user/in';
    var md5 = CommonMethod.md5(pwd);
    var form = {
        account : uname,
        password : CommonMethod.SHA256(md5)
    }
    RemoteControl.postRequestJSONWithForm(url, form, function (err, msg) {
        if(err){
            return callback(err);
        }
        if(msg == "0"){
            return callback(null, false);
        }
        else if(msg == "1"){
            return callback(null, true);
        }
        else{
            return callback(new Error("Can not parse this message : " + msg))
        }
    });
};


//获取门户账号密码
SysControl.getPortalToken = function (callback) {
    var portalToken = {};
    systemSettingModel.getValueByIndex('portal_uname', function (err, value) {
        if (err) {
            return callback(err);
        }
        portalToken['portal_uname'] = value.ss_value;
        systemSettingModel.getValueByIndex('portal_pwd', function (err, value) {
            if (err) {
                return callback(err);
            }
            portalToken['portal_pwd'] = CommonMethod.decrypto(value.ss_value);
            return callback(null, portalToken);
        });
    });
};

//获取门户账号名
SysControl.getPortalUName = function (callback) {
    var portalToken = {};
    systemSettingModel.getValueByIndex('portal_uname', this.returnFunction(callback, 'Error in getting portal user name'));
};

//! set portal info in the service container
SysControl.setPortalInfo = function (username, pwd, callback) {
    if (ParamCheck.checkParam(callback, username)) {
        if (ParamCheck.checkParam(callback, pwd)) {
            pwd = CommonMethod.decrypto(pwd);
            SysControl.loginPortal(username, pwd, function (err, result) {
                if (err) {
                    return callback(err);
                }
                if (result) {
                    var ss_uname = {
                        ss_index: 'portal_uname',
                        ss_value: username
                    };
                    systemSettingModel.setValueByIndex(ss_uname, function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        var ss_pwd = {
                            ss_index: 'portal_pwd',
                            ss_value: CommonMethod.crypto(pwd)
                        };
                        systemSettingModel.setValueByIndex(ss_pwd, function (err, result) {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, {
                                result: 'suc'
                            });
                        });
                    });
                }
                else {
                    return callback(null, {
                        result: 'fail'
                    });
                }
            });
        }
    }
};

//! clear the portal info in the service container
SysControl.clearPortalInfo = function (callback) {
    //!TODO need login at first
    systemSettingModel.getValueByIndex("portal_uname", function(err, data){
        if(err){
            return callback(err);
        }
        var account = data["ss_value"];
        PortalControl.unregisterPortal(account, function(err, result){
            if (err) {
                return callback(err);
            }
            if (result) {
                var ss_uname = {
                    ss_index: 'portal_uname',
                    ss_value: 'username'
                };
                systemSettingModel.setValueByIndex(ss_uname, function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    var ss_pwd = {
                        ss_index: 'portal_pwd',
                        ss_value: 'b48b962c9e87fc58c5841bbce6a47f61'
                    };
                    systemSettingModel.setValueByIndex(ss_pwd, function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, {
                            result: 'suc'
                        });
                    });
                });
            }
            else {
                return callback(null, {
                    result: 'fail'
                });
            }
        });
    })
};

//////////////////////////////////分布式网络

//系统获取父节点方法
SysControl.getSystemParent = function (callback) {
    systemSettingModel.getValueByIndex('parent', this.returnFunction(callback, 'error in get parent'));
};

//获取父节点并添加判断父节点是否还存在该子节点的错误处理机制
SysControl.getParent = function (callback) {
    systemSettingModel.getValueByIndex('parent', function (err, parent) {
        if (err) {
            return callback(err);
        }
        var oldparent = parent.ss_value;
        oldparent = oldparent.substr(0, oldparent.indexOf(':'));
        if (oldparent == '127.0.0.1') {
            systemSettingModel.getValueByIndex('parent', this.returnFunction(callback, 'error in get parent'));
        } else {
            systemSettingModel.getValueByIndex('parent', function (err, parent) {
                if (err) {
                    return callback(err);
                }
                //进行get请求，父节点根据host检查本地数据
                RemoteControl.getRequestJSON('http://' + parent.ss_value + '/child-node', function (err, data) {
                    if (err) {
                        return callback(err);
                    }
                    if (data.data) {
                        //当返回的数据不为空时，正常返回本地数据库记录
                        systemSettingModel.getValueByIndex('parent', ModelBase.returnFunction(callback, 'error in get parent'));

                    } else {
                        //为空，则更新数据库再返回
                        systemSettingModel.getValueByIndex('parent', function (err, parent) {
                            if (err) {
                                return callback(err);
                            }
                            parent.ss_value = '127.0.0.1:8060';
                            systemSettingModel.setValueByIndex(parent, function (err, result) {
                                if (err) {
                                    return callback(err);
                                }
                                systemSettingModel.getValueByIndex('parent', ModelBase.returnFunction(callback, 'error in get parent'));
                            });
                        });
                    }
                })
            }.bind(this));
        }
    }.bind(this));
};

//设置父节点
SysControl.setParent = function (host, port, callback) {
    //进行异步删除原先代理服务器下的包含本机节点的数据表
    systemSettingModel.getValueByIndex('parent', function (err, parent) {
        if (err) {
            return callback(err);
        }
        RemoteControl.getRequestJSON('http://' + parent.ss_value + '/child-node/delete', function (err) {
            if (err) {
                return callback(err);
            }
        });
    });
    var newparent = host + ':' + port;
    systemSettingModel.getValueByIndex('parent', function (err, parent) {
        if (err) {
            return callback(err);
        }
        parent.ss_value = newparent;
        systemSettingModel.setValueByIndex(parent, function (err, result) {
            if (err) {
                return callback(err);
            }
            var access_token = CommonMethod.crypto(host);
            RemoteControl.postRequestJSONWithForm('http://' + parent.ss_value + '/child-node', {
                port: setting.port,
                platform: setting.platform,
                access_token: access_token
            }, this.returnFunction(callback, 'error in post child'));
        }.bind(this));
    }.bind(this));
};

//重置父节点
SysControl.resetParent = function (host, callback) {
    systemSettingModel.getValueByIndex('parent', function (err, ss) {
        if (err) {
            return callback(err);
        }
        var parent = ss.ss_value;
        if (parent.substr(0, parent.indexOf(':')) == host) {
            systemSettingModel.getValueByIndex('parent', function (err, parent) {
                if (err) {
                    return callback(err);
                }
                parent.ss_value = '127.0.0.1:8060';
                systemSettingModel.setValueByIndex(parent, this.returnFunction(callback, 'error in post child'));
            }.bind(this));
        }
    }.bind(this));
};

//检查服务器是否可用
SysControl.checkServer = function (server, callback) {
    RemoteControl.ping(server + '/ping', function (result) {
        return callback(null, result);
    });
};

//获取Token
SysControl.getToken = function (ip, callback) {
    if (ParamCheck.checkParam(callback, ip)) {
        var token = CommonMethod.crypto(ip);
        return callback(null, token);
    }
};

//获取设置信息
SysControl.getSettings = function (callback) {
    SysControl.getTaskServerStatus(function(err, status){
        if(err){
            return callback(err);
        }else{
            setting.registered = status;
            return callback(null, setting);
        }     
    })
};

//获取注册表信息
SysControl.autoDetectSW = function (cb) {
    var softEnPath = setting.dirname + '/helper/softwareEnviro.txt';
    var softEnOutPath = setting.dirname + '/helper/softwareEnviroOut.txt';
    var getReg = function (type, cb) {
        var regePath;
        if (type == 'x86') {
            regePath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node';
        }
        else if (type == 'x64') {
            regePath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall';
        }
        var parseRegedit = function (stdout) {
            var sweRst = [];
            if (!stdout)
                stdout = '';
            var count = 0;
            var regList = stdout.split("\r\n\r\n");
            for (var i = 0; i < regList.length; i++) {
                var sweStr = regList[i];
                var groupName = sweStr.match(/DisplayName\s{4}REG_SZ\s{4}(.*)/);
                var groupVer = sweStr.match(/DisplayVersion\s{4}REG_SZ\s{4}(.*)/);
                var groupPub = sweStr.match(/Publisher\s{4}REG_SZ\s{4}(.*)/);
                var name = '';
                var version = '';
                var publisher = '';
                var type = '';
                if (groupName) {
                    count++;
                    name = groupName[1];
                    if (name.indexOf('redistributable') != -1 && name.index.indexOf('c++')) {
                        type = 'C++ Runtime';
                    }
                    else if (name.indexOf('.net') != -1 && name.indexOf('framework') != -1 && name.indexOf('microsoft') != -1) {
                        type = '.NET Runtime';
                    }
                    else if (name.indexOf('java') != -1 && (name.indexOf('se') || name.indexOf('ee') != -1 || name.index('me') != -1)) {
                        type = 'Java Runtime';
                    }
                    else if (name.indexOf('crt') != -1 && name.indexOf('visual') != -1 && name.indexOf('c++') != -1) {
                        type = 'C Runtime';
                    }
                }
                else
                    continue;
                if (groupVer) {
                    version = groupVer[1];
                }
                if (groupPub) {
                    publisher = groupPub[1];
                }
                sweRst.push({
                    _id: CommonMethod.createGUID(),
                    name: name,
                    version: version,
                    publisher: publisher,
                    // platform:name.indexOf('x64')!=-1?'x64':(name.indexOf('x86')!=-1?'x86':''),
                    platform: os.arch(),
                    type: type
                })
            }
            return cb(null, sweRst);
        };
        var child = exec('REG QUERY ' + regePath + ' /s', {
            encoding: 'GBK',
            maxBuffer: 1024 * 1024 * 100  /*stdout和stderr的最大长度*/
        });
        if (fs.existsSync(softEnOutPath))
            fs.unlinkSync(softEnOutPath);
        child.stdout.on('data', function (data) {
            data = iconv.decode(data, 'gbk');
            fs.appendFileSync(softEnOutPath, data, 'utf8');
        });
        child.stderr.on('data', function (data) {
            cb(data);
        });
        child.on('close', function (code) {
            fs.readFile(softEnOutPath, function (err, data) {
                if (err) {
                    return cb(err);
                }
                else {
                    parseRegedit(data.toString())
                }
            })
        });

    };
    var sweStrList = [];
    var arch = os.arch();
    if (arch === 'x64') {
        getReg('x64', function (err, sweStrList2) {
            if (err) {
                return cb(err);
            }
            else {
                sweStrList = sweStrList.concat(sweStrList2);
                // getReg('x86',function (err, sweStrList2) {
                //     if(err){
                //         return cb(err);
                //     }
                //     else{
                //         sweStrList = sweStrList.concat(sweStrList2);

                // fs.writeFile(softEnPath,sweStrList.join('[\\t\\t\\t]'),function (err) {
                //     if(err){
                //         console.log(err);
                //     }
                //
                // })
                // var swlist = [];
                // for(var i=0;i<strswlist.length;i++){
                //     var swItemKV = strswlist[i].split('[\t\t]');
                //     var platform = '';
                //     if(swItemKV[1])
                //         platform = swItemKV[1].indexOf('x64')!=-1?'x64':(swItemKV[1].indexOf('x86')!=-1?'x86':'');
                //     swlist.push({
                //         _id:swItemKV[0],
                //         name:swItemKV[1],
                //         version:swItemKV[2],
                //         publisher:swItemKV[3],
                //         platform:platform,
                //         type:swItemKV[4]
                //     });
                // }

                sweStrList.push({
                    _id: CommonMethod.createGUID(),
                    name: os.type(),
                    version: os.release(),
                    publisher: '',
                    type: 'OS'
                });
                var sweStrRst = '';
                for (var i = 0; i < sweStrList.length; i++) {
                    sweStrRst += sweStrList[i]._id + '[\t\t]' +
                        sweStrList[i].name + '[\t\t]' +
                        sweStrList[i].version + '[\t\t]' +
                        sweStrList[i].publisher + '[\t\t]' +
                        // sweStrList[i].platform + '[\t\t]' +
                        sweStrList[i].type;
                    if (i < sweStrList.length - 1) {
                        sweStrRst += '[\t\t\t]';
                    }
                }
                fs.writeFile(softEnPath, sweStrRst, 'utf8', function (err) {
                    if (err) {
                        return cb(err);
                    }
                    else {
                        return cb(null, sweStrList);
                    }
                });
            }
        })
    } else {
        //32位获取环境变量,目前不考虑Linux系统，只考虑32位和64位区别
        getReg('x86', function (err, sweStrList2) {
            if (err) {
                return cb(err);
            }
            sweStrList = sweStrList.concat(sweStrList2);
            sweStrList.push({
                _id: CommonMethod.createGUID(),
                name: os.type(),
                version: os.release(),
                publisher: '',
                type: 'OS'
            });
            var sweStrRst = '';
            for (var i = 0; i < sweStrList.length; i++) {
                sweStrRst += sweStrList[i]._id + '[\t\t]' +
                    sweStrList[i].name + '[\t\t]' +
                    sweStrList[i].version + '[\t\t]' +
                    sweStrList[i].publisher + '[\t\t]' +
                    // sweStrList[i].platform + '[\t\t]' +
                    sweStrList[i].type;
                if (i < sweStrList.length - 1) {
                    sweStrRst += '[\t\t\t]';
                }
            }
            fs.writeFile(softEnPath, sweStrRst, 'utf8', function (err) {
                if (err) {
                    return cb(err);
                }
                else {
                    return cb(null, sweStrList);
                }
            });

        })

    }
};

SysControl.autoDetectHW = function (callback) {
    var hweList = [];
    hweList.push({
        _id: new ObjectId().toString(),
        name: 'memory size',
        value: Math.floor(os.totalmem() / 1024 / 1024) + ' MB'
    });
    var cpuInfo = os.cpus();
    hweList.push({
        _id: new ObjectId().toString(),
        name: 'cpu core numble',
        value: cpuInfo.length
    });
    hweList.push({
        _id: new ObjectId().toString(),
        name: 'cpu frequency',
        value: cpuInfo[0].speed / 1000 + ' GHz'
    });
    hweList.push({
        _id: new ObjectId().toString(),
        name: 'cpu model',
        value: cpuInfo[0].model
    });
    if (setting.platform == 1) {
        exec('wmic logicaldisk get caption,size,freespace', function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                return callback(err);
            }
            var array = stdout.split("\r\r\n");
            array.pop();
            array.pop();
            array.shift();
            var i, j, totle = 0, avail = 0;
            for (i = 0; i < array.length; i++) {
                var space = array[i].split(" ");
                var ele = [];
                for (j = 0; j < space.length; j++) {
                    if (+space[j]) {
                        ele.push(+space[j]);
                    }
                }
                if (ele[1])
                    totle += ele[1];
                if (ele[0])
                    avail += ele[0];
            }
            hweList.push({
                _id: new ObjectId().toString(),
                name: 'disk total size',
                value: Math.floor(totle / 1024 / 1024 / 1024) + ' GB'
            });
            hweList.push({
                _id: new ObjectId().toString(),
                name: 'disk avail size',
                value: Math.floor(avail / 1024 / 1024 / 1024) + ' GB'
            });
            fs.writeFile(setting.dirname + '/helper/hardwareEnviro.txt', JSON.stringify(hweList), function (err) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                else {
                    callback(null, hweList);
                }
            })
        });
    }
    else if (setting.platform == 2) {
        var spawn = require('child_process').spawn,
            free = spawn('df');

        // 捕获标准输出并将其打印到控制台
        free.stdout.on('data', function (data) {
            var diskInfo = data.toString().split('\n');
            var i;
            for (i = 0; i < diskInfo.length; i++) {
                // 寻找系统盘
                if (diskInfo[i][diskInfo[i].length - 1] == '/') {
                    let basicInformation = diskInfo[i].split(/\s+/);
                    let availableDisk = basicInformation[basicInformation.length - 3];
                    let totalDisk = basicInformation[1];
                    // percent = percent[percent.length - 2];
                    // percent = percent.split('%')[0];
                    // sysinfo.disk = [+percent, '磁'];
                    hweList.push({
                        _id: new ObjectId().toString(),
                        name: 'disk total size',
                        value: totalDisk
                    });

                    hweList.push({
                        _id: new ObjectId().toString(),
                        name: 'disk avail size',
                        value: availableDisk
                    });
                    break;
                }
            }
            fs.writeFile(__dirname + '/../helper/hardwareEnviro.txt', JSON.stringify(hweList), function (err) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                else {
                    callback(null, hweList);
                }
            })
        });
        
        free.stderr.on('data', function (data) {
            callback(data);
        });
    }
};

SysControl.readAllHW = function (callback) {
    var hardEnPath = setting.dirname + '/helper/hardwareEnviro.txt';
    fs.readFile(hardEnPath, function (err, data) {
        if (err) {
            return callback('read file err!');
        }
        //将文件组织为json
        data = iconv.decode(data, 'gbk');
        callback(null, JSON.parse(data));
    })
};

SysControl.readAllSW = function (callback) {
    var softEnPath = setting.dirname + '/helper/softwareEnviro.txt';
    fs.readFile(softEnPath, function (err, data) {
        if (err) {
            return callback('read file err!');
        }
        //将文件组织为json
        data = data.toString();
        // data = iconv.decode(data,'gbk');
        var strswlist = data.split('[\t\t\t]');
        var swlist = [];
        for (var i = 0; i < strswlist.length; i++) {
            var swItemKV = strswlist[i].split('[\t\t]');
            swlist.push({
                _id: swItemKV[0],
                name: swItemKV[1],
                version: swItemKV[2],
                publisher: swItemKV[3],
                // platform:swItemKV[1].indexOf('x64')!=-1?'x64':(swItemKV[1].indexOf('x86')!=-1?'x86':''),
                type: swItemKV[4]
            });
        }
        callback(null, swlist);
    })
};

//如果字段不存在，自动建立字段
//在该函数中，添加如果字段存在的话，对于ss_value属性进行对比，有变化则进行更新，无变化则退出,且增加特殊情况对于parent字段如果有变化保持不变
SysControl.buildField = function (field, defaultValue, callback) {
    systemSettingModel.getValueByIndex(field, function (err, item) {
        if (err) {
            return callback(err);
        }
        if (item == null) {
            var ss = new systemSettingModel({
                ss_index: field,
                ss_value: defaultValue
            });
            ss.save(function (err, result) {
                if (err) {
                    return callback(err);
                }
                return callback(null, result);
            });
        } else {
            return callback(null, true);
        }
    });
};

/////////////////////////////////管理员
//得到管理员信息
SysControl.getAdminInfo = function (callback) {
    systemSettingModel.getValueByIndex('adminName', this.returnFunction(callback, 'error in getting administrator info'));
};

//用户登录
SysControl.adminLogin = function (adminName, pwd, callback) {
    if (ParamCheck.checkParam(callback, adminName)) {
        if (ParamCheck.checkParam(callback, pwd)) {
            systemSettingModel.getValueByIndex('adminName', function (err, ss) {
                if (err) {
                    return callback(err);
                }
                if (ss.ss_value != adminName) {
                    return callback(null, false);
                }
                systemSettingModel.getValueByIndex('adminPwd', function (err, ss) {
                    if (err) {
                        return callback(err);
                    }
                    pwd = CommonMethod.decrypto(pwd);
                    // var pwd_md5 = CommonMethod.md5(pwd)
                    if (pwd == ss.ss_value) {
                        return callback(null, true)
                    }
                    return callback(null, false);
                });
            });
        }
    }
};

//更改用户名密码 有验证
SysControl.alterNameAndPwdWithAuth = function (adminName, pwd, newAdminName, newPwd, callback) {
    if (ParamCheck.checkParam(callback, newPwd)) {
        if (ParamCheck.checkParam(callback, newAdminName)) {
            SysControl.adminLogin(adminName, pwd, function (err, result) {
                if (err) {
                    return callback(err);
                }
                if (result) {
                    systemSettingModel.getValueByIndex('adminPwd', function (err, ss) {
                        if (err) {
                            return callback(err);
                        }
                        newPwd = CommonMethod.decrypto(newPwd);
                        ss.ss_value = crypto.createHash('md5').update(newPwd).digest('hex');
                        systemSettingModel.update(ss, function (err, pwdAlterResult) {
                            if (err) {
                                return callback(err);
                            }
                            if (pwdAlterResult.n == 1) {
                                systemSettingModel.getValueByIndex('adminName', function (err, ss) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    ss.ss_value = newAdminName;
                                    systemSettingModel.update(ss, function (err, nameAlterResult) {
                                        if (err) {
                                            return callback(err);
                                        }
                                        if (nameAlterResult.n == 1) {
                                            return callback(null, {
                                                result: 1
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }.bind(this));
                }
                else {
                    return callback(null, {
                        result: -1,
                        message: 'Auth fails'
                    })
                }
            });
        }
    }
};

//region 注册到门户
SysControl.register = function (cb) {
    registerCtrl.register(SysControl.getRegisterInfo, cb);
};

SysControl.deregister = function (cb) {
    registerCtrl.deregister(cb);
};
//endregion

SysControl.checkMachineIP = function (cb) {
    var rst;
    RegisterModel.getByWhere({}, function (err, data) {
        if (err) {
            rst = { status: -1 };
            return cb(JSON.stringify(rst));
        }
        if (data.length) {
            var registerIP = data[0].host;
            SysControl.getIP(function (err, ip) {
                if (err) {
                    rst = { status: -1 };
                    return cb(JSON.stringify(rst));
                }
                if (registerIP === ip) {
                    rst = { status: 0 };
                    return cb(JSON.stringify(rst));
                } else {
                    rst = { status: 1 };
                    return cb(JSON.stringify(rst));
                }
            })
        } else {
            rst = { status: 0 };
            return cb(JSON.stringify(rst));
        }
    })
};

SysControl.updateServer = function (username, pwd, callback) {
    if (ParamCheck.checkParam(callback, username)) {
        if (ParamCheck.checkParam(callback, pwd)) {
            // pwd = CommonMethod.decrypto(pwd);
            SysControl.loginPortal(username, pwd, function (err, result) {
                if (err) {
                    return callback(err);
                }
                RegisterModel.getByWhere({}, function (err, data) {
                    if (err) {
                        return callback(err);
                    }
                    var ComputableNodeId = data[0].info;
                    //调用获取环境信息
                    SysControl.getRegisterInfo(function (err, registerInfo) {
                        if (err) {
                            return callback(err);
                        }
                        //修改硬件环境上传信息
                        var diskValue = registerInfo.hardware[0] + 0.01;
                        var freesize = registerInfo.disksize[0] - 0.01;
                        var totalsize = registerInfo.disksize[1] - 0.01;
                        var hwInformation = {
                            disk: diskValue,
                            freesize: freesize,
                            totalsize: totalsize
                        };
                        var softwareInformation = {
                            cpus: registerInfo.software
                        };

                        var InfoFiled = {
                            Name: registerInfo.hostname,
                            Port: registerInfo.port,
                            System: os.type(),
                            Software: softwareInformation,
                            Hardware: hwInformation,
                            Host: registerInfo.host,
                            uid: ComputableNodeId
                        };
                        var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerNodeUpdateServlet?updateInfo=' + JSON.stringify(InfoFiled);
                        RemoteControl.postRequestJSON(url, function (err, msg) {
                            if (err) {
                                return callback(err);
                            }
                            else {
                                if (msg.result == 'suc') {
                                    //修改当前数据库host记录
                                    var recentInfo = data[0];
                                    recentInfo.host = InfoFiled.Host;
                                    RegisterModel.update(recentInfo, function (err) {
                                        if (err) {
                                            return callback(err);
                                        }
                                        return callback(null, {
                                            result: 'suc'
                                        })
                                    })

                                } else {
                                    return callback(null, {
                                        result: 'fail'
                                    });
                                }
                            }
                        });
                    });
                });
            });
        }
    }
}

//! get task server info
SysControl.getTaskServerInfo = function (callback) {
    systemSettingModel.getValueByIndex('taskServer', function (err, item) {
        if (err) {
            return callback(err);
        }
        systemSettingModel.getValueByIndex('taskType', function (err, itemType) {
            if (err) {
                return callback(err);
            }
            var server = item.ss_value;
            var ip = server.substr(0, server.indexOf(':'));
            var port = parseInt(server.substr(server.indexOf(':') + 1));
            return callback(null, {
                ip: ip,
                port: port,
                type : parseInt(itemType.ss_value)
            });
        });
    });
}

//! set task server info
SysControl.setTaskServerInfo = function (server, callback) {
    var ss_value = server.ip + ':' + server.port.toString();
    systemSettingModel.setValueByIndex(
        {
            ss_index: "taskServer",
            ss_value: ss_value
        }, function (err, result) {
            if (err) {
                return callback(err);
            }
            
            systemSettingModel.setValueByIndex({
                ss_index : "taskType",
                ss_value : server.type
            }, function(err, result){
                if(err){
                    return callback(err);
                }
                return callback(null, result);
            });
        });
}

//! add by wang ming , get the status of task server info. 0:未注册  1：已注册
SysControl.getTaskServerStatus = function (callback) {
    systemSettingModel.getValueByIndex('taskServer', function (err, data) {
        if (err) {
            return callback(err);
        } else {
            var server = data.ss_value;
            if (server === '0.0.0.0:0') {
                return callback(null, 0);
            } else {
                return callback(null, 1);
            }
        }
    })
}
