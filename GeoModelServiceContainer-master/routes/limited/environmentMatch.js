var ModelSerCtrl = require('../../control/modelSerControl');
var RouteBase = require('../routeBase');

module.exports = function(app){
    app.route('/enMatch/:msid')
        .get(function(req,res,next){
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function(err,ms){
                if(err){
                    return res.send({
                        "res": "Error",
                        "mess": "Error in get modelSer"
                    }); 
                }
                return res.render('enMatchModal',{
                    modelSer: ms,
                    place: 'local',
                })
            })
        });

    //环境匹配成功后修改模型服务数据库ms_status字段路由
    app.route('/enMatchSuc/:msid')
       .get(function(req,res,next){
           var msid = req.params.msid;
           ModelSerCtrl.updateMsByOID(msid,RouteBase.returnFunction(res,'error in update model service status'));
       });

    //环境匹配失败后删除模型部署包并删除该条模型记录
    app.route('/enMatchFail/:msid')
        .delete(function(req,res,next){
            var msid = req.params.msid;
            ModelSerCtrl.deleteMsDeployPackageByOID(msid,RouteBase.returnFunction(res,'error in delete model service record'));
        })
    
    //获取进行环境匹配所需的模型服务pid
    app.route('/enMatch/enviroPid/:msid')
        .get(function(req,res,next){
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid,function(err,ms){
                if(err){
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : 0,
                        message : errMessage + JSON.stringify(err)
                    }));
                }
                var pid = ms.ms_model.p_id;
                return res.end(JSON.stringify({
                    result : 'suc',
                    code : 1,
                    data : pid
                }));
            })
        })

}