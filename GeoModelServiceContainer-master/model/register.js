var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var setting = require('../setting');
var mongoModels = require('./mongoModels');

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

// var RegisterSchema = new mongoose.Schema({
//     registered : Boolean,
//     hostname : String,
//     host : String,
//     port : String,
//     platform : Number,
//     info : String,
//     // mac: String
// },{collection:'register'});
// var RegisterModel = mongoose.model('register',RegisterSchema);
var RegisterModel = mongoModels.register;
Register.baseModel = RegisterModel;
Register.modelName = 'register';
