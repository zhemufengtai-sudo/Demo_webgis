// var ModelSerRun = require('../model/modelSerRun');
// var ModelSerRun = require('../model/modelSerRun_n');
var ModelSerRun = require('../model/dbSwitcher').modelSerRun;
// var ModelSer = require('../model/modelService');
// var ModelSer = require('../model/modelService_n');
var ModelSer = require('../model/dbSwitcher').modelService;
var CommonMethod = require('../utils/commonMethod');
var controlBase = require('./controlBase');
var request = require('request');
var GeoDataCtrl = require('./geoDataControl');
var setting = require('../setting');
var fs = require('graceful-fs');

function ModelSerRunCtrl()
{}

ModelSerRunCtrl.__proto__ = controlBase;
module.exports = ModelSerRunCtrl;
ModelSerRunCtrl.model = ModelSerRun;

//新增模型运行记录
ModelSerRunCtrl.addItem = function (msr, callback) {
    var newmsr = new ModelSerRun(msr);
    ModelSerRun.save(newmsr, function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//根据OID查询模型运行记录
ModelSerRunCtrl.getByOID = function (oid, callback) {
    ModelSerRun.getByOID(oid, function (err, item) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, item);
    });
};

//根据GUID查询模型运行记录信息
ModelSerRunCtrl.getByGUID = function (guid, callback) {
    ModelSerRun.getByGUID(guid, function (err, item) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, item);
    });
};

//根据MSID查询模型运行记录
ModelSerRunCtrl.getByMSID = function (msid, callback) {
    ModelSerRun.getByMsId(msid, function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//得到全部模型运行记录
ModelSerRunCtrl.getAll = function (callback) {
    ModelSerRun.getAll(function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//更新模型运行记录信息
ModelSerRunCtrl.update = function (msr, callback) {
    ModelSerRun.update(msr, function (err, data) {
       if(err)
       {
           return callback(err);
       }
       return callback(null, data);
    });
};

//删除模型记录
ModelSerRunCtrl.delete = function (oid, callback) {
    ModelSerRun.delete(oid, this.returnFunction(callback, 'Error in deleting model service record!'))
}

//更新模型运行记录日志信息
ModelSerRunCtrl.updateLog = function (msr, msr_log, callback) {
    ModelSerRun.updateLog(msr, msr_log, function (err, data) {
       if(err)
       {
           return callback(err);
       }
       return callback(null, data);
    });
};

//判断数据是否需要销毁
ModelSerRunCtrl.IsOutputData2BDestroyed = function(DataId, callback){
    ModelSerRun.getByOutputDataID(DataId, function(err, data){
        if(err){
            return callback(err);
        }
        if(!data){
            return callback(null, false);
        }
        if(data.Destroyed){
            return callback(null, true);
        }
        return callback(null, false);
    });
}

//统计模型运行记录信息
ModelSerRunCtrl.getStatisticInfoRecent = function(msid, days, callback){
    var date = [];
    days = parseInt(days);
    if(days < 1){
        return callback(new Error('Days is illegal'));
    }
    for(var i = 0; i < (days + 1); i++){
        date.push(CommonMethod.getStartDate(i - (days - 1)));
    }
    var statisticInfo = {
        data : [],
        ticks : [],
    };
    var count = 0;
    var pending = (function(index){
        count ++;
        return function(err, data){
            count--;
            if(err){
                return console.log('Error in getting statistic info of msr!')
            }
            else{
                statisticInfo.data[index][1] = data.length;
            }
            if(count == 0){
                return callback(null, statisticInfo);
            }
        }
    });
    for(var i = 0; i < date.length - 1; i++){
        ModelSerRun.getStatisticInfoByDate(msid, date[i], date[i + 1], pending(i));
        if(date.length > 40){
            if(i%5 == 0){
                statisticInfo.ticks.push([i, CommonMethod.getMonthWord(date[i].getMonth()) + ' ' + date[i].getDate()]);
            }
        }
        else{
            statisticInfo.ticks.push([i, CommonMethod.getMonthWord(date[i].getMonth()) + ' ' + date[i].getDate()]);
        }
        statisticInfo.data.push([i, 0]);
    }
}

//统计模型运行记录信息
ModelSerRunCtrl.getTimesStatisticInfo = function(callback){
    ModelSerRun.getTimesStatisticInfoByMSID(function(err, data){
        if(err){
            return callback(err);
        }
        if(data.length == 0){
            return callback(null, []);
        }
        var count = 0
        var allcount = 0;
        var pending = (function(index){
            count ++;
            return function(err, ms){
                count --;
                if(err || ms == null){
                    data[index].label = 'Others';
                }
                else{
                    data[index].label = ms.ms_model.m_name;
                }
                data[index].data = data[index].count*100/allcount;
                if(count == 0){
                    return callback(null, data);
                }
            }
        });
        data.sort(function(a, b){
            return b.count - a.count;
        });
        if(data.length > 4){
            var otherCount = 0;
            for(var i = 4; i < data.length; i++){
                otherCount =  data[4].count + data[i].count;
            }
            data[4].length = otherCount;
            data[4]._id.ms_id = null;
            for(var i = 0; i < 5; i++){
                ModelSer.getByOID(data[i]._id.ms_id, pending(i));
                allcount = allcount + data[i].count;
            }
        }
        else{
            for(var i = 0; i < data.length; i++){
                ModelSer.getByOID(data[i]._id.ms_id, pending(i));
                allcount = allcount + data[i].count;
            }
        }
    });
}

//根据oid获取模型运行记录output中process_data信息
ModelSerRunCtrl.getProcessDataByOID = function(oid,callback){
    ModelSerRun.getByOID(oid,function(err,item){
        if(err){
            return callback(err,null);
        }
        if(item == null){
            var message = {
                err: 'ModelSerRunRecord is null'
            };
            return callback(JSON.parse(message),null);
        }
        var msr_output = item.msr_output;
        //存入数据gdid和数据名称
        var processDataContent = [];
        var ext = '';

        for(var i = 0; i < msr_output.length; i++){
            var outputdata = msr_output[i];
            if(outputdata.TimeData.length == 0){
                continue;
            }else{
                var timeData = outputdata.TimeData;
                ext = timeData[0].name.substr(timeData[0].name.lastIndexOf('.') + 1);
                for(var j = 0; j < timeData.length; j++){
                    var datapath = timeData[j].dataId;
                    processDataContent.push({
                        name: timeData[j].name,
                        path: datapath
                    });
                }

                //后面添加最终结果数据

                var tagname = outputdata.Tag + '.' + ext;
                var finaldataid = outputdata.DataId;
                processDataContent.push({
                      name: tagname,
                      path: finaldataid
                });
            }

        }

        return callback(null,processDataContent);


    })
}

//等待模型运行结束
ModelSerRunCtrl.wait4Finished = function (msrid, taskserver, dataexserver, taskid, callback) {
    var polling = setInterval(() => {
        var msr = ModelSerRunCtrl.getByOID(msrid, function (err, msr) {
            if(err){
                //! TODO 错误累计
                return;
            }
            if(msr.msr_status != 0){
                request.post('http://' + taskserver.host + ':' + taskserver.port + '/task/' + taskid, {}, function (err, data) {
                    
                });
                clearInterval(polling);
            }
        });
    }, 1000);
}

//上传模型输出结果至特定的数据存储服务器
ModelSerRunCtrl.uploadOutputToServer = function(msrid, ip, port,userName,callback){
    ModelSerRun.getByOID(msrid,function(err,msr){
        if(err){
            return callback(err);
        }
        //if no records
        if(msr == null){
            var message = {
                err: 'no this model run record!'
            };
            return callback(message);
        }

        //output return
        var outputs = [];

        var msr_output = msr.msr_output;
        var size = msr_output.length;
        var count = 0;
        var dataStoreServer = ip + ":" + port;

        var pending = function(index){
            count++;
            return function(err, result){
                count--;
                if(err){
                    return callback(err);
                }
                if(result){
                    outputs.push({
                        "StateName": msr_output[index].StateName,
                        "Event" : msr_output[index].Event,
                        "Url" : result,
                        "Tag" : msr_output[index].Tag
                    });
                }else{
                    outputs.push({
                        "StateName": msr_output[index].StateName,
                        "Event" : msr_output[index].Event,
                        "Url" : '',
                        "Tag" : msr_output[index].Tag
                    });
                }

                if(count == 0){
                    //return the result
                    return callback(null, outputs);
                }

            }
        };

        for(var i = 0; i < size; i++){
            var dataId = msr_output[i].DataId;
            ModelSerRunCtrl.uploadOutputDataToDataServer(dataId,dataStoreServer,userName,pending(i));
        }

    })
}

//! post output data to data server container by data id (老版本的数据容器)
ModelSerRunCtrl.uploadOutputData = function(dataId, dataStoreServer, callback){
    //add judge, judge the output data result is or not null
    if(dataId === '' || dataId == null){
        return callback(null, false);
    }
    GeoDataCtrl.getByKey(dataId, function(err, gd){
        if(err){
            return callback(err);
        }
        var outputPath = setting.modelpath + '/../geo_data/' + gd.gd_value;
        var ext = gd.gd_value.substr(gd.gd_value.lastIndexOf('.') + 1);
        //get fileName and file ext(fileName not include ext)
        var fileName = '';
        if(gd.gd_tag.lastIndexOf('.') == -1){
            fileName = dataId;
        }else{
            fileName = gd.gd_tag.substr(0,gd.gd_tag.lastIndexOf('.'));
        }
        //build post form
        var formData = {
            file: fs.createReadStream(outputPath)
        };
        var url = 'http://' + dataStoreServer + '/file/upload/store_dataResource_files';
        var options = {
            uri: url,
            formData: formData,
            headers:{
                'content-type': 'multipart/form-data'
            }
        };
        request.post(options, function(err, response){
            if(err){
                return callback(err);
            }
            var resJson = JSON.parse(response.body);
            if(resJson.code == 0){
                var pwd = resJson.data;
                //Splicing url
                //var dataUrl = 'http://' + dataStoreServer + '/file/download_data_resource?fileName=' + fileName + '&sourceStoreId=' + pwd + '&suffix=' + ext;
                var dataUrl = 'http://' + dataStoreServer + '/dataResource/getResource?fileName=' + fileName + '&sourceStoreId=' + pwd + '&suffix=' + ext;
                return callback(null, dataUrl);
            }else{
                return callback(null, false);
            }
        })
    })
}

ModelSerRunCtrl.uploadOutputDataToDataServer = function(dataId, dataStoreServer, userName, callback){
    //add judge, judge the output data result is or not null
    if (dataId === '' || dataId == null) {
        return callback(null, false);
    }
    GeoDataCtrl.getByKey(dataId, function (err, gd) {
        if (err) {
            return callback(err);
        }
        var outputPath = setting.dirname + '/geo_data/' + gd.gd_value;
        var ext = gd.gd_value.substr(gd.gd_value.lastIndexOf('.') + 1);
        //get fileName and file ext(fileName not include ext)
        var fileName = '';
        if (gd.gd_tag.lastIndexOf('.') == -1) {
            fileName = dataId;
        } else {
            fileName = gd.gd_tag.substr(0, gd.gd_tag.lastIndexOf('.'));
        }
        //build post form
        var formData = {
            file: fs.createReadStream(outputPath)
        };
        var url = 'http://' + dataStoreServer + '/file/upload/store_dataResource_files';
        var options = {
            uri: url,
            formData: formData,
            headers: {
                'content-type': 'multipart/form-data'
            }
        };

        request.post(options, function (err, response) {
            if (err) {
                return callback(err);
            }
            var resJson = JSON.parse(response.body);
            if (resJson.code == 0) {
                var pwd = resJson.data.source_store_id;
                //Splicing url
                var dataUrl = 'http://' + dataStoreServer + '/dataResource';
                var form = {
                    author: userName,
                    fileName: fileName,
                    sourceStoreId: pwd,
                    suffix: ext,
                    type: "OTHER",
                    fromWhere: "MODELCONTAINER"
                };

                //Post request to add data to resource
                request.post(dataUrl, { body: form, json: true }, function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    var resultJson = result.body;
                    if (resultJson.code == 0) {
                        //Splicing result url
                        var resultUrl = 'http://' + dataStoreServer + '/dataResource/getResource?sourceStoreId=' + pwd;
                        var outputResult = {
                           suffix: ext,
                           url: resultUrl
                        };
                        return callback(null, outputResult);
                    } else {
                        return callback(null, false);
                    }
                })
            } else {
                return callback(null, false);
            }
        })
    }) 
}

//! Appended by Wanhao
//! Date: 2024-11-9
//! Description: 根据msrid获取模型运行结果路径
ModelSerRunCtrl.getModelSerLogs = function (msrid, callback) {
    ModelSerRun.getByOID(msrid, function (err, msr) {
        //console.log("获取到的msr.msr_ms.ms_path:", msr.msr_ms.ms_path)
        if (err) {
            return callback(err)
        } else {
            if (!msr || msr.length == 0)
                return callback({ code: 'could not found relate model!' });
            //msr = msr[0]
            //console.log("msr.msr_ms:", msr.msr_ms);
            var path = setting.dirname + '/geo_model/' + "" + msr.msr_ms.ms_path + '/instance/' + msr.msr_guid + '/log/'+ 'modelDebug.log';
            // CommonMethod.makeupDir(mis.ms.ms_path) + 'instance\\' + guid 
            var filename = 'modelDebug.log';
            var result = {
                path: path,
                filename: filename
            };
            return callback(null, result);
        }
    })
}