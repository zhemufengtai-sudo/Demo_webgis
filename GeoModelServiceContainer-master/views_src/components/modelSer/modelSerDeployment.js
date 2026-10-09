/**
 * Created by Franklin on 2017/7/14.
 */

var React = require('react');
var Axios = require('axios');

var ModelItemSelect = require('./modelItemSelect');
var NoteDialog = require('../../action/utils/noteDialog');

var ModelSerDeployment = React.createClass({
    getInitialState : function(){
        var urlUpload = '/modelser';
        var urlFile = '/modelser/file';
        //2018.7.22 添加环境匹配路由
        var urlMatchTest = '/enMatch/';
        var urlFinished = '/modelser/';
        var host = null;
        if(this.props['data-type'] == 'rmt'){
            host = this.props['data-host'];
            urlUpload = '/modelser/rmt/' + host;
            urlFile = '/modelser/rmt/file/' + host;
            urlFinished = '/modelser/rmt/' + host + '/';
        }
        return {
            urlUpload : urlUpload,
            urlFile : urlFile,
            urlFinished : urlFinished,
            urlMatchTest: urlMatchTest,
            progressbar : false,
            progresspercet : 0,
            fileFinished : false,
            fieldFinished : false,
            oid : null
        };
    },

    componentDidMount : function(){
        $('#stepy_form').stepy({
            backLabel: 'Pre',
            nextLabel: 'Next',
            errorImage: true,
            block: false,
            description: true,
            legend: false,
            titleClick: true,
            titleTarget: '#top_tabby',
            validate: false,
            finishButton:true,
            finish: this.onSubmit
        });
        $('.tooltips').tooltip();
        
    },

    onSubmit : function(e){
        if($('#file_modelSer').val() == ''){
            NoteDialog.openNoteDia('Info', 'Please choose package!');
            return false;
        }
        this.setState({progressbar : true});
        // var formdata = new FormData($('#stepy_form')[0]);
        var formdata = new FormData($('#deployForm')[0]);
        $.ajax({
            url: this.state.urlUpload,
            method:'POST',
            data: formdata,
            processData: false,
            contentType: false,
            timeout : 7200*1000,
            success: this.onFieldFinished
        });
        var fileInsterval = setInterval(function () {
            Axios.get(this.state.urlFile).then(
                data => {
                    this.setState({progresspercet : data.data.value});
                    if(data.data.value == 100){
                        clearInterval(fileInsterval);
                        this.setState({fileFinished : true});
                        this.checkFinished();
                    }
                }
            );
        }.bind(this), 500);
        return false;
    },

    onSelectedItem : function(e, item){
        $('#stepy_form-title-1').click();
    },

    onFieldFinished : function (msg) {
        msg = JSON.parse(msg);
        if(msg.result == 'suc'){
            var oid = msg.data._id;
            this.setState({ fieldFinished : true, oid : oid });
            this.checkFinished();
        }
        else if(msg.result == 'err'){
            msg = msg.message;
            if(msg.status == 0)
            {
                //System Error
                NoteDialog.openNoteDia('System Error', 'Please try later!');
            }
            else if(msg.status == 1)
            {
                if(msg.isValidate){
                }
                else{
                    if(!msg.mdl){
                        NoteDialog.openNoteDia('package Error', 'Lack of MDL file or error in parsing MDL!');
                    }
                }
            }
            else{
                NoteDialog.openNoteDia('Unknown error', JSON.stringify(msg));
            }
        }
    },

    checkFinished : function(){
        if(this.state.fileFinished && this.state.fieldFinished){
            //2018.7.22 修改模型部署包上传时跳转到环境匹配路由
            // window.location.href = this.state.urlFinished + this.state.oid;
            window.location.href = this.state.urlMatchTest + this.state.oid;
        }
    },

    render : function(){
        var procBar = null;
        var btnEnable = '';
        if(this.state.progressbar){
            procBar = (
                <div id="div_upload">
                    {window.LanguageConfig.ModelService.CurrentProgress}:
                    <br />
                    <div className="progress progress-striped active progress-sm">
                        <div id="upload_bar" style={{"width": this.state.progresspercet + '%'}} aria-valuemax="100" aria-valuemin="0" aria-valuenow="0" role="progressbar" className="progress-bar progress-bar-success">
                            <span className="sr-only">{this.state.progresspercet}% {window.LanguageConfig.ModelService.DeploymentComplete}</span>
                        </div>
                    </div>
                </div>
            );
            btnEnable = 'disable';
        }
        var transform = null;
        if(this.props['data-type'] != 'rmt'){
            transform = (<button className="btn btn-link btn-sm" type="button" onClick={ (e) => { window.location.href="/modelser/cloud" }}  >Deployment from portal</button>);
        }
        var host = null;
        if(this.props['data-host']){
            host = " To " + this.props['data-host'];
        }
        if(this.props['data-type'] == 'rmt'){
        }
        return (
            <section className="panel" >
                <header className="panel-heading">
                    {window.LanguageConfig.Heading.LocalModelService.Deployment } &nbsp;{host}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {/* {transform} */}
                </header>
                <div className="panel-body">
                    <form id="deployForm" className="form-horizontal left-align form-well" action="/modelser" method="post" encType="multipart/form-data" >
                        {/* <div className="form-group">
                            <label className="col-md-2 col-sm-2 control-label">模型条目</label>
                            <div className="col-md-6 col-sm-6">
                                <input name="m_name" type="text" id="m_name" className="form-control" readOnly="readOnly" />
                                <input name="m_id" type="hidden" id="m_id" className="form-control" />
                            </div>
                        </div> */}
                        <fieldset>
                            <div className="form-group">
                                <label className="col-md-2 col-sm-2 control-label">{window.LanguageConfig.ModelService.SetAccessibility}</label>
                                <div className="col-md-2 col-sm-2">
                                    <select id="ms_limited" name="ms_limited" className="form-control" >
                                        <option value="0">{window.LanguageConfig.ModelService.Public}</option>
                                        <option value="1">{window.LanguageConfig.ModelService.Private}</option>
                                    </select>
                                </div>
                                <div className="col-md-2 col-sm-2"><span>{window.LanguageConfig.ModelService.DeploymentNote}</span></div>
                            </div>
                            {/* <div className="form-group">
                                <label className="col-md-2 col-sm-2 control-label">Image</label>
                                <div className="col-md-6 col-sm-6">
                                    <div className="fileupload fileupload-new" data-provides="fileupload">
                                        <div className="fileupload-new thumbnail" style={ { "width ":"200px", "height":"150px" }}>
                                            <img src="/images/noimg.png" alt="" />
                                        </div>
                                        <div className="fileupload-preview fileupload-exists thumbnail" style={{"maxWidth" : "200px", "maxHeight" : "150px", "lineHeight": "20px"}}></div>
                                        <div>
                                        <span className="btn btn-default btn-file">
                                                <span className="fileupload-new"><i className="fa fa-paper-clip"></i> Select</span>
                                                <span className="fileupload-exists"><i className="fa fa-undo"></i> Change</span>
                                                <input id="file_img" name="ms_img" type="file" className="default"  accept=".png,.jpg" />
                                        </span>
                                            <a href="#" className="btn btn-danger fileupload-exists" data-dismiss="fileupload"><i className="fa fa-trash"></i> Remove</a>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                            <div className="form-group">
                                <label className="col-md-2 col-sm-2 control-label">{window.LanguageConfig.Heading.LocalModelService.UploadDeploymentPackage }</label>
                                <div className="col-md-6 col-sm-6">
                                    <div className="fileupload fileupload-new" data-provides="fileupload">
                                        <span className="btn btn-default btn-file">
                                            <span className="fileupload-new"><i className="fa fa-paper-clip"></i> {window.LanguageConfig.ModelService.PackageSelect }</span>
                                            <span className="fileupload-exists"><i className="fa fa-undo"></i> {window.LanguageConfig.ModelService.PackageChange }</span>
                                            <input id="file_modelSer" name="file_model" type="file" className="default" />
                                        </span>
                                        <span className="fileupload-preview" style={{ "marginLeft" : "5px"}}></span>
                                        <a href="#" className="close fileupload-exists" data-dismiss="fileupload" style={{"float":"none", "marginLeft":"5px"}}></a>
                                        <br />
                                        <br />
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        
                        <div className="form-group">
                            <label className="col-md-2 col-sm-2 control-label"></label>
                            <div className="col-md-6 col-sm-6">
                                <button className="btn btn-info" disabled={btnEnable} type="button" onClick={this.onSubmit} >{window.LanguageConfig.ModelService.PackageSubmit }</button>
                            </div>
                        </div>
                    </form>
                    {procBar}
                </div>
            </section>
        );
    }
});

module.exports = ModelSerDeployment;