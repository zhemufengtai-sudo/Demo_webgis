/**
 * Created by Administrator on 4.21.
 */
// var sweModel = require('../model/softwareEnviro');
// var sweModel = require('../model/softwareEnviro_n');
var sweModel = require('../model/dbSwitcher').softwareEnviro;
var ControlBase = require('./controlBase');
var sysCtrl = require('./sysControl');
var versionCtrl = require('./versionCtrl');
var modelserCtrl = require('./modelSerControl');
var modelBase = require('../model/modelBase');
var remoteReqCtrl = require('./remoteReqControl');
var os = require("os");

var softwareEnCtrl = function () {
    
};
softwareEnCtrl.__proto__ = ControlBase;
module.exports = softwareEnCtrl;
softwareEnCtrl.model = sweModel;

//得到所有原始数据
softwareEnCtrl.getAllA = function (callback) {
    sweModel.getByWhere({},function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            return callback(JSON.stringify({status:1,enviro:data}));
        }
    })
};

//将原始数据装换为树状结构
softwareEnCtrl.getAllB = function (callback) {
    sweModel.all2TableTree(function (err, data) {
        if(err){
            callback(JSON.stringify({status:0})) ;
        }
        else{
            callback(JSON.stringify({status:1,enviro:data}));
        }
    });
};

softwareEnCtrl.deleteItem = function (id,callback) {
    softwareEnCtrl.delete(id,function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            return callback(JSON.stringify({status:1}))
        }
    })
};

//根据swe的name alias version platform查重
softwareEnCtrl.isRepeated = function (swe, callback) {

};

//更新前也做 查重 检测？
softwareEnCtrl.updateItem = function (item,callback) {
    sweModel.getByOID(item._id,function (err, swe) {
        if(err){
            callback(JSON.stringify({status:0}));
        }
        else{
            if(item.type == 'field'){
                var tmp = swe;
                for(var i=0;i<item.keys.length-1;i++){
                    tmp = tmp[item.keys[i]];
                }
                tmp[item.keys[item.keys.length-1]] = item.value;
            }
            else if(item.type == 'array'){
                var index = item.aliasId;
                swe.alias.splice(index,1);
            }
            //查重检测
            sweModel.getByWhere({},function (err, data) {
                if(err){
                    return callback(JSON.stringify({status:0}));
                }
                else{

                }
            });
            sweModel.update(swe,function (err, data) {
                if(err){
                    return callback(JSON.stringify({status:0}));
                }
                else{
                    return callback(JSON.stringify({status:1,_id:swe._id}));
                }
            })
        }
    })
};

softwareEnCtrl.addItem = function (item, callback) {
    var name = item.name.trim();
    item.name = name.replace(/\s+/g,' ');
    //添加时别名只能为空，添加完item才能编辑别名
    item.alias = [];
    softwareEnCtrl.hasInserted(item,function (err, rst) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            if(rst.hasInserted){
                return callback(JSON.stringify({status:2,_id:rst.insertedItem._id}));
            }
            else{
                softwareEnCtrl.save(item,function (err, data) {
                    if(err){
                        return callback(JSON.stringify({status:0}));
                    }
                    else{
                        return callback(JSON.stringify({status:1,_id:data._doc._id}));
                    }
                })
            }
        }
    });
    
};

softwareEnCtrl.autoDetect = function (callback) {
    sysCtrl.autoDetectSW(function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0})) ;
        }
        else{
            sweModel.items2TableTree(data,function (err, data) {
                if(err){
                    return callback(JSON.stringify({status:0})) ;
                }
                else{
                    return callback(JSON.stringify({status:1,enviro:data}));
                }
            });
        }
    })
};

//返回添加成功和已经存在的id
softwareEnCtrl.addByAuto = function (itemsID,callback) {
    sysCtrl.readAllSW(function (err, items) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            var items2add = [];
            for(var i=0;i<itemsID.length;i++){
                for(var j=0;j<items.length;j++){
                    if(items[j]._id == itemsID[i]){
                        //添加替换操作系统信息表达式
                        var pattern = /OS/i;
                        var item = items[j];
                        if(pattern.test(item.type)){
                            item.name = 'Operating System';
                            item.alias = [];
                            item.platform = os.arch();
                            let version = item.version;
                            item.version = 'win ' + version.split('.')[0];
                            items2add.push(item);
                            break;
                        }else{
                            var name = item.name.trim();
                            item.name = name.replace(/\s+/g,' ');
                            item.alias = [];
                            //判断软件位数，利用正则表达式
                            var patt64 = /^.*64.{1}bit.*/i;
                            var patt86 = /^.*32.{1}bit.*/i;
                            item.platform = (item.name.indexOf('x64')!=-1 || patt64.test(item.name))? 'x64':((item.name.indexOf('x86')!=-1 || patt86.test(item.name)?'x86':''));
                            // item.platform = item.name.indexOf('x64')!=-1?'x64':(item.name.indexOf('x86')!=-1?'x86':'');
                            items2add.push(item);
                            break;
                        }
                    }
                }
            }
            
            var newInsertedItems = [];
            var hasInsertedItems = [];
            var sortForInsertedItems = function(insertItems){
                var sortInsertedItems = [];
                for(var i = 0 ; i < insertItems.length;i++){
                    var item = {
                        title: '',
                        id: '',
                        type: '',
                        children: []
                    };
                    item.title = insertItems[i].title;
                    item.id = insertItems[i].id;
                    item.type = insertItems[i].type;
                    if(insertItems[i].children.length > 0){
                       var item_children = insertItems[i].children;
                       var temp = [];
                       for(let j = item_children.length - 1; j >= 0; j--){
                          temp.push(item_children[j]);
                       }
                       item.children = temp;
                    }    
                    sortInsertedItems.push(item);
                }
                return sortInsertedItems;
            };
            var addByRecursion = function (index) {
                delete items2add[index]._id;
                softwareEnCtrl.hasInserted(items2add[index],function (err,rst) {
                    if(err){
                        return callback(JSON.stringify({status:0}));
                    }
                    else{
                        if(rst.hasInserted){
                            hasInsertedItems.push(rst.insertedItem._id);
                            if(index<items2add.length-1){
                                addByRecursion(index+1);
                            }
                            else{
                                sweModel.items2TableTree(newInsertedItems,function (err, newInsertedItems) {
                                    if(err){
                                        callback(JSON.stringify({status:0}));
                                    }
                                    else{
                                        return callback(JSON.stringify({status:1,newInsertedItems:newInsertedItems,hasInsertedItems:hasInsertedItems}));
                                    }
                                });
                            }
                        }
                        else{
                            sweModel.save(items2add[index],function (err, data) {
                                if(err){
                                    callback(JSON.stringify({status:0}));
                                }
                                else{
                                    newInsertedItems.push(data);
                                    if(index<items2add.length-1){
                                        addByRecursion(index+1);
                                    }
                                    else{
                                        sweModel.items2TableTree(newInsertedItems,function (err, newInsertedItems) {
                                            if(err){
                                                callback(JSON.stringify({status:0}));
                                            }
                                            else{
                                                //新增函数，为了使自动添加的时候软件信息能够正常显示
                                                var sortItems = sortForInsertedItems(newInsertedItems);
                                                return callback(JSON.stringify({status:1,newInsertedItems:sortItems,hasInsertedItems:hasInsertedItems}));
                                            }
                                        });
                                    }
                                }
                            })
                        }
                    }
                });
            };
            if(items2add.length!=0)
                addByRecursion(0);
            else
                return callback(JSON.stringify({status:1,insertedItems:[]}));
        }
    })
};

//根据name和version匹配
//回调函数第二个参数：{ hasInserted:Bool;_id:String}
softwareEnCtrl.hasInserted = function (item, callback) {
    sweModel.getByWhere({},function (err,swes) {
        if (err) {
            return callback(err);
        }
        else {
            var index = -1;
            var insertName = item.name;
            for (var i = 0; i < swes.length; i++) {
                index = -1;
                if (insertName.toLowerCase() == swes[i].name.toLowerCase()) {
                    index = i;
                }
                else{
                    for (var j = 0; j < swes[i].alias.length; j++) {
                        if (insertName.toLowerCase() == swes[i].alias[j].toLowerCase()) {
                            index = i;
                            break;
                        }
                    }
                }
                if (index!=-1){
                    var versionEQ = versionCtrl.versionMatch(item.version,'eq',swes[index].version);
                    if(versionEQ == true){
                        return callback(null,{hasInserted:true,insertedItem:swes[index]});
                    }
                }
            }
            return callback(null,{hasInserted:false});
        }
    })
};

//判断环境是否匹配
//返回 status unSatisfiedList
softwareEnCtrl.ensMatched = function (demands,callback) {
    sweModel.getByWhere({},function (err, swes) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else {
            var unSatisfiedList = [];
            for(var i=0;i<demands.length;i++){
                var name = demands[i].name.trim();
                name = name.replace(/\s+/g,' ').toLowerCase();
                var isSatisfied = false;
                var detail = {};
                for(var j=0;j<swes.length;j++){
                    var index = -1;
                    if(swes[j].name.toLowerCase() == name){
                        if(demands[i].platform &&　demands[i].platform != '')
                            index = j;
                    }
                    else{
                        for(var k=0;k<swes[j].alias.length;k++){
                            if(swes[j].alias[k].toLowerCase() == name){
                                index = j;
                                break;
                            }
                        }
                    }
                    
                    if(index != -1){
                        detail.name = true;
                        //判断版本和平台
                        if(demands[i].platform &&　demands[i].platform != '') {
                            detail.platform = swes[index].platform.toLowerCase() == demands[i].platform.toLowerCase();
                        }
                        else{
                            detail.platform = true;
                        }
                        var rangeRst = versionCtrl.rangeMatch(swes[j].version, demands[i].version);
                        detail.valid = rangeRst.isValidRange;
                        detail.version = rangeRst.isSatisfied;
                        if(rangeRst.isSatisfied)
                            break;
                    }
                }
                demands[i].detail = detail;
                if(detail.name && detail.version && detail.platform && detail.valid){

                }
                else{
                    unSatisfiedList.push(demands[i]);
                }
                // if(!isSatisfied){
                //     if(versionCtrl.rangeValid(demands[i].version).isValid){
                //         demands[i].detail = {};
                //         demands[i].detail.isValidRange = true;
                //         demands[i].detail.isSatisfied = false;
                //     }
                //     else{
                //         demands[i].detail = {};
                //         demands[i].detail.isValidRange = false;
                //         demands[i].detail.isSatisfied = true;
                //     }
                //     unSatisfiedList.push(demands[i]);
                // }
            }
            return callback(JSON.stringify({status:1,unSatisfiedList:unSatisfiedList}));
        }
    })
};

softwareEnCtrl.enMatched = function (demand, cb) {
    sweModel.getByWhere({},function (err, swes) {
        if(err){
            return cb(err);
        }
        else {
            // var query = {
            //     $text:{
            //         //查找 demand.name 或者 demand.platform存在的记录
            //         $search:demand.name + ' ' + demand.platform
            //         // $caseSensitive:false
            //     }
            // };
            // softwareEnCtrl.getByTextSearch(query,function (err, data) {
            //     if(err){
            //         return cb(err);
            //     }
            //     else{
            //         //TODO 对模糊查询到的结果进行版本匹配
            //
            //         return cb(null,data);
            //     }
            // })

            //nedb不支持 $text, 因此改成模糊查询进行查找
            var query = { $or: [{ name: demand.name }, { platform: demand.platform }] }
            softwareEnCtrl.getByWhere(query, function (err, data) {
                if(err){
                    return cb(err);
                }
                else{
                    //TODO 对模糊查询到的结果进行版本匹配

                    return cb(null,data);
                }
            });
        }
    })
};

softwareEnCtrl.getMatchTabledata = function (pid, place, cb) {
    modelserCtrl.getRuntimeByPid(pid,place,function (err, demands) {
        if(err){
            return cb(err);
        }
        else{
            demands = demands.swe;
            var count = 0;
            var matchedList = [];
            if(demands.length){
                var pending = function (index) {
                    count++;
                    return function (err, matchedItems) {
                        count--;
                        if(err){
                            console.log(err);
                        }
                        else{
                            modelBase.items2TableTree(matchedItems,function (err, matchedItems) {
                                matchedList[index] = matchedItems;
                            });
                        }
                        if(count == 0){
                            modelBase.items2TableTree(demands,function (err, demands) {
                                for(var i=0;i<demands.length;i++){
                                    demands[i].matched = matchedList[i];
                                    demands[i].result = '未知';
                                }
                                cb(null,demands);
                            });
                        }
                    }
                };
                for(var i=0;i<demands.length;i++){
                    demands[i].alias = [];
                    demands[i].publisher = '';
                    demands[i].type = '';
                    demands[i].result = '';
                    softwareEnCtrl.enMatched(demands[i],pending(i));
                }
            }
            else{
                cb(null,[]);
            }
        }
    })
};

softwareEnCtrl.getMatchTabledataFromServer = function(pid, sourceId, place, cb){
    var url = 'http://' + sourceId + '/modelser/mdlRuntime/' + pid + '?place=' + place;
    remoteReqCtrl.getRequestJSON(url,function(err,data){
        if(err){
            return cb(err);
        }
        var demands = data.tabledata.swe;
        var count = 0;
        var matchedList = [];
        if(demands.length){
            var pending = function (index) {
                count++;
                return function (err, matchedItems) {
                    count--;
                    if(err){
                        console.log(err);
                    }
                    else{
                        modelBase.items2TableTree(matchedItems,function (err, matchedItems) {
                            matchedList[index] = matchedItems;
                        });
                    }
                    if(count == 0){
                        modelBase.items2TableTree(demands,function (err, demands) {
                            for(var i=0;i<demands.length;i++){
                                demands[i].matched = matchedList[i];
                                demands[i].result = '未知';
                            }
                            cb(null,demands);
                        });
                    }
                }
            };
            for(var i=0;i<demands.length;i++){
                demands[i].alias = [];
                demands[i].publisher = '';
                demands[i].type = '';
                demands[i].result = '';
                softwareEnCtrl.enMatched(demands[i],pending(i));
            }
        }
        else{
            cb(null,[]);
        }
    })
}

softwareEnCtrl.addBySelect = function (itemsID, callback) {

};

//获取所有的软件信息，将信息组织成特定的格式返回至门户
softwareEnCtrl.getAllDataToPortal = function(callback){
    sweModel.getByWhere({},function (err, data) {
        if(err){
            return callback(err);
        }
        else{
            let result = [];
            for(let i = 0; i < data.length; i++){
                let template = {
                    name:'',
                    version:'',
                    publisher:''
                };
                template.name = data[i].name;
                template.version = data[i].version;
                if(data[i].publisher === ''){
                    template.publisher = 'Unknown';
                }else{
                    template.publisher = data[i].publisher;
                }
                result.push(template);
            }
            return callback(null,result);
        }
    })
};

// softwareEnCtrl.updateItem = function (srcItem, newItem, callback) {
//     // var hasAlias = false;
//     // for(var i=0;i<newItem.alias.length;i++){
//     //     for(var j=0;j<srcItem.alias.length;i++){
//     //         if(srcItem.alias[j] == newItem.alias[i]){
//     //             hasAlias = true;
//     //             break;
//     //         }
//     //     }
//     //     if(srcItem.name == newItem.alias[i])
//     //         hasAlias = true;
//     //     if(!hasAlias)
//     //         srcItem.alias.push(newItem.alias[i]);
//     // }
//     // hasAlias = false;
//     // for(var k=0;k<srcItem.alias.length;k++){
//     //     if(newItem.name == srcItem.alias[k]){
//     //         hasAlias = true;
//     //         break;
//     //     }
//     // }
//     // if(newItem.name == srcItem.name)
//     //     hasAlias = true;
//     // if(!hasAlias)
//     //     srcItem.alias.push(newItem.name);
//     sweModel.update(srcItem,function (err, data) {
//         if(err){
//             callback(err);
//         }
//         else{
//             callback(null,data);
//         }
//     })
// };