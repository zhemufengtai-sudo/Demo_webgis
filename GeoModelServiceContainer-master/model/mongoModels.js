/**
 * Author : 7b
 * Date : 2021/6/8
 * Description : MongoDB collections
 */
let models = {};
let mongoose = require('./mongooseModel');

let batchSchema = new mongoose.Schema({
    batch_path:String,
    zip_path:String,
    ms_info : mongoose.Schema.Types.Mixed,
    rst:mongoose.Schema.Types.Mixed,
    deployed:Boolean,
    ms_user:mongoose.Schema.Types.Mixed,
    category:String
},{collection:'batchDeploy'});
models.batchDeploy = mongoose.model('batchDeploy',batchSchema);

let ChildSchema = new mongoose.Schema({
    host:String,
    port:String,
    platform:Number,
    accepted:Boolean,
    access_token :String
},{collection:'child'});
models.child = mongoose.model('child',ChildSchema);

let gdSchema = new mongoose.Schema({
    gd_id : String,
    gd_tag : String,
    gd_datetime : String,
    gd_type : String,
    gd_size : Number,
    gd_value : String
},{collection:'geodata'});
models.geodata = mongoose.model('geodata', gdSchema);

var HWESchema = new mongoose.Schema({
    name : String,
    value:String
},{collection:'hardwareEnviro'});
HWESchema.index({name:'text',value:'text'});
models.hardwareEnviro = mongoose.model('hardwareEnviro',HWESchema);

var ModelSerAccessSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    token : String,
    deadline : String,
    times : Number,
    pid : String,
    msrs : Array
},{collection:'modelseraccess'});
models.modelseraccess = mongoose.model('modelseraccess',ModelSerAccessSchema);

let MSRSchema = new mongoose.Schema({
    ms_id : mongoose.Schema.Types.ObjectId,
    msr_ms :  mongoose.Schema.Types.Mixed,
    msr_datetime :  Date,
    msr_span : Number,
    msr_user :  mongoose.Schema.Types.Mixed,
    msr_guid :  String,
    msr_input :  Array,
    msr_output :  Array,
    msr_status : Number,
    msr_runninginfo :  mongoose.Schema.Types.Mixed,
    msr_logs :  Array,
    m_logs : Array,
    msr_processparams : Array,
    msr_controlparams : Array
},{collection:'modelserrun'});
models.modelserrun = mongoose.model('modelserrun',MSRSchema);

let msSchema = new mongoose.Schema({
    ms_model : mongoose.Schema.Types.Mixed,
    mv_num : String,
    ms_des : String,
    ms_update : String,
    ms_platform : Number,
    ms_path : String,
    ms_xml : String,
    ms_status : Number,
    ms_limited : Number,
    ms_permission : Number,
    ms_user : mongoose.Schema.Types.Mixed,
    ms_img : String,
    registerId : String
},{collection:'modelservice'});
models.modelservice = mongoose.model('modelservice',msSchema);

let noteSchema = new mongoose.Schema({
    time : Date,
    title : String,
    detail : String,
    type : String,
    hasRead : Boolean
},{collection:'notice'});
models.notice = mongoose.model('notice',noteSchema);

let RegisterSchema = new mongoose.Schema({
    registered : Boolean,
    hostname : String,
    host : String,
    port : String,
    platform : Number,
    info : String,
    // mac: String
},{collection:'register'});
models.register = mongoose.model('register',RegisterSchema);

let SWESchema = new mongoose.Schema({
    name : String,
    version:String,
    alias:Array,
    description:String,
    type:String,
    publisher:String,
    platform:String
    // dependencies:Array
},{collection:'softwareEnviro'});
SWESchema.index({alias:'text',name:'text',version:'text',platform:'text'});
models.softwareEnviro = mongoose.model('softwareEnviro',SWESchema);

let SystemSettingSchema = new mongoose.Schema({
    ss_index : String,
    ss_value : String
},{collection:'systemsetting'});
models.systemsetting = mongoose.model('systemsetting',SystemSettingSchema);

let vsSchema = new mongoose.Schema({
    vs_model : mongoose.Schema.Types.Mixed,
    vs_user : mongoose.Schema.Types.Mixed,
    vs_update: String,
    vs_path: String,
    vs_status: Number,            //可视化服务的状态，可用还是不可用
    vs_source: Number,            //说明是本地上传的可视化服务还是远程拉取下来的服务,0本地，1为远程
    vs_limited: Number,
    vs_img: String,
    vs_des: String              //可视化描述
},{collection:'visualizeservice'});
models.visualizeservice = mongoose.model('visualizeservice',vsSchema);

module.exports = models;