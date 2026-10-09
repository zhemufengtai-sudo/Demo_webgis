/**
 * Created by Administrator on 4.21.
 */
// var hweModel = require('../model/hardwareEnviro');
// var hweModel = require('../model/hardwareEnviro_n');
var hweModel = require('../model/dbSwitcher').hardwareEnviro;
var ControlBase = require('./controlBase');
var sysCtrl = require('../control/sysControl');
var convert = require('convert-units');
var modelserCtrl = require('./modelSerControl');
var modelBase = require('../model/modelBase');
var remoteReqCtrl = require('./remoteReqControl');

var hardwareEnCtrl = function () {

};
hardwareEnCtrl.__proto__ = ControlBase;
module.exports = hardwareEnCtrl;
hardwareEnCtrl.model = hweModel;

hardwareEnCtrl.autoDetect = function (callback) {
    sysCtrl.autoDetectHW(function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0})) ;
        }
        else{
            hweModel.items2TableTree(data,function (err, data) {
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

hardwareEnCtrl.getAllA = function (callback) {
    hweModel.getByWhere({},function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            return callback(JSON.stringify({status:1,enviro:data}));
        }
    })
};

hardwareEnCtrl.getAllB = function (callback) {
    hweModel.all2TableTree(function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0})) ;
        }
        else{
            return callback(JSON.stringify({status:1,enviro:data}));
        }
    });
};

hardwareEnCtrl.updateItem = function (item,callback) {
    hweModel.getByOID(item._id,function (err, hwe) {
        if(err){
            callback(JSON.stringify({status:0}));
        }
        else{
            if(item.type == 'field'){
                var tmp = hwe;
                for(var i=0;i<item.keys.length-1;i++){
                    tmp = tmp[item.keys[i]];
                }
                tmp[item.keys[item.keys.length-1]] = item.value;
            }
            else if(item.type == 'array'){
                var index = item.aliasId;
                hwe.alias.splice(index,1);
            }
            hweModel.update(hwe,function (err, data) {
                if(err){
                    callback(JSON.stringify({status:0}));
                }
                else{
                    callback(JSON.stringify({status:1,_id:hwe._id}));
                }
            })
        }
    })
};

hardwareEnCtrl.addItem = function (item,callback) {
    var name = item.name.trim();
    item.name = name.replace(/\s+/g,' ');
    hardwareEnCtrl.hasInserted(item,function (err, rst) {
        if(err){
            console.log(err);
            return callback(JSON.stringify({status:0}));
        }
        else{
            if(rst.hasInserted){
                return callback(JSON.stringify({status:2,_id:rst.insertedItem._id}));
            }
            else{
                hardwareEnCtrl.save(item,function (err, data) {
                    if(err){
                        return callback(JSON.stringify({status:0}));
                    }
                    else{
                        return callback(JSON.stringify({status:1,_id:data._doc._id}));
                    }
                })
            }
        }
    })
};

hardwareEnCtrl.deleteItem = function (id,callback) {
    hardwareEnCtrl.delete(id,function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            return callback(JSON.stringify({status:1}))
        }
    })
};

hardwareEnCtrl.addByAuto = function (itemsID,callback) {
    sysCtrl.readAllHW(function (err, items) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            var items2add = [];
            for(var i=0;i<itemsID.length;i++){
                for(var j=0;j<items.length;j++){
                    if(items[j]._id == itemsID[i]){
                        var item = items[j];
                        var name = item.name.trim();
                        item.name = name.replace(/\s+/g,' ');
                        items2add.push(items[j]);
                        break;
                    }
                }
            }
            
            var newInsertedItems = [];
            var hasInsertedItems = [];
            var sortForInsertedItems = function(insertItems){
                //TO DO
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
                hardwareEnCtrl.hasInserted(items2add[index],function (err, rst) {
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
                                hweModel.items2TableTree(newInsertedItems,function (err, newInsertedItems) {
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
                            hweModel.save(items2add[index],function (err, data) {
                                if(err){
                                    return callback(JSON.stringify({status:0}));
                                }
                                else{
                                    //newInsertedItems.push(data._doc);
                                    newInsertedItems.push(data);
                                    if(index<items2add.length-1){
                                        addByRecursion(index+1);
                                    }
                                    else{
                                        hweModel.items2TableTree(newInsertedItems,function (err, newInsertedItems) {
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
                            });
                        }
                    }
                })
            };
            if(items2add.length!=0)
                addByRecursion(0);
            else
                return callback(JSON.stringify({status:1,insertedItems:[]}));
        }
    })
};

hardwareEnCtrl.addBySelect = function (itemsID, callback) {

};

hardwareEnCtrl.hasInserted = function (item, callback) {
    hardwareEnCtrl.getByWhere({},function (err, hwes) {
        if(err){
            return callback(err);
        }
        else{
            for(var i=0;i<hwes.length;i++){
                if(hwes[i].name.toLowerCase() == item.name.toLowerCase()){
                    return callback(null,{hasInserted:true,insertedItem:hwes[i]});
                }
            }
            return callback(null,{hasInserted:false});
        }
    })
};

hardwareEnCtrl.ensMatched = function (demands, callback) {
    hweModel.getByWhere({},function (err, hwes) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else {
            var unSatisfiedList = [];
            for(var i=0;i<demands.length;i++){
                var index = -1;
                for(var j=0;j<hwes.length;j++){
                    var demandName = demands[i].name;
                    demandName = demandName.replace(/\s+/g,' ');
                    demandName = demandName.trim();
                    if(demandName.toLowerCase() == hwes[j].name){
                        index = j;
                        break;
                    }
                }
                var matchRst = hardwareEnCtrl.rangeMatch(hwes[j].value,demands[i].value);
                demands[i].detail = {
                    name:index!=-1,
                    value:matchRst.isSatisfied,
                    valid:matchRst.isValidRange
                };
                if(!matchRst.isValidRange || !matchRst.isSatisfied){
                    unSatisfiedList.push(demands[i]);
                }
            }
            return callback(JSON.stringify({status:1,unSatisfiedList:unSatisfiedList}));
        }
    });
};

hardwareEnCtrl.enMatched = function (demand, cb) {
    hweModel.getByWhere({},function (err, hwes) {
        if(err){
            return cb(err);
        }
        else {
            // var query = {
            //     $text:{
            //         $search:demand.name
            //     }
            // };
            // hardwareEnCtrl.getByTextSearch(query,function (err, data) {
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
            var query = {name: demand.name}
            hardwareEnCtrl.getByWhere(query, function (err, data) {
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

hardwareEnCtrl.getMatchTabledata = function (pid, place, cb) {
    modelserCtrl.getRuntimeByPid(pid,place,function (err, demands) {
        if(err){
            return cb(err);
        }
        else{
            demands = demands.hwe;
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
                    demands[i].result = '';
                    hardwareEnCtrl.enMatched(demands[i],pending(i));
                }
            }
            else{
                cb(null,[]);
            }
        }
    });
};

hardwareEnCtrl.getMatchTabledataFromServer = function(pid, sourceId, place, cb){
    var url = 'http://' + sourceId + '/modelser/mdlRuntime/' + pid + '?place=' + place;
    remoteReqCtrl.getRequestJSON(url,function(err,data){
        if(err){
            return cb(err);
        }
        var demands = data.tabledata.hwe;
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
                demands[i].result = '';
                hardwareEnCtrl.enMatched(demands[i],pending(i));
            }
        }
        else{
            cb(null,[]);
        }
    });
};

//region 硬件的环境匹配
//只支持数字形式的比较
//支持的比较符有：区间 * ！
//v1表示是原有的，v2表示是需求

hardwareEnCtrl.rangeMatch = function (value, range) {
    var satisfiesRst = {};
    var validRst = hardwareEnCtrl.rangeValid(range);
    if(validRst.isValid){
        satisfiesRst.isValidRange = true;
        for(var i=0;i<validRst.childRanges.length;i++){
            var partRst = hardwareEnCtrl.rangeMatchBase(value,validRst.childRanges[i]);
            range = range.replace(validRst.childRanges[i],partRst);
        }
        // 将逻辑表达式的str转换为逻辑表达式
        var isSatisfied = eval(range);
        satisfiesRst.isSatisfied = isSatisfied;
        if(isSatisfied){

        }
        else{
            //TODO 具体指明哪里不满足

        }
    }
    else{
        satisfiesRst.isValidRange = false;
    }
    return satisfiesRst;
};

hardwareEnCtrl.rangeMatchBase = function (value, range) {
    var group = [];
    if(range.trim() == '*')
        return true;
    else if(group = range.match(/\s*!\s*((\.?\w+\.?\s*)+)\s*/)){
        return hardwareEnCtrl.valueMatch(group[2],'ne',value);
    }
    else if(group = range.match(/\s*\(\s*((\.?\w+\.?\s*)+)\s*,\s*((\.?\w+\.?\s*)+)\s*\)\s*/)){
        var min = group[1];
        var max = group[3];
        return hardwareEnCtrl.valueMatch(min,'lt',value) && hardwareEnCtrl.valueMatch(max,'gt',value)
    }
    else if(group = range.match(/\s*\[\s*((\.?\w+\.?\s*)+)\s*,\s*((\.?\w+\.?\s*)+)\s*\]\s*/)){
        var min = group[1];
        var max = group[3];
        return hardwareEnCtrl.valueMatch(min,'lte',value) && hardwareEnCtrl.valueMatch(max,'gte',value)
    }
    else if(group = range.match(/\s*\[\s*((\.?\w+\.?\s*)+)\s*,\s*((\.?\w+\.?\s*)+)\s*\)\s*/)){
        var min = group[1];
        var max = group[3];
        return hardwareEnCtrl.valueMatch(min,'lte',value) && hardwareEnCtrl.valueMatch(max,'gt',value)
    }
    else if(group = range.match(/\s*\(\s*((\.?\w+\.?\s*)+)\s*,\s*((\.?\w+\.?\s*)+)\s*\]\s*/)){
        var min = group[1];
        var max = group[3];
        return hardwareEnCtrl.valueMatch(min,'lt',value) && hardwareEnCtrl.valueMatch(max,'gte',value)
    }
    else if(group = range.match(/\s*(\.?\w+\.?\s*)+\s*/)){
        return hardwareEnCtrl.valueMatch(group[0],'eq',value);
    }
    else
        return false;
};

hardwareEnCtrl.valueMatch = function (v1,comparator,v2) {
    v1 = v1.trim();
    v2 = v2.trim();
    v1 = v1.replace(/\s+/g,' ');
    v2 = v2.replace(/\s+/g,' ');
    if(v1 == '0'){
        if(comparator == 'lt' || comparator == 'lte')
            return true;
    }
    else if(v1 == 'infinite'){
        if(comparator == 'gt' || comparator == 'gte')
            return true;
    }

    var value1 = parseFloat(v1);
    var value2 = parseFloat(v2);
    if(isNaN(value1) || isNaN(value2))
        return false;

    // 对单位的处理
    var unit1 = v1.substr(value1.toString().length).trim().toUpperCase();
    var unit2 = v2.substr(value2.toString().length).trim().toUpperCase();

    if(unit1){
        if(!unit2)
            return false;
        else{
            if( unit1 == 'B' || unit1 == 'KB' || unit1 == 'MB' ||　unit1 == 'GB' || unit1 == 'TB'){
                if(unit1 != unit2)
                    value1 = convert(value1).from(unit1).to(unit2);
            }
            else if(unit1.indexOf('HZ') != -1 && unit2.indexOf('HZ') != -1){
                switch (unit1){
                    case 'KHZ':
                        value1 *= 1000;
                        break;
                    case 'MHZ':
                        value1 *= 1000000;
                        break;
                    case 'GHZ':
                        value1 *= 1000000000;
                        break;
                    case 'THZ':
                        value1 *= 1000000000000;
                        break;
                }
                switch (unit2){
                    case 'KHZ':
                        value2 *= 1000;
                        break;
                    case 'MHZ':
                        value2 *= 1000000;
                        break;
                    case 'GHZ':
                        value2 *= 1000000000;
                        break;
                    case 'THZ':
                        value2 *= 1000000000000;
                        break;
                }
            }
        }
    }

    switch(comparator){
        case 'eq':
            return value1 == value2;
        case 'ne':
            return value1 != value2;
        case 'gt':
            return value1 > value2;
        case 'lt':
            return value1 < value2;
        case 'gte':
            return value1 >= value2;
        case 'lte':
            return value1 <= value2;
    }
};

hardwareEnCtrl.rangeValid = function (range) {
    var rst = {
        isValid : false,
        childRanges : []
    };
    var childRanges = [];


    // var regObj = new RegExp(/\s*((\.?\w+\.?\s*)+)\s*|\s*\*\s*|\s*!\s*((\.?\w+\.?\s*)+)\s*|\s*\(\s*((\.?\w+\.?\s*)+)\s*,\s*((\.?\w+\.?\s*)+)\s*\)\s*|\s*\[\s*((\.?\w+\.?\s*)+)\s*,\s*((\.?\w+\.?\s*)+)\s*\]\s*|\s*\[\s*((\.?\w+\.?\s*)+)\s*,\s*((\.?\w+\.?\s*)+)\s*\)\s*|\s*\(\s*((\.?\w+\.?\s*)+)\s*,\s*((\.?\w+\.?\s*)+)\s*\]\s*/g);
    var regObj = new RegExp(/\s*\*\s*|\s*\!?\s*((\.?\w+\.?\s*)+)\s*|\s*(\(|\[)\s*\s*\!?\s*((\.?\w+\.?\s*)+)\s*\s*,\s*\s*\!?\s*((\.?\w+\.?\s*)+)\s*\s*(\)|\])\s*/g);
    var group = [];
    while (group = regObj.exec(range)){
        childRanges.push(group[0]);
    }
    for(var i=0;i<childRanges.length;i++){
        range = range.replace(childRanges[i],true);
    }
    try {
        range = eval(range);
        rst.isValid = true;
        rst.childRanges = childRanges;
    }
    catch(e){
        rst.isValid = false;
    }
    return rst;
};
//endregion