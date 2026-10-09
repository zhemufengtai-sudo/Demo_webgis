/**
 * Created by Franklin on 2017/3/16.
 */
var CommonBase = require('../utils/commonBase');
var ParamCheck = require('../utils/paramCheck');
var ObjectId = require('mongodb').ObjectID;

var ModelBase = function () {};
ModelBase.__proto__ = CommonBase;
this.baseModel = null;
this.modelName = "";

module.exports = ModelBase;

ModelBase.delete = function (_oid, callback) {
    if(ParamCheck.checkParam(callback, _oid))
    {
        var oid = new ObjectId(_oid);
        this.baseModel.remove({_id: oid},this.returnFunction(callback, "Error in removing" + this.modelName));
    }
};

ModelBase.getByOID = function(_oid,callback){
    if(ParamCheck.checkParam(callback, _oid))
    {
        var oid = new ObjectId(_oid);
        this.baseModel.findOne({'_id' : oid}, this.returnFunction(callback, 'Error in getting a ' + this.modelName + ' by id'));
    }
};

ModelBase.getByID = function(_oid,callback){
    if(ParamCheck.checkParam(callback, _oid))
    {
        var oid = new ObjectId(_oid);
        this.baseModel.findOne({'_id' : oid}, this.returnFunction(callback, 'Error in getting a ' + this.modelName + ' by id'));
    }
};

ModelBase.getByWhere = function (where, callback) {
    if(ParamCheck.checkParam(callback, where))
    {
        this.baseModel.find(where).sort({'_id':-1}).exec(this.returnFunction(callback, 'Error in getting a ' + this.modelName + ' by where'));
    }
};

ModelBase.getByTextSearch = function (query, cb) {
    this.findBase(query,
        {score: { $meta: "textScore" }},
        {score: { $meta: "textScore" }},
        cb);
};

ModelBase.findBase = function (query, options, sort, cb) {
    this.baseModel.find(query,options).sort(sort).exec(this.returnFunction(cb, 'Error in getting a ' + this.modelName));
};

ModelBase.findAll = function (cb) {
    this.baseModel.find().exec(this.returnFunction(cb, 'Error in getting a ' + this.modelName));
};

ModelBase.getAll = function (cb) {
    this.baseModel.find().exec(this.returnFunction(cb, 'Error in getting a ' + this.modelName));
};

ModelBase.update = function (newItem, callback) {
    var where = {'_id':newItem._id};
    var toUpdate = newItem;
    // delete toUpdate['_id'];
    this.baseModel.update(where,toUpdate,this.returnFunction(callback, 'Error in updating a ' + this.modelName + ' by where'));
};

ModelBase.updateByWhere = function (where, update,options, callback) {
    this.baseModel.update(where,update,options,this.returnFunction(callback, 'Error in updating a ' + this.modelName + ' by where'));
};

ModelBase.save = function (item, callback) {
    var newItem = new this.baseModel(item);
    //console.log('save newItem:',newItem);
    newItem.save(function (err, rst) {
        if(err){
            console.log('mongoDB err in save!:',err);
            return callback(err);
        }
        else{
            rst = JSON.parse(JSON.stringify(rst));
            return callback(null,rst);
        }
    });
};

ModelBase.upsert = function (where, update, cb) {
    this.baseModel.update(where,update,true,function (err, rst) {
        if(err){
            return cb(err);
        }
        else {
            return cb(null,rst);
        }
    })
};

//转为webix支持的json
ModelBase.items2TableTree = function (srcItems,callback) {
    var ItemKeyConvertor = function (srcKey,srcItem) {
        if(srcKey == '__v')
            return null;
        if(srcKey == '_id')
            return null;
        var dstItem;
        var type = typeof(srcItem[srcKey]);
        if(srcItem[srcKey] == null){
            type = 'string';
        }
        if(type == 'object'){
            if(srcItem[srcKey].length == undefined){
                type = 'Object';
            }
            else
                type = 'Array';
        }
        dstItem = {
            title:srcKey,
            type:type
            // folder:(type=='Object' || type=='Array')
        };
        if(type == 'Object'){
            var children = [];
            for(key in srcItem[srcKey]){
                children.push(ItemKeyConvertor(key,srcItem[srcKey]));
            }
            dstItem.children = children;
        }
        else if(type == 'Array'){
            var children = [];
            for(var i=0;i<srcItem[srcKey].length;i++){
                children.push(ItemKeyConvertor(i,srcItem[srcKey]));
            }
            dstItem.children = children;
        }
        else{
            dstItem.evaluate = '';
            dstItem.Value = srcItem[srcKey];
        }
        return dstItem;
    };

    var ItemConvertor = function (item) {
        var rst = {
            title : item['name'],
            id:item['_id'],
            // folder : true,
            type : 'Object'
        };
        if(item.score && item.score!=undefined){
            rst.Value = item.score;
        }
        var children = [];
        for(key in item){
            var child = ItemKeyConvertor(key,item);
            if(child)
                children.push(child);
        }
        rst.children = children;
        return rst;
    };

    var ItemsConvertor = function (i,srcItems,dstItems,callback) {
        if(i<srcItems.length){
            dstItems.push(ItemConvertor(srcItems[i]));
            ItemsConvertor(i+1,srcItems,dstItems,callback);
        }
        else{
            callback(null,dstItems);
        }
    };

    try{
        ItemsConvertor(0,srcItems,[],callback);
    }
    catch(err){
        callback(err);
    }
};

ModelBase.all2TableTree = function (callback) {
    this.baseModel.find({}).sort({'_id':-1}).exec(function (err, data) {
        if(err){
            callback(err);
        }
        else{
            data = JSON.parse(JSON.stringify(data));
            ModelBase.items2TableTree(data,function (err, data) {
                if(err){
                    callback(err);
                }
                else{
                    callback(null,data);
                }
            })
        }
    })
};