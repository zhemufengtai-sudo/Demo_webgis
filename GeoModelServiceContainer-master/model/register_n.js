/**
 * Author : 7b
 * Date : 2021/6/4
 * Description : NeDB for register
 */

const nedb = require('nedb');
var ModelBase = require('./modelBase_n');
var setting = require('../setting');

//该数据库下只会保存一条数据，即本机容器注册信息,新增字段info,用于和门户进行交互
function Register(register) {
    if(register){
        this.registered = register.registered;
        this.hostname = register.hostname;
        this.host = register.host;
        this.port = register.port;
        this.platform = setting.platform;
        this.info = register.info;
        // this.mac = register.mac;
    }
    else{
        this.registered = false;
        this.hostname = '';
        this.host = '';
        this.port = '';
        this.platform = setting.platform;
        this.info = '';
        // this.mac = '';
    }
}

Register.__proto__ = ModelBase;
module.exports = Register;

const RegisterModel = new nedb({
    filename: setting.nedb.path + "register",
    autoload: true
});

Register.baseModel = RegisterModel;
Register.modelName = 'register';
