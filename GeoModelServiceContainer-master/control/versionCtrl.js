/**
 * Created by Administrator on 5.12.
 * 一般软件的版本号组成为： 主版本号.次版本号.修订版本号.日期版本号-先行版本号
 * 在比较时不考虑日期版本号和先行版本号，即包含'-' 和 字母 的部分不参与比较
 * v1表示新插入的 或者mdl中的范围
 * v2表示计算容器上的
 */

var versionCtrl = function () {

};

module.exports = versionCtrl;

versionCtrl.versionValid = function (v) {
    return true;
};

//comparision
//comparator:gt gte lt lte eq ne x
//return true false
versionCtrl.versionMatch = function (v1, comparator, v2) {
    //特殊情况 0 和 infinite
    if(v1 == '0'){
        if(comparator == 'lt' || comparator == 'lte')
            return true;
    }
    else if(v1 == 'infinite'){
        if(comparator == 'gt' || comparator == 'gte')
            return true;
    }
    
    var vecV1 = v1.split('.');
    var vecV2 = v2.split('.');
    //部分软件版本会有前缀'v'
    if(vecV1[0][0] == 'v' || vecV1[0][0] == 'V'){
        vecV1[0] = vecV1[0].substr(1);
    }
    if(vecV2[0][0] == 'v' || vecV2[0][0] == 'V'){
        vecV2[0] = vecV2[0].substr(1);
    }

    var len = (vecV1.length<vecV2.length)?vecV2.length:vecV1.length;
    var eq = true;
    for(var i=0;i<len;i++){
        if(i==vecV1.length && comparator == 'eq')
            return true;

        var ver1 = vecV1[i];
        var ver2 = vecV2[i];
        //缺省的子版本号为0
        if(ver1 == undefined)
            ver1 = '0';
        if(ver2 == undefined)
            ver2 = '0';
        ver1 = ver1.trim();
        ver2 = ver2.trim();
        ver1 = ver1.replace(/\s+/g,' ').toLowerCase();
        ver2 = ver2.replace(/\s+/g,' ').toLowerCase();
        //先行版本号忽略
        if(ver1.indexOf('base') != -1 || ver1.indexOf('alpha') != -1 || ver1.indexOf('beta') != -1
            || ver1.indexOf('rc') != -1 || ver1.indexOf('release') != -1 || ver1.indexOf('rev') != -1){
            continue;
        }
        //其他版本号都以 字符串 形式比较
        ver11 = parseFloat(ver1);
        ver22 = parseFloat(ver2);


        if(!isNaN(ver11)){
            if(!isNaN(ver22)){
                switch (comparator){
                    case 'eq':
                        if(ver1 != ver2){
                            return false;
                        }
                        break;
                    case 'ne':
                        if(ver1 != ver2)
                            return true;
                        break;
                    case 'gt':
                        if(ver1 == ver2)
                            break;
                        eq = false;
                        return ver1 > ver2;
                        break;
                    case 'lt':
                        if(ver1 == ver2)
                            break;
                        eq = false;
                        return ver1 < ver2;
                        break;
                    case 'gte':
                        if(ver1 == ver2)
                            break;
                        return ver1 > ver2;
                        break;
                    case 'lte':
                        if(ver1 == ver2)
                            break;
                        return ver1 < ver2;
                        break;
                    case 'x':
                        if(ver1 != ver2)
                            return false;
                        break;
                }
            }
            else{
                return false;
            }
        }
        else{
            if(comparator == 'eq'){
                if(ver1 != ver2)
                    return false;
            }
            else
                return comparator == 'x';
        }
    }

    if(comparator == 'lt' || comparator == 'gt')
        if(eq)
            return false;
    if(comparator == 'ne')
        return false;
    return true;
};

//return gt eq lt unknown
versionCtrl.versionCompare = function (v1, v2) {
    if(versionCtrl.match(v1,'eq',v2))
        return 'eq';
    else if(versionCtrl.match(v1,'gt',v2))
        return 'gt';
    else if(versionCtrl.match(v1,'lt',v2))
        return 'lt';
    else
        return 'unknown';
};

//ranges
//ranges支持的语法有四种，彼此以 && || () 连接：
//      区间：  infinite  0
//      !
//      x(X):x代表版本号中的一位
//      *

//检查range的合理性，并解析结构
versionCtrl.rangeValid = function (range) {
    var rst = {
        isValid : false,
        childRanges : []
    };
    var childRanges = [];
    
    // range = range.replace(/\s*\*\s*|\s*((\w+\.?)+)\.[xX]\s*|\s*\(\s*((\w+\.?)+)\s*,\s*((\w+\.?)+)\s*\)\s*|\s*\[\s*((\w+\.?)+)\s*,\s*((\w+\.?)+)\s*\]\s*|\s*\[\s*((\w+\.?)+)\s*,\s*((\w+\.?)+)\s*\)\s*|\s*\(\s*((\w+\.?)+)\s*,\s*((\w+\.?)+)\s*\]\s*/g,true);
    // var regObj = new RegExp(/\s*(\w+\.?)+\s*|\s*\*\s*|\s*((\w+\.?)+)\.[xX]\s*|\s*!\s*((\w+\.?)+)\s*|\s*\(\s*((\w+\.?)+)\s*,\s*((\w+\.?)+)\s*\)\s*|\s*\[\s*((\w+\.?)+)\s*,\s*((\w+\.?)+)\s*\]\s*|\s*\[\s*((\w+\.?)+)\s*,\s*((\w+\.?)+)\s*\)\s*|\s*\(\s*((\w+\.?)+)\s*,\s*((\w+\.?)+)\s*\]\s*/g);
    // var regObj = new regExp(/\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*|\s*(\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*(\&\&|\|\|)*\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*)\s*/g);
    // var regObj = new RegExp(/\s*\*\s*|\s*((\w+\.?)+)\.[xX]\s*|\s*!\s*(\w+\.?)+\s*|\s*((\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)|(\s*(\(|\[)\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*,\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*(\)|\])\s*))\s*|\s*(\s*((\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)|(\s*(\(|\[)\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*,\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*(\)|\])\s*))\s*(\&\&|\|\|)*\s*((\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)|(\s*(\(|\[)\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*,\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*(\)|\])\s*))\s*)\s*/g);
    var regObj = new RegExp(/(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)|\s*\*\s*|\s*((\w+\.?)+)\.[xX]\s*|\s*!\s*(\w+\.?)+\s*|(\s*(\(|\[)\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*,\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*(\)|\])\s*)/g);
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

//判断是否满足环境需求
//返回值 isValidRange  isSatisfied
versionCtrl.rangeMatch = function (version, range) {
    var satisfiesRst = {};
    var validRst = versionCtrl.rangeValid(range);
    if(validRst.isValid){
        satisfiesRst.isValidRange = true;
        for(var i=0;i<validRst.childRanges.length;i++){
            var partRst = versionCtrl.rangeMatchBase(version,validRst.childRanges[i]);
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

//比较版本的原子操作，range是最简单的一个范围，只能是四种情况中的一种
versionCtrl.rangeMatchBase = function (version,range) {
    var group = [];
    if(range.trim() == '*')
        return true;
    else if(group = range.match(/\s*((\w+\.?)+)\.(x|X)\s*/)){
        return versionCtrl.versionMatch(group[0],'x',version);
    }
    else if(group = range.match(/\s*!\s*((\w+\.?)+)\s*/)){
        return versionCtrl.versionMatch(group[2],'ne',version);
    }
    else if(group = range.match(/\s*\(\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*,\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*\)\s*/)){
        var min = group[1];
        var max = group[3];
        return versionCtrl.versionMatch(min,'lt',version) && versionCtrl.versionMatch(max,'gt',version)
    }
    else if(group = range.match(/\s*\[\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*,\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*\]\s*/)){
        var min = group[1];
        var max = group[3];
        return versionCtrl.versionMatch(min,'lte',version) && versionCtrl.versionMatch(max,'gte',version)
    }
    else if(group = range.match(/\s*\[\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*,\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*\)\s*/)){
        var min = group[1];
        var max = group[3];
        return versionCtrl.versionMatch(min,'lte',version) && versionCtrl.versionMatch(max,'gt',version)
    }
    else if(group = range.match(/\s*\(\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*,\s*(\s*((\w+\.?)+(\s*\-?\s*)?)+\s*)\s*\)\s*/)){
        var min = group[1];
        var max = group[3];
        return versionCtrl.versionMatch(min,'lt',version) && versionCtrl.versionMatch(max,'gte',version)
    }
    else if(group = range.match(/\s*((\w+\.?)+(\s*\-?\s*)?)+\s*/)){    //只能放在最后面
        return versionCtrl.versionMatch(group[0],'eq',version);
    }
    else 
        return false;
    // else if(group = range.match(/\s*>\s*((\w+\.?)+)\s*/)){
    //     return versionCtrl.match(group[1],'lt',version);
    // }
    // else if(group = range.match(/\s*<\s*((\w+\.?)+)\s*/)){
    //     return versionCtrl.match(group[1],'gt',version);
    // }
    // else if(group = range.match(/\s*>=\s*((\w+\.?)+)\s*/)){
    //     return versionCtrl.match(group[1],'lte',version);
    // }
    // else if(group = range.match(/\s*<=\s*((\w+\.?)+)\s*/)){
    //     return versionCtrl.match(group[1],'gte',version);
    // }
    // else if(group = range.match(/\s*(==)?\s*((\w+\.?)+)\s*/)){
    //     return versionCtrl.match(group[2],'eq',version);
    // }
};

versionCtrl.gtr = function (version, range) {

};

versionCtrl.ltr = function (version, range) {

};
