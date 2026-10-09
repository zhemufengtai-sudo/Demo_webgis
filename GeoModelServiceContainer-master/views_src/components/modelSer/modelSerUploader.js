/**
 * Created by Franklin on 2017/4/29.
 */

var React = require('react');
var Axios = require('axios');

var ModelItemSelect = require('./modelItemSelect');
var PortalInfo = require('../systemSetting/portalInfo');
var NoteDialog = require('../../action/utils/noteDialog');
var ModelSerFlowSelect = require('./modelSerFlowSelect')

var ModelSerUploader = React.createClass({
    getInitialState : function () {
        return {
            processBar : false,
            stepy : null
        };
    },

    componentDidMount : function(){
        var stepy = $('#stepy_form').stepy({
            backLabel: '上一步',
            nextLabel: '下一步',
            errorImage: true,
            block: false,
            description: true,
            legend: true,
            titleClick: true,
            titleTarget: '#top_tabby',
            validate: false,
            finishButton:true,
            finish: function() {
                var formData = $('#stepy_form').serialize();
                this.setState({ processBar : true });
                Axios.get('/modelser/' + this.props['data-msid'] + '?ac=upload&' + formData).then(
                    data => {
                        if(data.data.result == 'suc'){
                            NoteDialog.openNoteDia('模型注册成功！','模型 ' + $('#pkg_name').val() + ' 注册成功！');
                            setTimeout(function(){
                                window.location.href = '/modelser/all';
                            }, 3000);
                        }
                        else{
                            NoteDialog.openNoteDia('模型注册失败！','模型包 ' + $('#pkg_name').val() + ' 上传失败！Message : ' + JSON.stringify(data.data.message));
                        }
                        this.setState({ processBar : false });
                    },
                    err => {
                            NoteDialog.openNoteDia('模型注册失败！','模型包 ' + $('#pkg_name').val() + ' 上传失败！Message : ' + JSON.stringify(err));
                    }
                );
                return false;
            }.bind(this)
        });
        
        $('#stepy_form').validate({
            errorPlacement: function(error, element) {
                error.css(''
                );
                $('#stepy_form div.stepy-error').append(error);
            },
            rules: {
                pkg_name: 'required'
            },
            messages: {
                u_name: {
                    pkg_name: '请填写部署包名称!'
                }
            }
        });

        this.setState({stepy : stepy});

        Axios.get('/modelSer/json/' + this.props['data-msid']).then(
            data => {
                if(data.data.res == 'suc'){
                    $('#pkg_name').val(data.data.modelSer.ms_model.m_name);
                    $('#pkg_version').val(data.data.modelSer.mv_num);
                    $('#pkg_des').val(data.data.modelSer.ms_des);
                }
            },
            err => {}
        );
    },

    onSelectedModelItem : function(e, item){
        $('#mid').val(item.model_id);
        $('#mname').val(item.model_name);
        $('#stepy_form-title-1').click();
    },

    render : function(){
        var procBar = null;
        var btnDisabled = null;
        if(this.state.processBar){
            procBar = (
                <div className="progress progress-striped active progress-sm">
                    <div style={ { 'width' : '100%' }} aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" className="progress-bar progress-bar-success">
                        <span className="sr-only"> </span>
                    </div>
                </div>
            );
            btnDisabled = 'disabled';
        }
        return (
            <div className="box-widget">
                <div className="widget-head clearfix">
                    <div id="top_tabby" className="block-tabby pull-left"></div>
                </div>
                <div className="widget-container">
                    <div className="widget-block">
                        <div className="widget-content box-padding">
                            <form id="stepy_form" className="form-horizontal left-align form-well" >
                                <fieldset title="步骤 1">
                                    <legend>条目分类</legend>
                                    <ModelItemSelect 
                                        data-source={this.props['data-source-category']} 
                                        data-btn-text="选择" 
                                        data-pulltag="false"
                                        onSelectedItem={ this.onSelectedModelItem } />
                                </fieldset>
                                <fieldset title="步骤 2">
                                    <legend>信息确认</legend>
                                    <div className="form-group">
                                        <label className="col-md-2 col-sm-2 control-label">部署包名称</label>
                                        <div className="col-md-6 col-sm-6">
                                            <input name="pkg_name" className="form-control" placeholder="模型部署包名称" id="pkg_name" type="text"/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-md-2 col-sm-2 control-label">模型条目</label>
                                        <div className="col-md-6 col-sm-6">
                                            <input name="mid" className="form-control" placeholder="模型条目ID" id="mid" readOnly="readOnly" type="hidden" />
                                            <input name="mname" className="form-control" placeholder="模型条目" id="mname" readOnly="readOnly" type="text" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-md-2 col-sm-2 control-label">版本</label>
                                        <div className="col-md-6 col-sm-6">
                                            <input name="pkg_version" className="form-control" placeholder="模型版本号" id="pkg_version" type="text"/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-md-2 col-sm-2 control-label">选择框图模型</label>
                                        <div className="col-lg-10">
                                            <ModelSerFlowSelect />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-md-2 col-sm-2 control-label">门户信息</label>
                                        <div className="col-md-6 col-sm-6">
                                            <PortalInfo />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-md-2 col-sm-2 control-label">描述</label>
                                        <div className="col-md-6 col-sm-6">
                                            <textarea name="pkg_des" placeholder="模型部署包描述" className="form-control" id="pkg_des" rows="5" />
                                        </div>
                                    </div>
                                </fieldset>
                                <button id="btn_ok" name="btn_upload" type="button" disabled={btnDisabled} className="finish btn btn-info btn-extend" >提交</button>
                            </form>
                        </div>
                    </div>
                    {procBar}
                </div>
            </div>
        );
    }
});

module.exports = ModelSerUploader;