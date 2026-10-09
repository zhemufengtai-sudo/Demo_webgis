/**
 * Author : 7b
 * Date : 2021/6/10
 * Description : switch database (mongodb: status = 1; nedb: status = 2)
 */

const Setting = require('../setting');

let models = {};
let status = Setting.db;
if (status == 1)
    models = {
        batchDeploy:require('./batchDeploy'),
        child:require('./child'),
        geoData:require('./geoData'),
        hardwareEnviro:require('./hardwareEnviro'),
        modelSerAccess:require('./modelSerAccess'),
        modelSerRun:require('./modelSerRun'),
        modelService:require('./modelService'),
        notice:require('./notice'),
        register:require('./register'),
        softwareEnviro:require('./softwareEnviro'),
        systemSetting:require('./systemSetting'),
        visualizeService:require('./visualizeService')
    };
else if (status == 2)
    models = {
        batchDeploy:require('./batchDeploy_n'),
        child:require('./child_n'),
        geoData:require('./geoData_n'),
        hardwareEnviro:require('./hardwareEnviro_n'),
        modelSerAccess:require('./modelSerAccess_n'),
        modelSerRun:require('./modelSerRun_n'),
        modelService:require('./modelService_n'),
        notice:require('./notice_n'),
        register:require('./register_n'),
        softwareEnviro:require('./softwareEnviro_n'),
        systemSetting:require('./systemSetting_n'),
        visualizeService:require('./visualizeService_n')
    };

module.exports = models;


