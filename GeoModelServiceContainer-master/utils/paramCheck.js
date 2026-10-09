/**
 * Created by Franklin on 2017/3/17.
 */
var ParamCheck = function () {};

module.exports = ParamCheck;

ParamCheck.checkParam = function(callback, param, type)
{
    if(param == null || param == 'undefined' ||typeof param == 'undefined')
    {
        callback({
            err : "param error",
            message : "param is null"
        });
        return false;
    }
    if(type != null && typeof param != type)
    {
        callback({
            err : "param error",
            message : "type of param is wrong"
        });
        return false;
    }
    return true;
};
