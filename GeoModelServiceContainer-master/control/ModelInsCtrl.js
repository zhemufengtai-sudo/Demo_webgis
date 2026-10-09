/**
 * Created by Franklin on 2016/11/24.
 */

var ModelInsCtrl = function () {};

module.exports = ModelInsCtrl;

ModelInsCtrl.Initialize = function(id, socket){
    global.app.modelInsColl.initialize(id, socket);
}

ModelInsCtrl.EnterState = function(id, state){
    global.app.modelInsColl.enterState(id, state);
}

ModelInsCtrl.FireEvent = function(id, state, event){
    //! factor.getInstance.putLog('{Fire Event Notified}' + id + sid + eventId);
    global.app.modelInsColl.fireEvent(id, state, event);
}

ModelInsCtrl.RequestData = function(id, state, event){
    //! TODO 根据InstanceID，去找到配置，State-Event-DataUri
    //! var object = factor.getInstance.getRequsetData(stateId, eventID);
    //! object.Flag (OK, ERROR, Not_Ready)
    //! object.MIME （UDX-XML, UDX-ZIP, Raw Data Format）
    //! object.DataBody (XML String，File Path)
    
    global.app.modelInsColl.requestData(id, state, event);
}

ModelInsCtrl.ResponseDataPrepare = function(id, state, event, data, dataSignal, dataType, dataFormat){
    //! Data Size
    //socket.write('{Response Data Notified}');
    
    global.app.modelInsColl.responseDataPrepare(id, state, event, data, dataSignal, dataType, dataFormat);
}

ModelInsCtrl.ResponseDataReceived = function(id, state, event, data, dataSignal, dataType, dataFormat){
    //! var obj; from data
    //! obj.Flag = OK;
    //! obj.MIME = UDX-ZIP;
    //! obj.DataBody = string;
    //! factor.getInstance.postResponseData(stateId, EventId, obj);
    //socket.write('{Response Data Received}');
    
    global.app.modelInsColl.responseData(id, state, event, data, dataSignal, dataType, dataFormat);
}

ModelInsCtrl.PostErrorInfo = function(id, errorinfo){
    global.app.modelInsColl.postErrorInfo(id, errorinfo);
}

ModelInsCtrl.PostWarningInfo = function(id, warninginfo){
    global.app.modelInsColl.postWarningInfo(id, warninginfo);
}

ModelInsCtrl.PostMessageInfo = function(id, messageinfo){
    global.app.modelInsColl.postMessageInfo(id, messageinfo);
}

ModelInsCtrl.GetModelAssembly = function(id, assemblyName){
    global.app.modelInsColl.getModelAssembly(id, assemblyName);
}

ModelInsCtrl.GetLogs = function(id, logPath){
    global.app.modelInsColl.getlogs(id, logPath);
}

ModelInsCtrl.LeaveState = function(id, state){
    global.app.modelInsColl.leaveState(id, state);
}

ModelInsCtrl.Finalize = function(id){
    global.app.modelInsColl.finalize(id);
}

ModelInsCtrl.setProcessParams = function(id, processParams){
    global.app.modelInsColl.setProcessParams(id, processParams);
}

ModelInsCtrl.initControlParams = function(id){
    global.app.modelInsColl;
}

// ModelInsCtrl.enter = function (app, cmds, socket) {
//     if (app == undefined || app == null || cmds == undefined || cmds == null)
//     {
//         return;
//     }
//     if(app.modelInsColl.bindSocket(cmds[0], socket) > 0)
//     {
//         socket.write('entered');
//         console.log(cmds[0] + ' -- enter');
//         app.modelInsColl.changeStateBySocket(socket, 'MC_ENTER');
//     }
//     else
//     {
//         socket.write('kill');
//     }
// };

// ModelInsCtrl.request = function (app, cmds, socket) {
//     if (app == undefined || app == null || cmds == undefined || cmds == null)
//     {
//         return;
//     }
//     ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr) {
//         if(err)
//         {
//             console.log(err);
//         }
//         else
//         {
//             if (msr == null)
//             {
//                 ModelInsCtrl.kill(app, cmds[0]);
//                 return ;
//             }
//             app.modelInsColl.changeStateBySocket(socket, 'MC_REQUEST');
//             console.log(cmds[0] + ' -- request');
//             var msg = "dataReady";

//             var count = 0;
//             var gdcb = (function (index) {
//                 count ++;
//                 return function (err, item) {
//                     count --;
//                     if(!err)
//                     {
//                         if(item != null)
//                         {
//                             if(item.gd_type == "FILE")
//                             {
//                                 msg += '[\t\t\t]' + msr.msr_input[index].StateId;
//                                 msg += '[\t\t]' + msr.msr_input[index].Event;
//                                 msg += '[\t\t]FILE[\t\t]' + __dirname + '/../geo_data/' +item.gd_value;
//                             }
//                             else if(item.gd_type == "STREAM")
//                             {
//                                 msg += '[\t\t\t]' + msr.msr_input[index].StateId;
//                                 msg += '[\t\t]' + msr.msr_input[index].Event;
//                                 msg += '[\t\t]STREAM[\t\t]' + item.gd_value;
//                             }
//                         }
//                     }

//                     if(count == 0)
//                     {
//                         socket.write(msg);
//                     }
//                 }
//             });

//             for(var i = 0; i < msr.msr_input.length; i++)
//             {
//                 GeoDataCtrl.getByKey(msr.msr_input[i].DataId, gdcb(i));
//             }
//         }
//     });
// };

// ModelInsCtrl.checkdata = function (app, cmds, socket) {
//     if (app == undefined || app == null || cmds == undefined || cmds == null)
//     {
//         return;
//     }
//     app.modelInsColl.changeStateBySocket(socket, 'MC_CHECKDATA');
//     console.log(cmds[0] + ' -- checkdata');
//     socket.write('oncheckdata');
// };

// ModelInsCtrl.calculate = function (app, cmds, socket) {
//     if (app == undefined || app == null || cmds == undefined || cmds == null)
//     {
//         return;
//     }
//     app.modelInsColl.changeStateBySocket(socket, 'MC_CALCULATE');
//     console.log(cmds[0] + ' -- calculate');
//     socket.write('oncalculate');
// };

// ModelInsCtrl.checkres = function(app, cmds, socket){
//     if (app == undefined || app == null || cmds == undefined || cmds == null)
//     {
//         return;
//     }
//     app.modelInsColl.changeStateBySocket(socket, 'MC_CHECKRES');
//     console.log(cmds[0] + ' -- checkres');
//     if(cmds.length < 3)
//     {
//         console.log('CMD Error ! ');
//     }
//     else
//     {
//         ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr) {
//             if(err)
//             {
//                 console.log('Error!');
//             }

//             var msg = 'oncheckres';
//             //判断长度
//             var count = 0;
//             for(var i = 2; i < cmds.length; i++)
//             {
//                 var detail = cmds[i].split('[\t\t]');
//                 if(detail.length < 3)
//                 {
//                     return socket.write('kill');
//                 }

//                 var filegdcb = (function (index) {
//                     return function (err, res) {
//                         count --;
//                         if (err)
//                         {
//                             console.log(err);
//                         }
//                         else
//                         {
//                             msg += '[\t\t\t]' + msr.msr_output[index].StateId ;
//                             msg += '[\t\t]' + msr.msr_output[index].Event ;
//                             msg += '[\t\t]FILE[\t\t]' + __dirname + '/../geo_data/' + msr.msr_output[index].DataId + '.xml';

//                             if(count == 0)
//                             {
//                                 socket.write(msg);
//                             }
//                         }
//                     }
//                 });

//                 var streamgdcb = (function (index) {
//                     return function (err, res) {
//                         count --;
//                         if(err)
//                         {
//                             console.log(err);
//                         }
//                         else
//                         {
//                             msg += '[\t\t\t]' + msr.msr_output[index].StateId ;
//                             msg += '[\t\t]' + msr.msr_output[index].Event ;
//                             msg += '[\t\t]STREAM';

//                             if(count == 0)
//                             {
//                                 socket.write(msg);
//                             }
//                         }
//                     }
//                 });

//                 for(var j = 0; j < msr.msr_output.length; j++)
//                 {
//                     if(msr.msr_output[j].StateId == detail[0] && msr.msr_output[j].Event == detail[1])
//                     {
//                         count ++;
//                         var size = parseInt(detail[2]);
//                         if(size < setting.data_size)
//                         {
//                             var gd = {
//                                 gd_id : msr.msr_output[j].DataId,
//                                 gd_tag :  msr.msr_output[j].Tag,
//                                 gd_size :  size,
//                                 gd_type : 'STREAM',
//                                 gd_value : ''
//                             };
//                             GeoDataCtrl.addData(gd, streamgdcb(j));
//                         }
//                         else
//                         {
//                             var gd = {
//                                 gd_id: msr.msr_output[j].DataId,
//                                 gd_tag: msr.msr_output[j].Tag,
//                                 gd_size: size,
//                                 gd_type: 'FILE',
//                                 gd_value: msr.msr_output[j].DataId + '.xml'
//                             };
//                             GeoDataCtrl.addData(gd, filegdcb(j));
//                         }
//                     }
//                 }
//             }
//         });
//     }
// };

// ModelInsCtrl.response = function (app, cmds, socket) {
//     if (app == undefined || app == null || cmds == undefined || cmds == null)
//     {
//         return;
//     }
//     app.modelInsColl.changeStateBySocket(socket, 'MC_RESPONSE');
//     console.log(cmds[0] + ' -- response');

//     if(cmds.length > 2)
//     {
//         ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr)
//         {
//             if(err)
//             {
//                 console.log(JSON.stringify(err));
//             }
//             else
//             {
//                 var count = 0;
//                 for(var k = 2; k < cmds.length; k++)
//                 {
//                     count ++;
//                     var gdcb = (function (index) {
//                         return function (err, gd) {
//                             var gddtl = cmds[index].split('[\t\t]');
//                             gd.gd_value = gddtl[3];
//                             GeoDataCtrl.update(gd, function (err, res)
//                             {
//                                 count --;
//                                 if(count == 0)
//                                 {
//                                     socket.write('dataRecv');
//                                 }
//                             });
//                         }
//                     });
//                     var detail = cmds[k].split('[\t\t]');
//                     if(detail[2] == 'STREAM')
//                     {
//                         for(var i = 0; i < msr.msr_output.length; i++)
//                         {
//                             if(detail[0] == msr.msr_output[i].StateId && detail[1] == msr.msr_output[i].Event)
//                             {
//                                 GeoDataCtrl.getByKey(msr.msr_output[i].DataId, gdcb(k));
//                             }
//                         }
//                     }
//                     else if(detail[2] == 'FILE')
//                     {
//                         count --;
//                         //检测文件是否存在

//                         if(count == 0)
//                         {
//                             socket.write('dataRecv');
//                         }
//                     }
//                 }
//             }
//         });
//     }
//     else
//     {
//         socket.write('dataRecv');
//     }
// };

// ModelInsCtrl.exit = function (app, cmds, socket) {
//     if (app == undefined || app == null || cmds == undefined || cmds == null)
//     {
//         return;
//     }
//     app.modelInsColl.changeStateBySocket(socket, 'MC_EXIT');
//     console.log(cmds[0] + ' -- exit');
//     socket.write('bye');
// };

// ModelInsCtrl.kill = function (app, guid) {
//     if(app == undefined || app == null || guid == undefined || guid == null)
//     {
//         return;
//     }
//     var mis = app.modelInsColl.getByGUID(guid);
//     mis.socket.write('kill');
// };