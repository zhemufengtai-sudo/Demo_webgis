/**
 * Created by Franklin on 2017/3/14.
 */

var React = require('react');
var Axios = require('axios');

var ModelSerDiagram = require('../modelSer/modelSerDiagram');

var ModelSerRunInfo = React.createClass({
    getInitialState: function () {
        this.refresh(function(){
            if (this.polling != null) return;
            this.polling = setInterval(function () {
                Axios.get('/modelins/json/' + this.state.msr.msr_guid).then(
                    data => {
                        if (data.data.result == 'suc' && data.data.data) {
                            if (data.data.data) {
                                this.setState({ logs: data.data.data.log, state: data.data.data.state, event: data.data.data.event, input: data.data.data.input, output: data.data.data.output, processParams:data.data.data.processParams });
                            }
                            else {
                                this.setState({ logs: data.data.data.log, running: false });
                            }
                        }
                        else {
                            clearInterval(this.polling);
                            this.setState({ running: false });
                            this.refresh();
                        } 
                    },
                    err => { }
                );
            }.bind(this), 1000);
        }.bind(this));
        return {
            loading: true,
            err: null,
            msr: null,
            running: true,
            input: null,
            output: null,
            state: null,
            event: null,
            warning: null,
            logs: [],
            logs_d: [],
            processParams : [],
            controlParams : {},
            stateDiagram : null
        };
    },

    componentWillMount: function () {
        
    },

    DownloadFile: function (id) {
        window.open('/geodata/' + id);
    },

    Visualization: function (id) {
        window.open('/geodata/' + id + '?ac=visualize');
    },

    ShowDetailData: function(mdId){
        $('#' + mdId).modal('show');
    },

    refresh: function (callback) {
        // console.log("this.props['data-source']"+this.props['data-source'])
        // modelserrun/json/66f1358c4f55c1ec808180f6
        Axios.get(this.props['data-source']).then(
            data => {
                if (data.data.result == 'suc') {
                    if (data.data.data.msr_status == 1) {
                        this.setState({ msr: data.data.data, input: data.data.data.msr_input, output: data.data.data.msr_output, running: false, logs: data.data.data.msr_logs, processParams:data.data.data.msr_processparams, controlParams:data.data.data.msr_controlparams, loading: false }, function(){if(callback) callback()});
                    }
                    else if (data.data.data.msr_status == -1) {
                        this.setState({ msr: data.data.data, input: data.data.data.msr_input, output: data.data.data.msr_output, running: false, processParams:data.data.data.msr_processparams, controlParams:data.data.data.msr_controlparams, loading: false }, function(){if(callback) callback()});
                    }
                    else {
                        this.setState({ msr: data.data.data, input: data.data.data.msr_input, output: data.data.data.msr_output, running: true, loading: false }, function(){if(callback) callback()});
                    }
                }
                else {
                    this.setState({ err: data.data.message, loading: false }, function(){if(callback) callback()});
                }
            },
            err => { }
        );
    },

    setAsTestData: function (e) {
        var validator = $('#testifyForm').validate({
            errorPlacement:function (error, element) {
                error.css('display','inline');
                error.css('color','red');
                error.css('margin','3px 3px 0 10px');
                error.css('background',"url('/images/alert.png') no-repeat 0 5px");
                error.css('padding-left',"21px");
                error.css('padding-top',"2px");
                element.after(error);
            },
            rules: {
                testifyTitle: 'required',
                testifyTag: 'required',
                testifyInfo: 'required'
            },
            messages: {
                testifyTitle:{
                    required: ''
                },
                testifyTag: {
                    required: ''
                },
                testifyInfo: {
                    required: ''
                }
            }
        });

        if(!validator.form()){
            return null;
        }
        var titlevalue = $('#testTitle').val();
        var tagvalue = $('#testTag').val();
        //此处后面需要添加字段匹配功能，判断title字段是否已经之前被使用过，可以考虑从数据库或者文件夹遍历获取名称的方式解决
        Axios.get('/modelserrun/testify/checkTitle/' + this.state.msr._id + '?title=' + titlevalue + '&tag=' + tagvalue).then(
            data =>{
                if(data.data.result == 'suc'){
                    var setdataUrl = '/modelserrun/testify/' + this.state.msr._id;
                    //进行请求
                    $.ajax({
                        url: setdataUrl,
                        method:'post',
                        data: $('#testifyForm').serialize(),
                        success: this.onFieldFinished,
                        error: function(error){
            
                        }
                    })
                }else{
                    this.setState({warning: 'Fail! ' + data.data.message});
                }

            },
            err =>{

            }
        )

        

    },

    onFieldFinished: function(msg){
         msg = JSON.parse(msg);
         var title;
         if(msg.suc){
             if(msg.status == 1){
                 title = 'Add test data successful';
                 this.dialogClose();
             }else{
                 title = 'Test data has existed';
             }
         }else{
             title = 'Fail to add Test data';
         }

         $.gritter.add({
             title: title,
             text: '<p><strong style="">Tag:&nbsp;&nbsp;</strong>' + $('#testTag').val() +'</p><p><strong>Detail:&nbsp;&nbsp;</strong>' + $('#testDetail').val() + '</p>',
             sticky: false,
             time: 2000
         });
         return false;
    },

    dialogClose: function(){
      $('#setTestModal').modal('hide');
    },

    checkLogs: function(){
        // if(this.state.stateDiagram == null){
        //     return;
        // }
        // for(var i = this.state.logs_d.length; i < this.state.logs.length; i++){
        //     if(this.state.logs[i].Type == 'EnterState'){
        //         //! TODO Set state as running
        //         this.state.stateDiagram.setStateAsRunning(this.state.logs[i].state);
        //         this.state.logs_d.push(this.state.logs[i]);
        //     }
        //     if(this.state.logs[i].Type == 'LeaveState'){
        //         //! TODO Set state as finished
        //         this.state.stateDiagram.setStateAsFinished(this.state.logs[i].state);
        //         this.state.logs_d.push(this.state.logs[i]);
        //     }
        // }
    },

    // 导出logs信息
    exportLogs: function() {
        console.log("导出日志按钮被点击");
        if (this.state.logs.length === 0) {
            console.log('No logs to export');
            return;
        }

        var logMesssges = [];
        for (var i = 0 ;i<this.state.logs.length; i++) {
            var logEntry = this.state.logs[i];
            logMesssges.push(`${logEntry.Type} - ${logEntry.State} - ${logEntry.Event} - ${logEntry.Message}`);
        }
        // console.log(this.state.logs.length)
        // 创建Blog对象存储文本文件
        var blob = new Blob([logMesssges.join('\n')], { type: 'text/plain'});
        var url = URL.createObjectURL(blob);

        // 创建下载链接
        var logsLink = document.createElement('a');
        logsLink.href = url;
        logsLink.download = 'logs.txt';
        document.body.appendChild(logsLink);
        logsLink.click();
        document.body.removeChild(logsLink);
        URL.revokeObjectURL(url);
    },

    render: function () {
        if (this.state.loading) {
            return (<span>loading...</span>);
        }
        if (this.state.error) {
            return (<span>Error:{JSON.stringify(this.state.error)}</span>);
        }
        var warning = null;
        if(this.state.warning){
            warning = (
                <div className="alert alert-block alert-danger fade in">
                <strong>{this.state.warning}</strong>
            </div>
            );
        }
        var user = '';
        if (this.state.msr.msr_user.u_type == 0) {
            user += 'Local Invorker ';
        }
        else if (this.state.msr.msr_user.u_type == 1) {
            user += ' Outer Invorker ';
        }
        else if (this.state.msr.msr_user.u_type == 2) {
            user += ' [Unknown] ';
        }
        user += ' - ' + this.state.msr.msr_user.u_name;

        //Input data
        var inputData = this.state.input.map(function (input, index) {
            var configBtn = null;
            var downloadBtn = null;
            var virtualBtn = null;
            var requestedStyle = null;
            if (!input.Requested) {
                configBtn = (<button className="btn btn-default btn-xs" ><i className="fa fa-edit"></i> Config </button>);
                requestedStyle = 'danger';
            }
            if (input.Requested == undefined){
                input.Requested = false;
            }
            if (input.Destroyed == undefined){
                input.Destroyed = false;
            }
            else {
                requestedStyle = 'success';
            }
            if (input.DataId != null && input.DataId != ''){
                var downloadBtn = (<button className="btn btn-default btn-xs" onClick={(e) => { this.DownloadFile(input.DataId) }} ><i className="fa fa-download"></i> Download </button>);
                var virtualBtn = (<button className="btn btn-success btn-xs" onClick={(e) => { this.Visualization(input.DataId) }} ><i className="fa fa-picture-o"></i> Visualization </button>);
            }
            return (
                <tr key={index}>
                    <td>{index}</td>
                    <td title={input.StateId} >{input.StateName}</td>
                    <td>{input.Event}</td>
                    <td title={input.DataId} >{input.Tag}</td>
                    <td className={requestedStyle} >{input.Requested.toString()}</td>
                    <td>{input.Destroyed.toString()}</td>
                    <td>
                        {configBtn}&nbsp;
                        {downloadBtn} &nbsp;
                        {virtualBtn}
                    </td>
                </tr>);
        }, this);
        inputData = (
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>StateName</th>
                        <th>EventName</th>
                        <th>Data</th>
                        <th>Requested</th>
                        <th>Destroy after used</th>
                        <th>Operation</th>
                    </tr>
                </thead>
                <tbody>
                    {inputData}
                </tbody>
            </table>
        )
        var outputData = null;
        // var processResultData = null;

        //Output data
        outputData = this.state.output.map(function (output, index) {
            var tag = 'NULL';
            var buttonDL = null;
            var buttonV = null;
            var tagStyle = 'danger';
            if (output.Multiple && output.Multiple == 'True' && output.DataId.length > 0){
                tag = output.Tag;
                tagStyle = 'success';
                detailData = output.DataId.map(function(dataid, index_d){
                    return (
                        <tr>
                            <td>{index_d}</td>
                            <td>{output.Tag}</td>
                            <td>
                                <button className="btn btn-default btn-xs" onClick={(e) => { this.DownloadFile(dataid) }}><i className="fa fa-download"></i> Download </button>
                                <button className="btn btn-success btn-xs" onClick={(e) => { this.Visualization(dataid) }}><i className="fa fa-picture-o"></i> Visualization </button>
                            </td>
                        </tr>
                    );
                }, this);
                buttonDL = (<button className="btn btn-default btn-xs" href={"mdDetailData_" + output.StateName + output.Event} data-toggle="modal" onClick={(e) => { this.ShowDetailData("mdDetailData_" + output.StateName + output.Event) }} ><i className="fa fa-folder"></i> Detail </button>)
                buttonV = (
                    <div aria-hidden="true" aria-labelledby={"mdDetailData_" + output.StateName + output.Event} role="dialog" tabIndex="-1" id={"mdDetailData_" + output.StateName + output.Event} style={{"zIndex":"1050"}}  className="modal fade">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                    <h4 className="modal-title">Data Detail</h4>
                                </div>
                                <div className="modal-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Data</th>
                                                <th>Operation</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailData}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                    <br />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            else if (output.DataId != '') {
                tag = output.Tag;
                tagStyle = 'success';
                buttonDL = (<button className="btn btn-default btn-xs" onClick={(e) => { this.DownloadFile(output.DataId) }}><i className="fa fa-download"></i> Download </button>);
                buttonV = (<button className="btn btn-success btn-xs" onClick={(e) => { this.Visualization(output.DataId) }}><i className="fa fa-picture-o"></i> Visualization </button>);
            }

            // if (output.TimeData.length != 0) {
            //     //进行中间数据的显示
            //     processResultData = output.TimeData.map(function (temData, dataindex) {
            //         //to be achieve
            //         var buttonDownload = (<button className="btn btn-default btn-xs" onClick={(e) => { this.DownloadFile(temData.dataId) }}><i className="fa fa-download"></i> Download</button>);
            //         var buttonVisualize = (<button className="btn btn-success btn-xs" onClick={(e) => { this.Visualization(temData.dataId) }}><i className="fa fa-picture-o"></i> Visualization </button>);
            // return (
            //             <tr key={dataindex}>
            //                 <td>{dataindex}</td>
            //                 <td title={output.StateId}>{output.StateName}</td>
            //                 <td>{output.Event}</td>
            //                 <td title={temData.dataId} className='success'>{temData.name}</td>
            //                 <td>{output.Destroyed.toString()}</td>
            //                 <td>
            //                     {buttonDownload}&nbsp;{buttonVisualize}
            //                 </td>
            //             </tr>
            //         );

            //     }, this);
            // }

            return (
                <tr key={index}>
                    <td>{index}</td>
                    <td title={output.StateId}>{output.StateName}</td>
                    <td>{output.Event}</td>
                    <td>{output.Multiple}</td>
                    <td title={output.DataId} className={tagStyle} >{tag}</td>
                    <td>{output.Destroyed.toString()}</td>
                    <td>
                        {buttonDL}&nbsp;{buttonV}
                    </td>
                </tr>);
        }, this);
        outputData = (
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>StateName</th>
                        <th>EventName</th>
                        <th>Multiple</th>
                        <th>Data</th>
                        <th>Destroy after used</th>
                        <th>Operation</th>
                    </tr>
                </thead>
                <tbody>
                    {outputData}
                </tbody>
            </table>
        );

        // //process data
        // processResultData = (
        //         <table className="table">
        //             <thead>
        //                 <tr>
        //                     <th>#</th>
        //                     <th>StateName</th>
        //                     <th>EventName</th>
        //                     <th>Data</th>
        //                     <th>Destroy after used</th>
        //                     <th>Operation</th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 {processResultData}
        //             </tbody>
        //         </table>  
        // );
        

        //Process parameter table
        var ppRows = null;
        var datetime = null;
        if(this.state.processParams.length != 0){
            var item_n = this.state.processParams[this.state.processParams.length - 1];
            var paramskeys = Object.keys(item_n['PARAMS']);
            var params = item_n['PARAMS'];
            datetime =item_n['DATETIME'];
            ppRows = paramskeys.map(function(item, index){
                return (
                <tr key={index}>
                    <td>{index}</td>
                    <td>{item}</td>
                    <td>{params[item]}</td>
                </tr>);
            }, this);
        }
        var processParams = (
            <table className="table col-lg-4">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {ppRows}
                </tbody>
            </table>
        );

        //Control parameter table
        var cprows = null;
        paramskeys = Object.keys(this.state.controlParams);
        cprows = paramskeys.map(function(item, index){
            return (
            <tr key={index}>
                <td>{index}</td>
                <td>{item}</td>
                <td>{this.state.controlParams[item]}</td>
            </tr>);
        }, this);
        var controlParams = (
            <table className="table col-lg-4">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {cprows}
                </tbody>
            </table>
        );

        //Datetime information
        var date = new Date(this.state.msr.msr_datetime);
        date = date.toLocaleString();

        var errMessage = '';
        var standoutMessage = '';
        var standerrMessage = '';
        //Error message
        if (this.state.msr.msr_runninginfo.InvokeErr != '') {
            errMessage = (
                <p>
                    <span className="label label-danger" >Invoking Error</span><br />
                    {this.state.msr.msr_runninginfo.InvokeErr}
                </p>);
        }

        //Standout message
        if (this.state.msr.msr_runninginfo.StdOut != '') {
            var stdOut = this.state.msr.msr_runninginfo.StdOut;
            stdOut = stdOut.replace(/"/g, '');
            stdOut = stdOut.replace('\\r', '');
            stdOut = stdOut.split('\\n');
            stdOut = stdOut.map(function (element) {
                return (
                    <span>
                        {element}<br />
                    </span>)
            }, this);
            standoutMessage = (
                <p>
                    <span className="label label-info" >Stand Output</span><br />
                    {stdOut}
                </p>);
        }
        var standerrMessage = null;
        //Standerr message
        if (this.state.msr.msr_runninginfo.StdErr != '') {
            var stdErr = this.state.msr.msr_runninginfo.StdErr;
            stdErr = stdErr.replace(/"/g, '');
            stdErr = stdErr.replace('\\r', '');
            stdErr = stdErr.split('\\n');
            stdErr = stdErr.map(function (element) {
                return (
                    <p>
                        {element}
                    </p>)
            }, this);

            standerrMessage = (
                <p>
                    <span className="label label-warning" >Stand Error</span><br />
                    {stdErr}
                </p>);
        }
        var progress = null;
        var testButton = null;
        var currentState = null;
        var currentEvent = null;

        //Status Judgement
        if (this.state.running) {
            currentState = (<p><strong>Current State&nbsp;:&nbsp;</strong>{this.state.state}</p>);
            currentEvent = (<p><strong>Current Event&nbsp;:&nbsp;</strong>{this.state.event}</p>);
            progress = (
                <div className="progress progress-striped active progress-sm">
                    <div id="bar_pro" style={{ width: "100%" }} aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" className="progress-bar progress-bar-success">
                        <span className="sr-only">40%</span>
                    </div>
                    <br />
                    <br />
                    <br />
                </div>
            );
        }
        else {
            if (this.state.msr.msr_status == 1) {
                progress = (
                    <span className="label label-success" >Finished</span>
                );
                if(this.props["data-type"] != undefined && this.props["data-type"] == "custom"){
                    testButton = (
                        <div>
                            <br />
                            <br />
                            <br />
                        </div>
                    );
                }
                else{
                    testButton = (
                        <p style={{ "textAlign": "center" }}>
                            <br />
                            <button className="btn btn-success" type="button" data-toggle="modal" data-target="#setTestModal" style={{ "textAlign": "center", "width": "250px", "marginBottom": "50px" }} >
                                <i className="fa fa-cogs"></i> Set As Test Data
                            </button>
                        </p>
                    );
                }

            }
            else if (this.state.msr.msr_status == 0) {
                progress = (
                    <span className="label label-success" >Unfinished</span>
                );
            }
            else if (this.state.msr.msr_status == -1) {
                progress = (
                    <span className="label label-danger" >Error</span>
                );
            }
        }

        //Logs
        if (this.state.logs.length == 0) {
            this.state.logs = this.state.msr.msr_logs;
        }

        var logs = this.state.logs.map(function (item, index) {
            if (item.Flag == 1) {
                return (<li style={{ color: '#008800' }}>{item.Type + ' - ' + item.State + ' - ' + item.Event + ' - ' + item.Message}</li>);
            }
            else if (item.Flag == -1) {
                return (<li style={{ color: '#CC0000' }}>{item.Type + ' - ' + item.State + ' - ' + item.Event + ' - ' + item.Message}</li>);
            }
            else if (item.Flag == -2) {
                return (<li style={{ color: '#FFCC00' }}>{item.Type + ' - ' + item.State + ' - ' + item.Event + ' - ' + item.Message}</li>);
            }
        }.bind(this));
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    Model Running
                    <span className="tools pull-right">
                        <a href="javascript:;" className="fa fa-chevron-down"> </a>
                    </span>
                </div>
                <div className="panel-body">
                    <p title={this.state.msr.msr_guid} ><strong>Start Time&nbsp;:&nbsp;</strong>{date}</p>
                    <p><strong>User&nbsp;:&nbsp;</strong>{user}</p>
                    {currentState}
                    {currentEvent}
                    <p><strong>State Diagram&nbsp;:&nbsp;</strong><br /></p>
                    <ModelSerDiagram ref="modelSerDiagram" data-msid={this.state.msr.ms_id} />
                    <p><strong>Input Data&nbsp;:&nbsp;</strong><br /></p>
                    {inputData}
                    <p><strong>Output Data&nbsp;:&nbsp;</strong><br /></p>
                    {outputData}
                    <p><strong>Process Parameters&nbsp;:&nbsp;</strong>&nbsp;<br /></p>
                    <p style={{color:'green'}}><strong>Update in </strong>&nbsp;:&nbsp;{datetime}&nbsp;</p>
                    {processParams}
                    <p><strong>Control Parameters&nbsp;:&nbsp;</strong>&nbsp;<br /></p>
                    {controlParams}
                    <p><strong>Logs&nbsp;:&nbsp;</strong><br />
                        <ul>
                            {logs}
                        </ul>
                    </p>
                    <button type="button" className="label label-success" onClick={this.exportLogs}>ExportLog</button>
                    <p><strong>Output Message&nbsp;:&nbsp;</strong><br />
                        {standoutMessage}
                        <br />
                        {standerrMessage}
                        <br />
                        {errMessage}
                    </p>
                    <p><strong>Time Span&nbsp;:&nbsp;</strong>{this.state.msr.msr_time}&nbsp;{this.state.msr.msr_span}s&nbsp;</p>
                    <p><strong>Progress&nbsp;:&nbsp;</strong></p>
                    {progress}
                    {testButton}
                    <div className="modal fade in" id="setTestModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false" style={{ "overflowY": "hidden", "display": "none" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                                        ×
                                    </button>
                                    <h4 className="modal-title" id="myModalLabel">
                                        Set As Test Data
                                    </h4>
                                </div>
                                <form id="testifyForm">
                                    <div className="modal-body">
                                        <h4>Title</h4>
                                        <div>
                                        <input name="testifyTitle" type="text" id="testTitle" className="form-control" style={{ "width": "90%", "display": "inline" }} />
                                        </div>
                                        <h4>Tag</h4>
                                        <div>
                                            <input name="testifyTag" type="text" id="testTag" className="form-control" style={{ "width": "90%", "display": "inline" }} />
                                        </div>
                                        <h4>Detail</h4>
                                        <div>
                                            <textarea name="testifyDetail" type="text" id="testDetail" className="form-control" style={{ "width": "90%", "display": "inline" }}></textarea>
                                        </div>
                                        <br />
                                        {warning}
                                    </div>
                                    <div className="modal-footer">
                                        <input id="submitTestify" type="button" className="btn btn-success" onClick={this.setAsTestData} value="Submit" />
                                        <button type="button" className="btn btn-default" data-dismiss="modal">
                                            Close
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerRunInfo;