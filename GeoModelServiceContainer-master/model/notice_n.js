/**
 * Author : Fengyuan(Franklin) Zhang
 * Date : 2021/1/9
 * Description : NeDB for notice data
 */

const nedb = require('nedb');
const setting = require('../setting');
const ModelBase = require('./modelBase_n');
const ParamCheck = require('../utils/paramCheck');
 

const NoticeDB = new nedb({
  filename: setting.nedb.path + "notice",
  autoload: true
});

var Notice = {}
Notice.__proto__ = ModelBase;
Notice.baseModel = NoticeDB;
module.exports = Notice;

Notice.getAll = function(callback){
    NoticeDB.find({}).sort({'time':-1}).exec(this.returnFunction(callback, 'Error in getting all notices by where'));
}

Notice.getAllByTypeAndRead = function(type, read, callback){
    var where = {};
    if(type){
        if(type == 'start'){
            where['type'] = 'start-run';
        }
        else if(type == 'stop'){
            where['type'] = 'stop-run';
        }
        else if(type == 'delete'){
            where['type'] = 'del-ms';
        }
    }
    if(read){
        if(read == 'true'){
            where['hasRead'] = true;
        }
        if(read == 'false'){
            where['hasRead'] = false;
        }
    }
    NoticeDB.find(where).sort({'time':-1}).exec(ModelBase.returnFunction(callback, 'Error in getting all notices by where'));
}

Notice.markAllAsRead = function(callback){
    var update = {
        $set:{hasRead : true}
    };
    NoticeDB.update({hasRead : false}, update, {multi : true}, this.returnFunction(callback, 'Error in updating notice as read by oid'));
}

Notice.markAsRead = function(oid, callback){
    if(ParamCheck.checkParam(callback, oid)){
        var where = {'_id' : oid};
        var update = {
            hasRead : true
        };
        NoticeDB.update(where, {$set:update}, this.returnFunction(callback, 'Error in updating notice as read by oid'));
    }
}