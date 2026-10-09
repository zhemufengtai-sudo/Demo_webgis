/**
 * database migration , mongodb2nedb
 * Created by qingbin on 2022/3/29.
 */
// 加载模块
// const nedb = require('nedb');

// 实例化连接对象（不带参数默认为内存数据库）
// const db123 = new nedb({
//     filename: 'C:\\Users\\binbin\\AppData\\Roaming\\nvm\\v10.23.1\\mscdb\\modelservice',
//     autoload: true
// });

let loadDir = require('../load_dir');

// let ModelSerModel = require('../model/modelService_n');

let DBUtils = function () {};

module.exports = DBUtils;

let mongoCollections = [
    {filename:"batchDeploy", collection:"batchDeploy"},
    {filename:"child", collection:"child"},
    {filename:"geoData", collection:"geodata"},
    {filename:"hardwareEnviro", collection:"hardwareEnviro"},
    {filename:"modelSerAccess", collection:"modelseraccess"},
    {filename:"modelSerRun", collection:"modelserrun"},
    {filename:"modelService", collection:"modelservice"},
    {filename:"notice", collection:"notice"},
    {filename:"register", collection:"register"},
    {filename:"softwareEnviro", collection:"softwareEnviro"},
    {filename:"systemSetting", collection:"systemsetting"},
    {filename:"visualizeService", collection:"visualizeservice"}
];

let nedbCollections = [
    {filename:"batchDeploy_n", collection:"batchDeploy"},
    {filename:"child_n", collection:"child"},
    {filename:"geoData_n", collection:"geodata"},
    {filename:"hardwareEnviro_n", collection:"hardwareEnviro"},
    {filename:"modelSerAccess_n", collection:"modelseraccess"},
    {filename:"modelSerRun_n", collection:"modelserrun"},
    {filename:"modelService_n", collection:"modelservice"},
    {filename:"notice_n", collection:"notice"},
    {filename:"register_n", collection:"register"},
    {filename:"softwareEnviro_n", collection:"softwareEnviro"},
    {filename:"systemSetting_n", collection:"systemsetting"},
    {filename:"visualizeService_n", collection:"visualizeservice"}
];


// 第一次迁移数据库
DBUtils.Mongo2NedbInit = function()
{

    let model = loadDir('model');

    for (let i = 0; i < mongoCollections.length; i++) {
        let mongo = mongoCollections[i].filename;
        let nedb = nedbCollections[i].filename;

        model[mongo].getByWhere({},(err, items) => {
            if (err){
                return console.log(mongo + " find error : " + err);
            }
            // console.log(items);

            model[nedb].save(items, (err, res) => {
                if (err){
                    return console.log(mongo + " insert error : " + err);
                }
                // console.log(res);
                console.log(mongo + " migrate successfully");
            });

        })
    }

    return "Mongo2NedbInit";

}


//非第一次迁移，用上面那个会插入不进去数据，因为上面那个是一次性加入所有的
//再把已有的插入进去会报错 "it violates the unique constraint"
DBUtils.Mongo2NedbAppend = function()
{

    // db123.insert({
    //     _id: '60ed893c22b3810b34011978',
    //     name:"test"
    // }, (err, ret) => {
    //     console.log(ret);
    // });

    let model = loadDir('model');

    // let nedb1 = nedbCollections[6].filename;
    // ModelSerModel.getByOID("60ed893c22b3810b34011958", function (err, item) {
    //     console.log();
    // });

    for (let i = 0; i < mongoCollections.length; i++) {
        let mongo = mongoCollections[i].filename;
        let nedb = nedbCollections[i].filename;

        // 60ed893c22b3810b34011958
        // model[nedb].getByID({}, (err, item) => {
        //     console.log();
        // });


        model[mongo].findAll((err, items) => {
            if (err){
                return console.log(mongo + " find error : " + err);
            }
            // console.log(items);

            let itemArr = Object.values(items);
            for (let j = 0; j < itemArr.length; j++) {
                // TODO 这步进不来，不知道为什么
                model[nedb].getByID(itemArr[j]._id, (err, item) => {
                    if (err){
                        return console.log(itemArr[j]._id + " no find : " + err);
                    }

                    if (item != null){
                        return ;
                    }

                    model[nedb].save(item, (err, res) => {
                        if (err){
                            return console.log(item._id + " insert error : " + err);
                        }
                        // console.log(res);
                        // console.log(mongo + " migrate successfully");
                    });
                });

            }

        })
    }

    return "Mongo2NedbAppend";

}