/**
 * Created by Franklin on 2016/9/12.
 * for child node Computer Resource
 */
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');
var mongoModels = require('./mongoModels');

function Child(cld) {
    if(cld != null)
    {
        this.host = cld.host;
        this.port = cld.port;
        this.platform = cld.platform;
        this.accepted = cld.accepted;
        this.access_token = cld.access_token;
    }
    else
    {
        this.host = '';
        this.port = 0;
        this.platform = 0;
        this.accepted = 0;
        this.access_token = '';
    }
}

Child.__proto__ = ModelBase;
module.exports = Child;


// var ChildSchema = new mongoose.Schema({
//     host:String,
//     port:String,
//     platform:Number,
//     accepted:Boolean,
//     access_token :String
// },{collection:'child'});
// var ChildModel = mongoose.model('child',ChildSchema);
var ChildModel = mongoModels.child;
Child.baseModel = ChildModel;
Child.modelName = "Child";

//新增节点
// Child.prototype.save = function (callback) {
//     var cld = {
//         host : this.host,
//         port : this.port,
//         platform : this.platform,
//         accepted : this.accepted,
//         access_token : this.access_token
//     };
//     cld = new ChildModel(cld);
//     cld.save(function (err, res) {
//         if(err){
//             return callback(err);
//         }
//         res = JSON.parse(JSON.stringify(res));
//         return callback(null, res);
//     });
// };

//得到全部子节点
Child.getAll = function (callback) {
    ChildModel.find({},this.returnFunction(callback, 'Error in getting all child'));
};

//得到全部子节点
Child.getAllAvai = function (callback) {
    ChildModel.find({ accepted : true },this.returnFunction(callback, 'Error in getting all child'));
};

//通过OID查询子节点信息
// Child.getByOID = function (_oid, callback) {
//     if(ParamCheck.checkParam(callback,_oid))
//     {
//         var oid = new ObjectId(_oid);
//         ChildModel.findOne({_id:oid},this.returnFunction(callback, "error in getting by oid in child"));
//     }
// };

//条件查询
// Child.getByWhere = function (where, callback) {
//     if(ParamCheck.checkParam(callback, where))
//     {
//         this.baseModel.findOne(where, this.returnFunction(callback, 'Error in getting by where in child'));
//     }
// };

//根据host查询
Child.getByHost = function (host, callback) {
    if(ParamCheck.checkParam(callback, host))
    {
        ChildModel.findOne({host : host},this.returnFunction(callback, "error in getting by oid in child"));
    }
};