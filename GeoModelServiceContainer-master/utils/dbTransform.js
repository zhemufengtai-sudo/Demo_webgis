/**
 * Author : 7b
 * Date : 2021/6/8
 * Description : Database migration
 */

let mongoose = require('mongoose');
let nedb = require('nedb');
let setting = require('../setting');
let mongoModels = require('../model/mongoModels');

// 对数据库中的表进行计数，完成一个表的迁移该数值加1，所有表都迁移完成后关闭数据库
let count = 0;
// 获取数据库中的所有表
let modelsArr = mongoose.modelNames();

for (let i = 0; i < modelsArr.length; i++) {
    mongoModels[modelsArr[i]].find({}, (err, docs) => {
        if (err)
            return console.log("find " + modelsArr[i] + ":",err);
        // 实例化连接对象
        let db = new nedb({
            filename: setting.nedb.path + modelsArr[i],
            autoload: true
        });
        docs = JSON.parse(JSON.stringify(docs));
        db.insert(docs, (err, ret) => {
            if (err)
                return console.log("insert " + modelsArr[i] + ":",err);
            console.log(modelsArr[i] + " has been migrated");
            count++;
        })
    })
}

// 监听已迁移完成的数量
let watcher = setInterval(() => {
    // console.log("count:",count);
    if (mongoose == null)
        clearInterval(watcher);
    else if (count == modelsArr.length){
        mongoose.connection.close();
        mongoose = null;
    }
},500);






