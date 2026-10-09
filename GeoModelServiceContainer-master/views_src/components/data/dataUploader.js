/**
 * Created by Franklin on 2017/3/31.
 */
var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');
var DataSelectTabel = require('./dataSelectTable');

var DataUploader = React.createClass({
    getInitialState : function () {
        var fileUrl = '/geodata?type=file';
        var streamUrl = '/geodata?type=stream';
        var selectUrl = '/geodata/json/all';
        var urlselectUrl = '/geodata?type=url';
        if(this.props['data-rmt'] == '1'){
            fileUrl = '/geodata/file/' + this.props['data-host'];
            streamUrl = '/geodata/stream/' + this.props['data-host'];
            selectUrl = '/geodata/rmt/json/all/' + this.props['data-host'];
            urlselectUrl = '/geodata/url/' + this.props['data-host'];
        }
        var id = '';
        if(this.props['data-id']){
            id = this.props['data-id'];
        }
        var isCtrl = false;
        if(this.props['isCtrl']){
            isCtrl = true;
        }
        var title = '';
        if(this.props['data-title']){
            title = this.props['data-title'];
        }
        return {
            title : title,
            isCtrl : isCtrl,
            id : id,
            tag : '',
            gdid : '',
            fileUrl : fileUrl,
            streamUrl : streamUrl,
            selectUrl : selectUrl,
            urlselectUrl : urlselectUrl,
            form : null,
            uploader : null
        };
    },

    componentDidMount : function () {
        this.setState({uploader : $('#fileuploader_' + this.state.id).uploadFile({
            //上传路径
            url : this.state.fileUrl,
            //上传文件名
            fileName :"myfile",
            //是否多个文件
            multiple : false,
            //是否拖拽上传
            dragDrop : true,
            //最大文件数
            maxFileCount:1,
            //规定上传文件格式
            acceptFiles:"*/*",
            //最大文件大小
            maxFileSize:1024*1024*1024*3,
            //动态表单
            dynamicFormData : function(){
                var tag = '';
                if($('#fileuploaderTag_' + this.state.id).val() == ''){
                    tag = this.state.uploader.existingFileNames[0];
                }
                else{
                    tag = $('#fileuploaderTag_' + this.state.id).val();
                }
                this.state.tag = tag;
                var formData = {
                    gd_tag : tag
                };
                return formData;
            }.bind(this),
            //上传文件按钮文本
            uploadStr : window.LanguageConfig.InputData.Data.FileUpload,
            //取消上传按钮文本
            cancelStr : window.LanguageConfig.InputData.Data.FileCancel,
            //拖拽上传提示文本（带HTML）
            dragDropStr : "<span><b>" + window.LanguageConfig.InputData.Data.DragUpload + "</b></span>",
            //完成上传提示文本
            doneStr : window.LanguageConfig.InputData.Data.UploadDone,
            //是否自动传
            autoSubmit:false,
            //是否显示已上传文件
            showDownload:false,
            //上传完成回调
            onSuccess : this.onUploadFileFinished
        })});
        $('#dataLinkModel' + this.state.id).on('shown.bs.modal', this.refs.selectedTB.refresh)
    },

    onInputSubmit : function(e){
        Axios.post(this.state.streamUrl,{
                gd_tag : $('#dataInputTag_' + this.state.id).val(),
                data : $('#dataInput_' + this.state.id).val()
            })
            .then(
                data => {
                    if(data.data.result == 'suc'){
                        this.state.gdid = data.data.data;
                        this.state.tag = $('#dataInputTag_' + this.state.id).val();
                        this.onUploadStreamFinished(data.data.data);
                    }else if(data.data.res == 'err'){
                        window.alert(data.data.message);
                    }
                },
                err => {
                    if(data.data.res == 'err'){
                        window.alert(data.data.message);
                    }
                }
            );
    },

    onFileSubmit : function(e){
        this.state.uploader.startUpload();
    },

    onUrlSubmit : function(e){
       //将输入的url当做输入内容传输过去，后台解析
       Axios.post(this.state.urlselectUrl,{
           gd_tag : $('#urluploaderTag_' + this.state.id).val(),
           data : $('#urlInput_' + this.state.id).val()
       })
           .then(
               data => {
                   if(data.data.result == 'suc'){
                    this.state.gdid = data.data.gd_id;
                    this.state.tag = $('#urluploaderTag_' + this.state.id).val();
                    this.onUploadUrlFinished(data.data.gd_id,data);
                   }else if(data.data.result == 'err'){
                      window.alert(data.data.message);
                   }
               },
               err => {
                   if(data.data.result == 'err'){
                       window.alert(data.data.message);
                   }
               }
           );
     
       
    },

    onSelectSubmit : function(e){
        var gdid = this.refs.selectedTB.getSelectedGDID();
        var tag = this.refs.selectedTB.getSelectedTAG();
        if(gdid == undefined)
        {
            alert(window.LanguageConfig.InputData.Data.PleaseChooseData);
        }
        else
        {
            this.state.gdid = gdid;
            this.state.tag = tag;
            this.onSelectFinished();
        }
    },

    onUploadStreamFinished : function(gdid) {
        NoteDialog.openNoteDia(window.LanguageConfig.InputData.Data.DataUploadSuccessfully, 'ID : ' + gdid);
        $('#dataInputModel' + this.state.id).modal('hide');
        $('#dataInputTag_' + this.state.id).val('');
        $('#dataInput_' + this.state.id).val('');
        this.onFinished();
    },

    onUploadFileFinished : function(files, data, xhr, pd){
        var resJson = JSON.parse(data);
        if(resJson.result == 'suc')
        {
            $('#fileuploaderTag_' + this.state.id).val('');
            $('#dataFileModel' + this.state.id).modal('hide');
            this.state.gdid = resJson.data;
            NoteDialog.openNoteDia(window.LanguageConfig.InputData.Data.DataUploadSuccessfully, 'ID : ' + resJson.data);
            this.onFinished();
        }
        this.state.uploader.reset();
    },

    onUploadUrlFinished : function(gdid){
        NoteDialog.openNoteDia(window.LanguageConfig.InputData.Data.DataUploadSuccessfully, 'ID : ' + gdid);
        $('#dataUrlModel' + this.state.id).modal('hide');
        $('#urluploaderTag_' + this.state.id).val('');
        $('#urlInput_' + this.state.id).val('');
        this.onFinished();
    },

    onSelectFinished : function() {
        $("#dataLinkModel" + this.state.id).modal('hide');
        this.onFinished();
    },

    onFinished : function () {
        if(this.props.onFinish)
        {
            this.props.onFinish(this.state.gdid, this.state.tag);
        }
    },

    getGDID : function(){
        return this.state.gdid;
    },
    
    render : function(){
        var selectBtn = null;
        var semiautoBtn = null;
        var semiautoModal = null;
        var id = this.state.id;
        if(this.props['data-type'] == 'SELECT')
        {
            selectBtn = (
                <button className="btn btn-default" type="button" data-toggle="modal" data-target={"#dataLinkModel" + id} ><i className="fa fa-link"></i> {window.LanguageConfig.InputData.Data.Link}</button>
            );
        }

        if (this.state.isCtrl) {
            semiautoBtn = (
                <button className="btn btn-default" type="button" data-toggle="modal"
                        data-target={'#dataGenerateModel' + id}><i className="fa fa-cogs"></i> {window.LanguageConfig.InputData.Data.ConfigData}</button>
            );
            semiautoModal = (
                <div aria-hidden="true" aria-labelledby="dataInputModel" role="dialog" tabIndex="-1"
                     id={"dataGenerateModel" + id} className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×
                                </button>
                                <h4 className="modal-title">{window.LanguageConfig.InputData.Data.ConfigData}</h4>
                            </div>
                            <div className="modal-body">
                                <h4>{window.LanguageConfig.InputData.Data.Tag}</h4>
                                <input id={'dataGenerateTag_' + this.state.id} type="text" className="form-control"/>
                                <h4>{window.LanguageConfig.InputData.Data.UDXData}</h4>

                                <div className="adv-table editable-table ">
                                    <div className="clearfix">
                                        <div className="btn-group">
                                            <button id="editable-sample_new" className="btn btn-primary">
                                                Add New <i className="fa fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space15"></div>
                                    <table className="table table-striped table-hover table-bordered" id="editable-sample">
                                        <thead>
                                        <tr>
                                            <th>Node Name</th>
                                            <th>Node Type</th>
                                            <th>Node Value</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr className="">
                                            <td>Jonathan</td>
                                            <td>Smith</td>
                                            <td>3455</td>
                                            <td><a className="edit" href="javascript:;">Edit</a></td>
                                            <td><a className="delete" href="javascript:;">Delete</a></td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button id={'btn_generate_ok' + id} type="button" className="btn btn-success"
                                        onClick={this.onGenerateSubmit}>{window.LanguageConfig.InputData.Data.Confirm}
                                </button>
                                <button id={'btn_generate_close' + id} type="button" className="btn btn-default"
                                        data-dismiss="modal">{window.LanguageConfig.InputData.Data.Close}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <div className="btn-group">
                    {semiautoBtn}
                    <button className="btn btn-default" type="button" data-toggle="modal" data-target={'#dataInputModel' + id} ><i className="fa fa-pencil"></i> {window.LanguageConfig.InputData.Data.Input}</button>
                    <button className="btn btn-default" type="button" data-toggle="modal" data-target={"#dataFileModel" + id} ><i className="fa fa-file"></i> {window.LanguageConfig.InputData.Data.File}</button>
                    <button className="btn btn-default" type="button" data-toggle="modal" data-target={"#dataUrlModel" +id} ><i className="fa fa-link"></i> {window.LanguageConfig.InputData.Data.Url}</button>
                    {selectBtn}
                </div>
                {semiautoModal}
                <div aria-hidden="true" aria-labelledby="dataInputModel" role="dialog" tabIndex="-1" id={"dataInputModel" + id} className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">{window.LanguageConfig.InputData.Data.Input + '-' + this.state.title}</h4>
                            </div>
                            <div className="modal-body">
                                <h4>{window.LanguageConfig.InputData.Data.Tag}</h4>
                                <input id={'dataInputTag_' + this.state.id} type="text" className="form-control" ></input>
                                <h4>{window.LanguageConfig.InputData.Data.Text}</h4>
                                <textarea id={'dataInput_' + this.state.id} className="form-control" style={{height:'200px'}} ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button id={'btn_input_ok' + id} type="button" className="btn btn-success" onClick={this.onInputSubmit} >{window.LanguageConfig.InputData.Data.Confirm}</button>
                                <button id={'btn_input_close' + id} type="button" className="btn btn-default" data-dismiss="modal" >{window.LanguageConfig.InputData.Data.Close}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div aria-hidden="true" aria-labelledby="dataUrlModel" role="dialog" tabIndex="-1" id={"dataUrlModel" + id} className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">{window.LanguageConfig.InputData.Data.Url + '-' + this.state.title}</h4>
                            </div>
                            <div className="modal-body">
                                <h4>{window.LanguageConfig.InputData.Data.Tag}</h4>
                                <input id={'urluploaderTag_' + this.state.id} type="text" className="form-control" ></input>
                                <h4>{window.LanguageConfig.InputData.Data.URLData}</h4>
                                <input id={'urlInput_' + this.state.id} type="text" className="form-control" ></input>
                            </div>
                            <div className="modal-footer">
                                <button id={'btn_url_ok' + id} type="button" className="btn btn-success" onClick={this.onUrlSubmit} >{window.LanguageConfig.InputData.Data.Confirm}</button>
                                <button id={'btn_url_close' + id} type="button" className="btn btn-default" data-dismiss="modal" >{window.LanguageConfig.InputData.Data.Close}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div aria-hidden="true" aria-labelledby="dataFileModel" role="dialog" tabIndex="-1" id={"dataFileModel" + id} className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">{window.LanguageConfig.InputData.Data.File + '-' + this.state.title}</h4>
                            </div>
                            <div className="modal-body">
                                <h4>{window.LanguageConfig.InputData.Data.Tag}</h4>
                                <input id={'fileuploaderTag_' + this.state.id} type="text" className="form-control" ></input>
                                <h4>{window.LanguageConfig.InputData.Data.DataFile}</h4>
                                <div id={'fileuploader_' + this.state.id}>Upload</div>
                            </div>
                            <div className="modal-footer">
                                <button id={'btn_file_ok' + id} type="button" className="btn btn-success" onClick={this.onFileSubmit} >{window.LanguageConfig.InputData.Data.Confirm}</button>
                                <button id={'btn_file_close' + id} type="button" className="btn btn-default" data-dismiss="modal" >{window.LanguageConfig.InputData.Data.Close}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div aria-hidden="true" aria-labelledby="dataLinkModel" role="dialog" tabIndex="-1" id={"dataLinkModel" + id} className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">{window.LanguageConfig.InputData.Data.Link + '-' + this.state.title}</h4>
                            </div>
                            <div className="modal-body">
                                <DataSelectTabel source={ this.state.selectUrl } ref="selectedTB" data-id={id} />
                                <br />
                                <br />
                                <br />
                                <br />
                            </div>
                            <div className="modal-footer">
                                <button id={'btn_link_ok' + id} type="button" className="btn btn-success" onClick={this.onSelectSubmit} >{window.LanguageConfig.InputData.Data.Confirm}</button>
                                <button id={'btn_link_close' + id} type="button" className="btn btn-default" data-dismiss="modal" >{window.LanguageConfig.InputData.Data.Close}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = DataUploader;