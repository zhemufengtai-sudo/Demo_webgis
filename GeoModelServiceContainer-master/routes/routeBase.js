/**
 * Created by Franklin on 2017/3/22.
 */
var RouteBase = function () {};

RouteBase.returnFunction = function (res, errMessage, field, errcode, funcs) {
    if(errcode == undefined){
        errcode = -1;
    }
    return function (err, data) {
        if(err)
        {
            return res.end(JSON.stringify({
                result : 'err',
                code : errcode,
                message : errMessage + ":" + JSON.stringify(err)
            }));
        }
        if(field != null && field != undefined && typeof field == 'string'){
            data = data[field];
        }
        if(funcs != null && funcs != undefined && typeof funcs == 'object' && funcs.length != undefined){
            for(var i = 0; i < funcs.length; i++){
                // funcs[i].func(funcs[i].cb);
                funcs[i]();
            }
        }
        return res.end(JSON.stringify({
            result : 'suc',
            code : 1,
            data : data
        }));
    };
};

RouteBase.returnRender = function (res, view, dataName) {
    return function (err, data) {
        if(err)
        {
            return res.end(JSON.stringify({
                result : 'err',
                message : errMessage + JSON.stringify(err)
            }));
        }
        return res.render(view, {dataName : data});
    }
};

module.exports = RouteBase;