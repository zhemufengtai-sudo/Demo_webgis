/**
 * Created by Administrator on 5.19.
 */
var path = require('path');

var FileOpera = require('../utils/fileOpera');
var setting = require('../setting');
var CommonMethod = require('../utils/commonMethod');
// var BatchDeployModel = require('../model/batchDeploy');
// var BatchDeployModel = require('../model/batchDeploy_n');
var BatchDeployModel = require('../model/dbSwitcher').batchDeploy;
var controlBase = require('./controlBase');
var ModelSerControl = require('./modelSerControl');
var remoteReqCtrl = require('./remoteReqControl');

function BatchDeploy() {

}

BatchDeploy.__proto__ = controlBase;
BatchDeploy.model = BatchDeployModel;
module.exports = BatchDeploy;

BatchDeploy.addBatchDeployItemsByMDL = function (ms_user, zip_path, isLocal) {
    var batch_path = path.relative(setting.modelpath,zip_path) + '\\';
    FileOpera.getAllFiles(zip_path,'.zip',function (files) {
        var addOne = function (i) {
            if(i == files.length){
                return ModelSerControl.batchDeployByMDL(batch_path, isLocal);
            }
            var batchItem = {
                batch_path:batch_path,
                zip_path:path.relative(batch_path,zip_path+files[i]),
                deployed:false,
                ms_user:ms_user
            };
            var where = {
                batch_path:batch_path,
                zip_path:path.relative(batch_path,zip_path+files[i])
            };
            BatchDeploy.getByWhere(where,function (err, data) {
                if(err){
                    return console.log(err);
                }
                else {
                    if(data.length != 0){
                        addOne(i+1);
                    }
                    else{
                        BatchDeploy.save(batchItem,function (err, data) {
                            if(err){
                                return console.log(err);
                            }
                            else{
                                addOne(i+1);
                            }
                        })
                    }
                }
            });
        };
        if(files.length != 0)
            addOne(0);
        else
            console.log('no zip to batch deploy!');
    })
};

BatchDeploy.batchDeployByMDL = function (batch_path, isLocal) {
    var where = {
        batch_path:batch_path,
        deployed:false
    };
    BatchDeploy.getByWhere(where,function (err, bds) {
        var deployOne = function (i) {
            BatchDeploy.deployOneByMDL(bds[i], isLocal, function (err) {
                if(err){
                    console.log('deploy ' + i + ' failed!');
                }
                else{
                    console.log('deploy ' + i + ' successed!');
                }
                if(i<bds.length-1)
                    deployOne(i+1);
            });
        };
        if(bds.length != 0)
            deployOne(0);
    })
};

//通过mdl部署
//流程：解压  读config  读mdl  组织modelservice  移动package文件  更新deployItem  更新modelservice中的m_id
ModelSerControl.deployOneByMDL = function (bdItem, isLocal, callback) {
    var msID = new ObjectId();
    var zip_path = path.join(setting.modelpath, bdItem.batch_path, bdItem.zip_path);
    var model_path = path.join(setting.modelpath , msID.toString()) + '\\';
    CommonMethod.Uncompress(zip_path,model_path,function () {
        var cfg_path = path.join(model_path , 'package.config');
        ModelSerControl.readCfgBypath(cfg_path,function (err,cfg) {
            if(err){
                FileOpera.rmdir(model_path);
                console.log(err);
                return callback(err);
            }
            else{
                var mdl_path = path.join(model_path , cfg.mdl);
                ModelSerControl.readMDLByPath(mdl_path,function (err, mdl) {
                    if(err){
                        FileOpera.rmdir(model_path);
                        console.log(err);
                        return callback(err);
                    }
                    else{
                        mdl = mdl.ModelClass;
                        FileOpera.getMD5(zip_path,function (err, strMD5) {
                            if(err){
                                console.log('err in get file md5!');
                                return callback(err);
                            }
                            else{
                                var ms_des = '';
                                for(var i=0;i<mdl.AttributeSet.LocalAttributes.LocalAttribute;i++){
                                    ms_des += mdl.AttributeSet.LocalAttributes.LocalAttribute[i].Abstract + '\n';
                                }
                                var msItem = {
                                    _id:msID,
                                    ms_des:ms_des,
                                    ms_user:bdItem.ms_user,
                                    ms_path:msID.toString() + '\\',
                                    ms_model:{
                                        m_name:mdl.$.name,
                                        m_type:mdl.$.type,
                                        p_id:strMD5,
                                        m_url:'',
                                        m_id:''
                                    },
                                    mv_num:'1.0',
                                    ms_status:1,
                                    ms_limited:0,
                                    ms_xml:null,
                                    testify:[],
                                    ms_img:null,
                                    ms_platform:setting.platform,
                                    ms_update:(new Date()).toLocaleString()
                                };

                                ModelSerControl.save(msItem,function (err, data) {
                                    if(err){
                                        FileOpera.rmdir(model_path);
                                        console.log(err);
                                        return callback(err);
                                    }
                                    else{
                                        if (isLocal) {
                                            bdItem.deployed = true;
                                            BatchDeploy.update(bdItem, function (err, data) {
                                                if (err) {
                                                    console.log(err);
                                                    return callback(err)
                                                }
                                                else {
                                                    //添加默认测试数据，不用异步请求，两者不相关
                                                    ModelSerControl.addDefaultTestify(msItem._id.toString());
                                                    //转移模型包
                                                    FileOpera.copyFile(zip_path, setting.modelpath + 'packages/' + msID.toString() + '.zip');
                                                    callback(null);
                                                }
                                            });
                                        }
                                        else {
                                            var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/DeploymentPackageHandleServlet?uid=' + strMD5;
                                            remoteReqCtrl.getByServer(url,{},function (err, res) {
                                                if(err){
                                                    console.log('get remote portal m_id failed!');
                                                    return callback(err);
                                                }
                                                else{
                                                    bdItem.deployed = true;
                                                    BatchDeploy.update(bdItem,function (err, data) {
                                                        if(err){
                                                            console.log(err);
                                                            return callback(err)
                                                        }
                                                        else{
                                                            //添加默认测试数据，不用异步请求，两者不相关
                                                            ModelSerControl.addDefaultTestify(msItem._id.toString());
                                                            //转移模型包
                                                            FileOpera.copyFile(zip_path, setting.modelpath + 'packages/' + msID.toString() + '.zip');
                                                            //更新m_id
                                                            msItem.ms_model.m_id = res.modelItemId;
                                                            ModelSerControl.update(msItem,function (err, data) {
                                                                if(err){
                                                                    console.log('err in update model service m_id!');
                                                                    return callback(err);
                                                                }
                                                                else{
                                                                    callback(null);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                })
            }
        })
    })
};