/**
 * Created by Franklin on 2016/9/13.
 */

// var Child = require('../model/child');
// var Child = require('../model/child_n');
var Child = require('../model/dbSwitcher').child;
var RemoteRequestControl = require("./remoteReqControl");

function ChildCtrl() {}

module.exports = ChildCtrl;

//得到全部子节点信息
ChildCtrl.getAll = function (callback) {
    Child.getAll(function (err, data) {
       if(err)
       {
           return callback(err)
       }
       return callback(null, data);
    });
};

//得到全部子节点信息及是否连通信息
ChildCtrl.getAllWithPing = function (callback) {
    Child.getAll(function (err, children) {
        if(err)
        {
            return callback(err)
        }
        var count = 0;
        if(children.length == 0)
        {
            return callback(null, []);
        }
        var pending = function(index)
        {
            count ++;
            return function (result)
            {
                count --;
                if(result.result == 'OK')
                {
                    children[index].ping = 1;
                }
                else
                {
                    children[index].ping = 0;
                }
                if(count == 0)
                {
                    return callback(null, children);
                }
            }
        };
        for(var i = 0; i < children.length; i++)
        {
            RemoteRequestControl.ping(children[i].host + ':' + children[i].port + '/ping', pending(i));
        }
        // return callback(null, data);
    });
};

//根据OID得到子节点信息
ChildCtrl.getByOID = function (oid, callback) {
    Child.getByOID(oid, function (err, child) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, child);
    });
};

//条件查询
ChildCtrl.getByWhere = function (where, callback) {
    Child.getByWhere(where, function (err, child) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, child);
    });
};

//根据Host查询
ChildCtrl.getByHost = function (host, callback) {
    Child.getByHost(host, function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//新增子节点
ChildCtrl.AddNewChild = function(child, callback) {
    Child.getByHost(child.host, function(err, item){
        if(err){
            return callback(err);
        }
        if(item == null){
            var cld = new Child(child);
            cld.save(function (err, item) {
                if(err)
                {
                    return callback(err);
                }
                return callback(null, item);
            });
        }
        else{
            return callback(null, item);
        }
    });
};

//接受子节点
ChildCtrl.Accept = function(oid, callback){
    Child.getByOID(oid, function(err, item){
        item.accepted = 1;
        Child.update(item, function(err, result){
            if(err){
                return callback(err);
            }
            return callback(null, result);
        });
    });
};

//删除节点
ChildCtrl.remove = function(oid, callback){
    Child.getByOID(oid, function(err, child){
        if(err){
            return callback(err);
        }
        RemoteRequestControl.putRequestJSON('http://' + child.host + ':' + child.port + '/parent?ac=reset&token=' + child.access_token, function(){});
        Child.delete(oid, function(err, result){
            if(err){
                return callback(err);
            }
            return callback(null, result);
        });
    });
};

//删除本地环境下的子节点
ChildCtrl.delete = function(oid, callback){
    Child.getByOID(oid, function(err,child){
        if(err){
            return callback(err);
        }
        Child.delete(oid, function(err,result){
            if(err){
                return callback(err);
            }
            return callback(null, result);
        })
    })
}