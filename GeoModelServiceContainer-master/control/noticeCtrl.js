/**
 * Created by ChaoRan on 2016/8/20.
 */

// var Notice = require('../model/notice_n');
var Notice = require('../model/dbSwitcher').notice;
// var Notice = require('../model/notice');
var controlBase = require('./controlBase');

function NoticeCtrl() {

}

NoticeCtrl.__proto__ = controlBase;
NoticeCtrl.model = Notice;
module.exports = NoticeCtrl;


//将未读标记为已读
NoticeCtrl.updateState = function (where, callback) {
    if(where._id == 'all'){
        Notice.updateByWhere({},{$set:{hasRead:true}},{multi:true,upsert:false},function (err, data) {
            if(err){
                return callback(null,JSON.stringify({status:0}));
            }
            return callback(null,JSON.stringify({status:1}));
        });
    }
    else{
        Notice.getByOID(where._id,function (err, data) {
            if(err){
                return callback(null,JSON.stringify({status:0}));
            }
            if(data){
                data.hasRead = true;
                Notice.update(data,function (err, data) {
                    if(err){
                        return callback(null,JSON.stringify({status:0}));
                    }
                    return callback(null,JSON.stringify({status:1}));
                })
            }
        });
    }
};

//添加模型启动消息
NoticeCtrl.addModelStartNotice = function(){
    
}

//添加模型停止消息
NoticeCtrl.addModelStopNotice = function(){

}

//添加模型删除消息
NoticeCtrl.addModelDeleteNotice = function(){

}

//得到所有消息
NoticeCtrl.getAllNoticeByTypeAndRead = function(type, read, callback){
    Notice.getAllByTypeAndRead(type, read, this.returnFunction(callback, 'Error in getting all notices!'));
}

//设置所有为已读
NoticeCtrl.markAllAsRead = function(callback){
    Notice.markAllAsRead(this.returnFunction(callback, 'Error in setting all notices as read'));
}

//设置所有为已读
NoticeCtrl.markAsRead = function(oid ,callback){
    Notice.markAsRead(oid, this.returnFunction(callback, 'Error in setting notice as read by oid'));
}