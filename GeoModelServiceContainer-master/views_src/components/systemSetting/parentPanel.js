/**
 * Created by Franklin on 2017/3/27.
 */
var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');

var ParentPanel = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            parent : null,
            proParentHost : '',
            proParentPort : '',
            btn_parent : false
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    disablePatentBtn : function(){
        this.setState({btn_parent : false});
    },

    getToken : function(){
        var ip = $('#txtTargetHost').val();
        if(ip.trim() == ''){
            return;
        }
        Axios.get('/token?ip=' + ip).then(
            data => {
                if(data.data.result == 'suc'){
                    $('#txtToken').val(data.data.data);   
                }
            },
            err => {}
        );
    },

    refresh : function () {
        Axios.get(this.props.source).then(
            data => {
                if (data.data.result == 'err') {
                    this.setState({ loading: false, err: data.data.message });
                }
                else {
                    if (data.data.data) {
                        this.setState({ loading: false, err: false, parent: data.data.data.ss_value });
                    }
                    else {
                        this.setState({ loading: false, err: false, parent: null });
                    }
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    openDialog : function(){
        $('#diaParent').modal('open');
    },

    checkServer : function() {
        var port = '8060';
        if($('#txtNewParentHost').val().trim() == ''){
            return;
        }
        if($('#txtNewParentPort').val().trim() != ''){
            port = $('#txtNewParentPort').val();
        }
        Axios.get('/checkserver/' + $('#txtNewParentHost').val() + ':' + port).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({proParentHost : $('#txtNewParentHost').val(), proParentPort : port});
                    this.setState({btn_parent : true});
                }
                else{
                    this.setState({btn_parent : false});
                }
            },
            err => {}
        );
    },

    onSubmit : function(e) {
        Axios.put('/parent?host=' + this.state.proParentHost + '&' + 'port=' + this.state.proParentPort)
            .then(
            data => {
                if (data.data.result == 'suc') {
                    if (data.data.data.data.host == '127.0.0.1') {
                        NoteDialog.openNoteDia('父节点更换为本机成功！', '父节点更换为本机成功: ' + this.state.proParentHost);
                        $('#diaParent').modal('hide');
                        this.refresh();
                    } else {
                        NoteDialog.openNoteDia('父节点变更成功！', '父节点变更成功: ' + this.state.proParentHost);
                        $('#diaParent').modal('hide');
                        this.refresh();
                    }

                } else if (data.data.result == 'err') {
                    NoteDialog.openNoteDia('父节点变更错误！', '父节点变更错误: ' + this.state.proParentHost);
                }
            },
            err => { }
            );
    },

    render : function () {
        if(this.state.loading){
            return (
                <span>loading...</span>
            );
        }
        if(this.state.err){
            return (
                <span>Error : { JSON.stringify(this.state.err) }</span>
            );
        }
        var parentDisable = 'disabled';
        if(this.state.btn_parent){
            parentDisable = null;
        }
        return (
            <div>
                <p><strong>Parent IP</strong>&nbsp;:&nbsp;<span>{this.state.parent}</span></p>
                <button className="btn btn-info" data-toggle="modal" href="#diaParent" >Change Parent Node</button> &nbsp;&nbsp;
                <button className="btn btn-info" data-toggle="modal" href="#diaToken" >Get Token</button>
                <div aria-hidden="true" aria-labelledby="parentAlterDialog" role="dialog" tabIndex="-1" id="diaParent" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">Change Parent Node</h4>
                            </div>
                            <div className="modal-body">
                                <form className="form-horizontal" >
                                    <strong>Current Parent Node</strong>&nbsp;:&nbsp;{this.state.parent}<br />
                                    <label htmlFor="txtNewParentHost" >Host</label>
                                    <input id="txtNewParentHost" placeholder="127.0.0.1" type="text" className="form-control" onBlur={this.checkServer} onFocus={this.disablePatentBtn} />
                                    <label htmlFor="txtNewParentPort" >Port</label>
                                    <input id="txtNewParentPort" placeholder="8060" type="text" className="form-control" onBlur={this.checkServer} onFocus={this.disablePatentBtn} />
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button id="btn_close" type="button" className="btn btn-default" data-dismiss="modal" >Close</button>
                                <button id="btn_ok" type="button" className="btn btn-success" disabled={parentDisable} onClick={this.onSubmit } >Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div aria-hidden="true" aria-labelledby="diaToken" role="dialog" tabIndex="-1" id="diaToken" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">Get Token</h4>
                            </div>
                            <div className="modal-body">
                                <form className="form-horizontal" >
                                    <label htmlFor="txtTargetHost" >Target Host</label>
                                    <input id="txtTargetHost" placeholder="127.0.0.1" type="text" className="form-control"  />
                                    <label htmlFor="txtToken" >Token</label>
                                    <input id="txtToken" readOnly="readOnly" type="text" className="form-control" />
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button id="btn_token_close" type="button" className="btn btn-default" data-dismiss="modal" >Close</button>
                                <button id="btn_token_ok" type="button" className="btn btn-success" onClick={this.getToken } >Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ParentPanel;