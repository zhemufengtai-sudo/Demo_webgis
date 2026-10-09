/**
 * Created by Administrator on 3.19.
 */
var fs = require('fs');
var Canvas = require('canvas');
var proj4 = require('proj4');
var child_process = require('child_process');

var GeoDataCtrl = require('./geoDataControl');
var lib_udx = require('../model/nxdat');
var UDXConvertor = require('./UDXConvertor');
var childCtrl = require('./childControl');
var remoteReqCtrl = require('./remoteReqControl');
var setting = require('../setting');

function UDXVisualization(udxVisual) {}

// module.exports = UDXVisualization;

UDXVisualization.test = function (a,cb) {
    cb({a:a});
};

UDXVisualization.getSnapshot = function (gdid,callback) {
    //根据gdid_config.json判断是否生成过配置文件,图像定位信息写在配置文件中,图片本身也写在里面
    //configPath用于查找是否已经生成过配置文件
    var rst = {};
    var configPath = setting.dirname + '/public/geojson/' + gdid + '_config.json';
    fs.stat(configPath,function (err, stat) {
        if(err){
            if(err.code == 'ENOENT'){
                //未生成过
                UDXVisualization.getDataType(gdid,function (err, dataType,srcDataset) {
                    if(err || dataType == "Unknown"){
                        console.log(err);
                        rst.err = err;
                        fs.writeFile(configPath,JSON.stringify(rst),function (err) {
                            if(err){
                                console.log(err);
                            }
                            return callback(JSON.stringify(rst));
                        });
                    }
                    if(dataType == 'grid'){
                        UDXVisualization.GtiffDataset(gdid,srcDataset,1,function (err,data) {
                            if(err){
                                console.log(err);
                                rst.err = err;
                            }
                            else{
                                rst = {
                                    dataType:'geotiff',
                                    layers:data
                                };
                            }
                            fs.writeFile(configPath,JSON.stringify(rst),function (err) {
                                if(err){
                                    console.log(err);
                                }
                                callback(JSON.stringify(rst));
                            });
                        });
                    }
                    else if(dataType == 'ascii grid'){
                        UDXVisualization.AsciiGridDataset(gdid,srcDataset,1,function (err,data) {
                            if(err){
                                console.log(err);
                                rst.err = err;
                            }
                            else{
                                rst = {
                                    dataType:'geotiff',
                                    layers:data
                                };
                            }
                            fs.writeFile(configPath,JSON.stringify(rst),function (err) {
                                if(err){
                                    console.log(err);
                                }
                                callback(JSON.stringify(rst));
                            });
                        });
                    }
                    else if(dataType == 'grid list'){
                        UDXVisualization.GtiffListDataset(gdid,srcDataset,1,function (err,data) {
                            if(err){
                                console.log(err);
                                rst.err = err;
                            }
                            else{
                                rst = {
                                    dataType:'grid list',
                                    layers:data
                                };
                            }
                            fs.writeFile(configPath,JSON.stringify(rst),function (err) {
                                if(err){
                                    console.log(err);
                                }
                                callback(JSON.stringify(rst));
                            });
                        });
                    }
                    else if(dataType == 'shp list'){
                        UDXConvertor.shpList2Geojson(gdid,srcDataset,function (err, data) {
                            if(err){
                                console.log(err);
                                rst.err = err;
                            }
                            else{
                                rst = {
                                    dataType:'shp list',
                                    layers:data
                                };
                            }
                            fs.writeFile(configPath,JSON.stringify(rst),function (err) {
                                if(err){
                                    console.log(err);
                                }
                                callback(JSON.stringify(rst));
                            });
                        });
                    }
                    else if(dataType == 'table'){
                        UDXVisualization.TableDataset(gdid,srcDataset,function (err,data) {
                            if(err){
                                console.log(err);
                                rst.err = err;
                            }
                            else{
                                rst = {
                                    dataType:'table',
                                    series:data
                                };
                            }
                            fs.writeFile(configPath,JSON.stringify(rst),function (err) {
                                if(err){
                                    console.log(err);
                                }
                                callback(JSON.stringify(rst));
                            });
                        });
                    }
                    else if(dataType == 'FV_TIN' || dataType == 'FV_Boundary' || dataType == 'shp'){
                        var convertor;
                        if(dataType == 'FV_TIN'){
                            convertor = UDXConvertor.FV_TIN2Geojson;
                        }
                        else if(dataType == 'FV_Boundary'){
                            convertor = UDXConvertor.FV_Boundary2Geojson;
                        }
                        else if(dataType == 'shp'){
                            convertor = UDXConvertor.shp2Geojson;
                        }
                        convertor(gdid,srcDataset,function (err, data) {
                            if(err){
                                console.log(err);
                                rst.err = err;
                            }
                            else{
                                rst = {
                                    dataType:'shp',
                                    layers:data
                                };
                            }
                            fs.writeFile(configPath,JSON.stringify(rst),function (err) {
                                if(err){
                                    console.log(err);
                                }
                                callback(JSON.stringify(rst));
                            });
                        })
                    }
                });
            }
            else{
                rst.err = err;
                return callback(JSON.stringify(rst));
            }
        }
        else if(stat){
            //已有历史生成过
            fs.readFile(configPath,'utf8',function (err,data) {
                if(err){
                    return callback(JSON.stringify({err:err}));
                }
                setTimeout(function () {
                    return callback(data.toString());
                },500);
            });
        }
    });
};

UDXVisualization.getRMTSnapshot = function (gdid, host, callback) {
    var configPath = setting.dirname + '/public/geojson/' + gdid + '_config.json';
    fs.stat(configPath,function (err, stat) {
        var rst = {};
        if(err){
            if(err.code == 'ENOENT'){
                childCtrl.getByWhere({host:host},function (error, child) {
                    if(error){
                        rst.err = error;
                        return callback(JSON.stringify(rst));
                    }
                    var port = child.port;
                    var url = 'http://' + host + ':' + port +'/geodata/snapshot/' + gdid;
                    remoteReqCtrl.getByServer(url,null,function (err, data) {
                        if(err){
                            console.log('---------------------err--------------------\n'+err);
                            rst.err = err;
                            return callback(JSON.stringify(rst));
                        }
                        fs.writeFile(configPath,data,function (err) {
                            if(err){
                                console.log(err);
                            }
                            return callback(data);
                        });
                    });
                });
            }
            else{
                rst.err = err;
                return callback(JSON.stringify(rst));
            }
        }
        else if(stat){
            //已有历史生成过
            fs.readFile(configPath,'utf8',function (err,data) {
                if(err){
                    return callback(JSON.stringify({err:err}));
                }
                setTimeout(function () {
                    return callback(data.toString());
                },500);
            });
        }
    });
};

//获取udx对应的原始数据类型
UDXVisualization.getDataType = function (gdid,callback) {
    //查找不到数据？redis数据的持久化
    GeoDataCtrl.getByKey(gdid, function (err, gd) {
        if(err)
        {
            return callback(err);
        }
        if(gd == null)
        {
            return callback('Error:null data!');
        }
        var filename = setting.dirname + '/geo_data/' + gd.gd_value;
        var filedata;
        if(gd.gd_type == 'FILE')
        {
            filedata = fs.readFileSync(filename,'utf8').toString();
        }
        else if(gd.gd_type == 'STREAM')
        {
            filedata = gd.gd_value;
        }
        var srcDataset = lib_udx.createDataset();
        //TODO可能会出现字符编码问题
        var ss = lib_udx.loadFromXmlFile(srcDataset, filedata);
        if (ss != 'Parse XML OK') {
            callback("Error:load udx err!");
        }
        var srcRootNode = lib_udx.getDatasetNode(srcDataset);
        var count = lib_udx.getNodeChildCount(srcRootNode);
        var firstFloor = [],secondFloor = [];
        for(var i=0;i<count;i++){
            var node = lib_udx.getChildNode(srcRootNode,i);
            var nodeName = lib_udx.getNodeName(node);
            firstFloor.push(nodeName);

            var nodeType = lib_udx.getNodeType(node).value;
            if(nodeType == 9)
                continue;
            
            var count2 = lib_udx.getNodeChildCount(node);
            if(count2 > 1){
                for(var j=0;j<count2;j++){
                    var node2 = lib_udx.getChildNode(node,j);
                    var nodeName2 = lib_udx.getNodeName(node2);
                    secondFloor.push(nodeName2);
                }
            }
        }

        if(firstFloor.indexOf('ShapeType') != -1 && firstFloor.indexOf('FeatureCollection') != -1 &&
            firstFloor.indexOf('AttributeTable') != -1 && firstFloor.indexOf('SpatialRef') != -1){
            return callback(null,'shp',srcDataset);
        }
        else if(firstFloor.indexOf('header') != -1 && firstFloor.indexOf('bands') != -1 &&
            firstFloor.indexOf('projection') != -1){
            return callback(null,'grid',srcDataset);
        }
        else if(firstFloor.indexOf('head') != -1 && firstFloor.indexOf('body') != -1){
            if(secondFloor.indexOf('ncols') != -1 && secondFloor.indexOf('nrows') != -1 && secondFloor.indexOf('xllcorner')!=-1 && secondFloor.indexOf('cellsize') != -1){
                return callback(null,'ascii grid',srcDataset);
            }
            else if(secondFloor.indexOf('TriangleCount') != -1 && secondFloor.indexOf('PointCount') != -1 && secondFloor.indexOf('TriangleList')!=-1 && secondFloor.indexOf('PointList') != -1){
                return callback(null,'FV_TIN',srcDataset);
            }
            else if(secondFloor.indexOf('description') != -1 && secondFloor.indexOf('nodeCount') != -1){
                return callback(null,'FV_Boundary',srcDataset);
            }
            else{
                return callback(null,'Unknown',null);
            }
        }
        else if(firstFloor.indexOf('grid list') != -1){
            return callback(null,'grid list',srcDataset);
        }
        else if(firstFloor.indexOf('shp list') != -1){
            return callback(null,'shp list',srcDataset);
        }
        else if(firstFloor.indexOf('table') != -1){
            return callback(null,'table',srcDataset);
        }
        else{
            return callback(null,'Unknown',null);
        }
    });
};

//将gtiff的所有波段进行可视化，factor为缩放因子，通过gdid生成dstPath为存放路径
UDXVisualization.GtiffDataset = function (gdid,srcDataset, factor, callback) {
    var srcRootNode = lib_udx.getDatasetNode(srcDataset);
    var count = lib_udx.getNodeChildCount(srcRootNode);
    if (count < 3) {
        return callback('Error:UDX err!');
    }
    //////////////////////////////////////////////
    // read
    {
        var srcHead, srcBody, srcProj,srcW,srcH,srcxll,srcyll,pixelW,pixelH,dataType;
        srcHead = lib_udx.getChildNode(srcRootNode, 0);
        srcBody = lib_udx.getChildNode(srcRootNode, 1);
        srcProj = lib_udx.getChildNode(srcRootNode, 2);
        srcxll = lib_udx.getChildNode(srcHead,0);
        pixelW = lib_udx.getChildNode(srcHead,1);
        srcyll = lib_udx.getChildNode(srcHead,3);
        pixelH = lib_udx.getChildNode(srcHead,4);
        srcW = lib_udx.getChildNode(srcHead, 6);
        srcH = lib_udx.getChildNode(srcHead, 7);
        dataType = lib_udx.getChildNode(srcHead, 8);
        var nrows = lib_udx.getNodeIntValue(srcH);
        var ncols = lib_udx.getNodeIntValue(srcW);
        var xll = lib_udx.getNodeRealValue(srcxll);
        var yll = lib_udx.getNodeRealValue(srcyll);
        var pixelWidth = Math.abs(lib_udx.getNodeRealValue(pixelW));
        var pixelHeight = Math.abs(lib_udx.getNodeRealValue(pixelH));
        var bandCount = lib_udx.getNodeChildCount(srcBody);
        var projection = lib_udx.getNodeStringValue(srcProj);
        var dt = lib_udx.getNodeStringValue(dataType);
    }

    //////////////////////////////////////////////
    // draw and save image
    var rstList = [];
    var saveOne = function (band) {
        //draw
        var srcBandNode = lib_udx.getChildNode(srcBody,band);
        var nodataNode = lib_udx.getChildNode(srcBandNode,0);
        var nodataV = lib_udx.getNodeRealValue(nodataNode);
        var srcValueNode = lib_udx.getChildNode(srcBandNode,4);
        var valueType = lib_udx.getNodeType(lib_udx.getChildNode(srcValueNode,0)).value;
        var pixelDeep = -1;
        if(pixelDeep == -1){
            var maxV=-99999,
                minV=99999;
            for(var i=0;i<nrows;i++) {
                for (var j = 0; j < ncols; j++) {
                    var kernal;
                    if(valueType==2)
                        kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcValueNode,i),j);
                    else if(valueType == 1)
                        kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcValueNode,i),j);
                    if(kernal == nodataV)
                        continue;
                    if(kernal>maxV){
                        maxV = kernal;
                    }
                    if(kernal<minV){
                        minV = kernal;
                    }
                }
            }
        }
        var canvasH = Math.floor(nrows/factor)+1;
        var canvasW = Math.floor(ncols/factor)+1;
        var canvas = new Canvas(canvasW,canvasH);
        var ctx = canvas.getContext('2d');
        for(var i=0;i<canvasH;i++){
            for(var j=0;j<canvasW;j++){
                var pixelV = 0;
                for(var k = 0;k<factor;k++){
                    for(var b = 0;b<factor;b++){
                        var row = i*factor+k;
                        var col = j*factor+b;
                        if(row >= nrows)
                            row = nrows - 1;
                        if(col >= ncols)
                            col = ncols - 1;
                        var kernal;
                        if(valueType==2)
                            kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcValueNode,row),col);
                        else if(valueType == 1)
                            kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcValueNode,row),col);
                        pixelV += kernal;
                    }
                }
                pixelV = pixelV/factor/factor;
                //nodata
                if(pixelV==nodataV)
                    continue;
                // draw piexl
                var val;
                if(pixelDeep == -1){
                    val = Math.floor((pixelV-minV)/(maxV-minV)*255);
                }
                else{
                    val = pixelV/Math.pow(2,pixelDeep-8);
                }
                ctx.fillStyle = 'rgba(' + val + ',' + val + ',' + val + ',1)';
                ctx.fillRect(j,i,1,1);
            }
        }

        //save
        var dataURL = canvas.toDataURL('imag/png',1);
        //openlayers或者地图坐标系的坐标系与canvas的y轴方向不同，前者向上，后者向下
        //在此坐标表示地理坐标，向上，向右为正
        var WSCorner = [
            xll,
            yll-pixelHeight*nrows
        ];
        var ENCorner = [
            xll+pixelWidth*ncols,
            yll
        ];
        //提供给前台的是经纬度形式的extent
        try{
            WSCorner = proj4(projection).inverse(WSCorner);
            ENCorner = proj4(projection).inverse(ENCorner);
        }
        catch(err){
            WSCorner = proj4('EPSG:3857').inverse(WSCorner);
            ENCorner = proj4('EPSG:3857').inverse(ENCorner);
        }
        var base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        var dstPath = setting.dirname + '/public/images/snapshot/' + gdid + '_' + band + '.png';
        fs.writeFile(dstPath, dataBuffer, function(err) {
            if (err) {
                console.log('Error:sava image file err!');
                callback(err);
            } 
            else {
                rst = {
                    name:gdid + '_' + band + '.png',
                    path:dataURL,
                    WSCorner:WSCorner,
                    ENCorner:ENCorner
                };
                rstList.push(rst);
                if(band == (bandCount-1)){
                    callback(null,rstList);
                }
                else{
                    saveOne(band+1);
                }
            }
        });
    };
    saveOne(0);
};

UDXVisualization.GtiffListDataset = function (gdid,srcDataset,factor,callback) {
    var gridListNode = lib_udx.getChildNode(lib_udx.getDatasetNode(srcDataset),0);
    var listCount = lib_udx.getNodeChildCount(gridListNode);
    var rstList = [];
    var getOneGtiff = function (index) {
        var srcRootNode = lib_udx.getChildNode(gridListNode,index);
        //////////////////////////////////////////////
        // read
        {
            var srcHead, srcBody, srcProj,srcW,srcH,srcxll,srcyll,pixelW,pixelH,dataType;
            srcHead = lib_udx.getChildNode(srcRootNode, 0);
            srcBody = lib_udx.getChildNode(srcRootNode, 1);
            srcProj = lib_udx.getChildNode(srcRootNode, 2);
            srcxll = lib_udx.getChildNode(srcHead,0);
            pixelW = lib_udx.getChildNode(srcHead,1);
            srcyll = lib_udx.getChildNode(srcHead,3);
            pixelH = lib_udx.getChildNode(srcHead,4);
            srcW = lib_udx.getChildNode(srcHead, 6);
            srcH = lib_udx.getChildNode(srcHead, 7);
            dataType = lib_udx.getChildNode(srcHead, 8);
            var nrows = lib_udx.getNodeIntValue(srcH);
            var ncols = lib_udx.getNodeIntValue(srcW);
            var xll = lib_udx.getNodeRealValue(srcxll);
            var yll = lib_udx.getNodeRealValue(srcyll);
            var pixelWidth = Math.abs(lib_udx.getNodeRealValue(pixelW));
            var pixelHeight = Math.abs(lib_udx.getNodeRealValue(pixelH));
            var bandCount = lib_udx.getNodeChildCount(srcBody);
            var projection = lib_udx.getNodeStringValue(srcProj);
            var dt = lib_udx.getNodeStringValue(dataType);
        }

        //////////////////////////////////////////////
        // draw and save image
        var saveOne = function (band) {
            //draw
            var srcBandNode = lib_udx.getChildNode(srcBody,band);
            var nodataNode = lib_udx.getChildNode(srcBandNode,0);
            var nodataV = lib_udx.getNodeRealValue(nodataNode);
            var srcValueNode = lib_udx.getChildNode(srcBandNode,4);
            var valueType = lib_udx.getNodeType(lib_udx.getChildNode(srcValueNode,0)).value;
            var pixelDeep = -1;
            if(pixelDeep == -1){
                var maxV=-99999,
                    minV=99999;
                for(var i=0;i<nrows;i++) {
                    for (var j = 0; j < ncols; j++) {
                        var kernal;
                        if(valueType==2)
                            kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcValueNode,i),j);
                        else if(valueType == 1)
                            kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcValueNode,i),j);
                        if(kernal == nodataV)
                            continue;
                        if(kernal>maxV){
                            maxV = kernal;
                        }
                        if(kernal<minV){
                            minV = kernal;
                        }
                    }
                }
            }
            var canvasH = Math.floor(nrows/factor)+1;
            var canvasW = Math.floor(ncols/factor)+1;
            var canvas = new Canvas(canvasW,canvasH);
            var ctx = canvas.getContext('2d');
            for(var i=0;i<canvasH;i++){
                for(var j=0;j<canvasW;j++){
                    var pixelV = 0;
                    for(var k = 0;k<factor;k++){
                        for(var b = 0;b<factor;b++){
                            var row = i*factor+k;
                            var col = j*factor+b;
                            if(row >= nrows)
                                row = nrows - 1;
                            if(col >= ncols)
                                col = ncols - 1;
                            var kernal;
                            if(valueType==2)
                                kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcValueNode,row),col);
                            else if(valueType == 1)
                                kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcValueNode,row),col);
                            pixelV += kernal;
                        }
                    }
                    pixelV = pixelV/factor/factor;
                    //nodata
                    if(pixelV==nodataV)
                        continue;
                    // draw piexl
                    var val;
                    if(pixelDeep == -1){
                        val = Math.floor((pixelV-minV)/(maxV-minV)*255);
                    }
                    else{
                        val = pixelV/Math.pow(2,pixelDeep-8);
                    }
                    ctx.fillStyle = 'rgba(' + val + ',' + val + ',' + val + ',1)';
                    ctx.fillRect(j,i,1,1);
                }
            }

            //save
            var dataURL = canvas.toDataURL('imag/png',1);
            //openlayers或者地图坐标系的坐标系与canvas的y轴方向不同，前者向上，后者向下
            //在此坐标表示地理坐标，向上，向右为正
            //transform coordinate
            {
                var WSCorner = [
                    xll,
                    yll-pixelHeight*nrows
                ];
                var ENCorner = [
                    xll+pixelWidth*ncols,
                    yll
                ];
                //提供给前台的是经纬度形式的extent
                try{
                    WSCorner = proj4(projection).inverse(WSCorner);
                    ENCorner = proj4(projection).inverse(ENCorner);
                }
                catch(err){
                    WSCorner = proj4('EPSG:3857').inverse(WSCorner);
                    ENCorner = proj4('EPSG:3857').inverse(ENCorner);
                }
            }
            var base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
            var dataBuffer = new Buffer(base64Data, 'base64');
            var dstPath = setting.dirname + '/public/images/snapshot/' + gdid + '_' + index + '_' + band + '.png';
            fs.writeFile(dstPath, dataBuffer, function(err) {
                if (err) {
                    console.log('Error:sava image file err!');
                    callback(err);
                }
                else {
                    rst = {
                        name:gdid + '_' + index + '_' + band + '.png',
                        path:dataURL,
                        WSCorner:WSCorner,
                        ENCorner:ENCorner
                    };
                    rstList.push(rst);
                    if(band == (bandCount-1)){
                        if(index == (listCount-1))
                            callback(null,rstList);
                        else
                            getOneGtiff(index+1);
                    }
                    else{
                        saveOne(band+1);
                    }
                }
            });
        };
        saveOne(0);
    };
    getOneGtiff(0);
};

UDXVisualization.AsciiGridDataset = function (gdid,srcDataset, factor, callback) {
    var srcRootNode = lib_udx.getDatasetNode(srcDataset);
    var count = lib_udx.getNodeChildCount(srcRootNode);
    if (count < 2) {
        return console.log('Error:UDX err!');
    }
    //////////////////////////////////////////////
    // read
    var nrows,ncols,xll,yll,cellsize,nodataV;
    var srcHead = lib_udx.getChildNode(srcRootNode, 0);
    var srcBody = lib_udx.getChildNode(srcRootNode, 1);
    for(var i=0;i<lib_udx.getNodeChildCount(srcHead);i++){
        var childNode = lib_udx.getChildNode(srcHead,i);
        var nodeName = lib_udx.getNodeName(childNode);
        switch (nodeName){
            case 'ncols':
                ncols = lib_udx.getNodeIntValue(childNode);
                break;
            case 'nrows':
                nrows = lib_udx.getNodeIntValue(childNode);
                break;
            case 'xllcorner':
                xll = lib_udx.getNodeRealValue(childNode);
                break;
            case 'yllcorner':
                yll = lib_udx.getNodeRealValue(childNode);
                break;
            case 'NODATA_value':
                nodataV = lib_udx.getNodeRealValue(childNode);
                break;
            case 'cellsize':
                cellsize = lib_udx.getNodeRealValue(childNode);
        }
    }

    //get max and min value
    {
        var maxV=-99999,
            minV=99999;
        for(var i=0;i<nrows;i++) {
            for (var j = 0; j < ncols; j++) {
                var kernal;
                try{
                    kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcBody,i),j);
                }
                catch(err){
                    kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcBody,i),j);
                }
                if(kernal == nodataV)
                    continue;
                if(kernal>maxV){
                    maxV = kernal;
                }
                if(kernal<minV){
                    minV = kernal;
                }
            }
        }
    }
    var canvasH = Math.floor(nrows/factor)+1;
    var canvasW = Math.floor(ncols/factor)+1;
    var canvas = new Canvas(canvasW,canvasH);
    var ctx = canvas.getContext('2d');
    // var myImageData = ctx.createImageData(canvasH,canvasW);
    for(var i=0;i<canvasH;i++){
        for(var j=0;j<canvasW;j++){
            var pixelV = 0;
            for(var k = 0;k<factor;k++){
                for(var b = 0;b<factor;b++){
                    var row = i*factor+k;
                    var col = j*factor+b;
                    if(row >= nrows)
                        row = nrows - 1;
                    if(col >= ncols)
                        col = ncols - 1;
                    var kernal;
                    try{
                        kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcBody,row),col);
                    }
                    catch(err){
                        kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcBody,row),col);
                    }
                    pixelV += kernal;
                }
            }
            pixelV = pixelV/factor/factor;
            //nodata
            if(pixelV==nodataV)
                continue;
            // draw piexl
            val = Math.floor((pixelV-minV)/(maxV-minV)*255);
            ctx.fillStyle = 'rgba(' + val + ',' + val + ',' + val + ',1)';
            ctx.fillRect(j,i,1,1);
        }
    }

    //save image
    var dataURL = canvas.toDataURL('imag/png',1);
    var WSCorner = [
        xll,
        yll-cellsize*nrows
    ];
    var ENCorner = [
        xll+cellsize*ncols,
        yll
    ];

    //提供给前台的是经纬度形式的extent
    //ascii grid 没有存投影信息
    WSCorner = proj4('EPSG:3857').inverse(WSCorner);
    ENCorner = proj4('EPSG:3857').inverse(ENCorner);
    var base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var dstPath = setting.dirname + '/public/images/snapshot/' + gdid + '.png';
    fs.writeFile(dstPath, dataBuffer, function(err) {
        if (err) {
            console.log('Error:sava image file err!');
            callback(err);
        } else {
            rst = {
                name:gdid + '.png',
                path:dataURL,
                WSCorner:WSCorner,
                ENCorner:ENCorner
            };
            console.log("ok!");
            callback(null,[rst]);
        }
    });
};

UDXVisualization.DEMDataset = function(gdid, srcDataset, factor, callback){

};

UDXVisualization.TableDataset = function (gdid, srcDataset, callback) {
    var srcRootNode = lib_udx.getDatasetNode(srcDataset);
    var count = lib_udx.getNodeChildCount(srcRootNode);
    if(count == 0){
        callback('Error:null table!');
    }
    else{
        var tableColumns = [];
        var tableNode = lib_udx.getChildNode(srcRootNode,0);
        var colCount = lib_udx.getNodeChildCount(tableNode);
        for(var i=0;i<colCount;i++){
            var colNode = lib_udx.getChildNode(tableNode,i);
            var colLength = lib_udx.getNodeLength(colNode);
            var columnData = [];
            var isNum = true;
            for(var j=0;j<colLength;j++){
                var td = lib_udx.getNodeStringArrayValue(colNode,j);
                if(isNum && parseFloat(td) == 'NaN'){
                    isNum = false;
                }
                columnData.push(parseFloat(td));
            }
            var colName = lib_udx.getNodeName(colNode);
            tableColumns.push({
                name:colName,
                data:columnData,
                type:(function () {
                    if(isNum){
                        return 'num';
                    }
                    else{
                        return 'string';
                    }
                })()
            });
        }
        callback(null,tableColumns);
    }
};

// UDXVisualization.GtiffFile = function (srcPath,dstPath,band,factor, callback) {
//     fs.readFile(srcPath,function (err, data) {
//         if (err) {
//             console.log("Error:read file err!\n");
//             callback(err);
//         }
//         var strUDX = data.toString();
//         var srcDataset = lib_udx.createDataset();
//         // bug
//         // Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X
//         // with X higher than the current value 16777216, (2) compile with
//         // ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some
//         // optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.
//         var ss = lib_udx.loadFromXmlFile(srcDataset, strUDX);
//         if (ss != 'Parse XML OK') {
//             return console.log('Error:load udx err!');
//         }
//         UDXVisualization.GtiffDataset(srcDataset,band,factor,function (err, rst) {
//             if(err){
//                 callback(err);
//             }
//             else{
//                 fs.writeFile(dstPath, rst.image, function(err) {
//                     if (err) {
//                         console.log('Error:sava image file err!');
//                         callback(err);
//                     } else {
//                         callback(null,rst)
//                     }
//                 });
//             }
//         })
//     })
// };

process.on('message',function (m) {
    if(m.code == 'start'){
        if(m.host){
            UDXVisualization.getRMTSnapshot(m.gdid,m.host,function (data) {
                process.send({code:'stop',rst:JSON.parse(data)});
            })
        }
        else{
            UDXVisualization.getSnapshot(m.gdid,function (data) {
                process.send({code:'stop',rst:JSON.parse(data)});
            })
        }
        
    }
});