/**
 * Created by Franklin on 2017/3/17.
 */
var CommonBase = require('../utils/commonBase');

var ControlBase = function () {};
ControlBase.__proto__ = CommonBase;
ControlBase.model = null;

module.exports = ControlBase;

ControlBase.returnRemoteFunction = function(callback, errMess){
    return (function (err, res) {
        if(err)
        {
            if(errMess != null && typeof errMess == "string")
            {
                console.log(errMess);
            }
            return callback(err);
        }
        if(res.result == 'suc'){
            return callback(null, res.data);
        }
        else{
            return callback(new Error('Error in requesting'));
        }
    });
}

ControlBase.getByOID = function (oid, callback) {
    this.model.getByOID(oid,function (err, data) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,data);
        }
    })
};

ControlBase.update = function (newItem, callback) {
    this.model.update(newItem,function (err, data) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,data);
        }
    })
};

ControlBase.delete = function (oid, callback) {
    this.model.delete(oid,function (err,data) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,data);
        }
    })
};

ControlBase.getByWhere = function (where, callback) {
    this.model.getByWhere(where,function (err, data) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,data);
        }
    })
};

ControlBase.getByTextSearch = function (query, cb) {
    this.model.getByTextSearch(query,function (err, data) {
        if(err){
            return cb(err);
        }
        else{
            return cb(null,data);
        }
    })
};

ControlBase.updateByWhere = function (query, update, options, callback) {
    this.model.updateByWhere(query,update,options,function (err, data) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,data);
        }
    })
};

ControlBase.save = function (item, callback) {
    this.model.save(item,function (err, data) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,data);
        }
    })
};

ControlBase.items2TableTree = function(items,callback){
    this.model.items2TableTree(items,function (err, data) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,data);
        }
    })
};

ControlBase.all2TableTree = function (callback) {
    this.model.all2TableTree(function (err, data) {
        if(err){
            callback(err);
        }
        else{
            callback(null,data);
        }
    });
};