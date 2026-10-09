/**
 * Created by wangming on 2018/1/24.
 */
var React = require('react');
var Axios = require('axios');
var NoteDialog = require('../../action/utils/noteDialog');

var VisualizeSerDeployment = React.createClass({

    getInitialState: function () {
        var urlUpload = '/dataVisualize';
        var urlFinished = '/dataVisualize/all';
        var urlFile = '/dataVisualize/file';
        return {
            urlUpload: urlUpload,
            urlFinished: urlFinished,
            urlFile: urlFile,
            progressbar: false,
            progresspercet: 0,
            fileFinished: false,
            fieldFinished: false,
            oid: null
        }
    },

    componentDidMount: function () {

    },

    onSubmit: function (e) {
        if ($('#file_modelSer').val() == '') {
            NoteDialog.openNoteDia('Info', 'Please Choose Package!');
            return false;
        }
        //判断上传的模型部署包是否为zip格式
        if ($('#file_name').text().split('.')[1] != 'zip') {
            NoteDialog.openNoteDia('Warning', 'Please choose a zip file');
            return false;
        }
        this.setState({ progressbar: true });

        var formdata = new FormData($('#deployForm')[0]);

        $.ajax({
            url: this.state.urlUpload,
            method: 'POST',
            data: formdata,
            processData: false,
            contentType: false,
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

    onFieldFinished: function (msg) {
        msg = JSON.parse(msg);
        if (msg.result == 'suc') {
            var oid = msg.data._id;
            this.setState({ fieldFinished: true, oid: oid });
            this.checkFinished();
        } else if (msg.result == 'err') {
            msg = msg.message;
            console.log(msg);
            //后面写错误对应机制
            if (msg.status == 0) {
                //系统错误
                NoteDialog.openNoteDia('System Error', 'Please try later!');
            } else if (msg.status == 1) {
                if (msg.isValidate) {
                }
                else {
                    if (!msg.cfg) {
                        NoteDialog.openNoteDia('package Error', 'Lack of DataVisualizationMethod file!');
                    }
                }
            }else{
                NoteDialog.openNoteDia('Unknown error', JSON.stringify(msg));
            }
        }
    },

    checkFinished: function () {
        if (this.state.fileFinished && this.state.fieldFinished) {
            window.location.href = this.state.urlFinished;
        }
    },

    render: function () {
        var procBar = null;
        var btnEnable = '';
        if (this.state.progressbar) {
            procBar = (
                <div id="div_upload">
                    Current Progress:
                  <br />
                    <div className="progress progress-striped active progress-sm">
                        <div id="upload_bar" style={{ "width": this.state.progresspercet + '%' }} aria-valuemax="100" aria-valuemin="0" aria-valuenow="0" role="progressbar" className="progress-bar progress-bar-success">
                            <span className="sr-only">{this.state.progresspercet}% Complete</span>
                        </div>
                    </div>
                </div>
            );
            btnEnable = 'disable';
        }

        return (
            <div className="container-fluid">
                <div className="row col-md-7 col-md-offset-3">
                    <div className="panel panel-primary">
                        <header className="panel-heading">
                            Uploader &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </header>
                        <div className="panel-body">
                            <form id="deployForm" className="form-horizontal left-align form-well" action="/dataVisualize" method="post" encType="multipart/form-data">
                                <fieldset style={{ "padding": "15px" }}>
                                    <div className="form-group">
                                        <label htmlFor="vs_limited" className="control-label"><strong>Authority<font color='red'>(*)</font></strong></label>
                                        <select id="vs_limited" className="form-control" name="vs_limited">
                                            <option value="0">Public</option>
                                            <option value="1">Private</option>
                                        </select>

                                    </div>
                                    <div className="form-group">

                                        <label className="control-label"><strong>Snapshot</strong></label>
                                        <div className="fileupload fileupload-new" data-provides="fileupload">
                                            <div id="snapshotContainer" className="fileupload-new thumbnail" style={{ "width": "200px", "height": "150px" }}>
                                                <img src="http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image" alt="" />
                                            </div>
                                            <div className="fileupload-preview fileupload-exists thumbnail" style={{ "maxWidth": "200px", "maxHeight": "150px", "lineHeight": "20px" }}>
                                            </div><br />
                                            <span className="btn btn-default btn-file">
                                                <span className="fileupload-new"><i className="fa fa-paper-clip"></i> Select images</span>
                                                <span className="fileupload-exists"><i className="fa fa-undo"></i> Change</span>
                                                <input id="file_img" name="ms_img" type="file" className="default" accept=".png,.jpg" />
                                            </span>
                                            <a href="#" className="btn btn-danger fileupload-exists" data-dismiss="fileupload"><i className="fa fa-trash"></i> Remove</a>
                                        </div>

                                    </div>
                                    <div className="form-group">
                                        <label className="control-label"><strong>Choose Zip File</strong></label>
                                        <div className="fileupload fileupload-new" data-provides="fileupload">
                                            <span className="btn btn-default btn-file">
                                                <span className="fileupload-new"><i className="fa fa-paper-clip"></i> Select</span>
                                                <span className="fileupload-exists"><i className="fa fa-undo"></i> Change</span>
                                                <input id="file_modelSer" name="file_visualize" type="file" className="default" accept="application/zip" />
                                            </span>
                                            <span id="file_name" className="fileupload-preview" style={{ "marginLeft": "5px" }}></span>
                                            <a href="#" className="close fileupload-exists" data-dismiss="fileupload" style={{ "float": "none", "marginLeft": "5px" }}></a>
                                            <br />
                                            <br />
                                        </div>
                                    </div>
                                </fieldset>
                                <div className="form-group">
                                    <label className="control-label"></label>
                                    <button className="btn btn-info" type="button" onClick={this.onSubmit}>Submit</button>
                                </div>
                            </form>
                            {procBar}
                        </div>

                    </div>

                </div>
            </div>
        )
    }

});

module.exports = VisualizeSerDeployment;