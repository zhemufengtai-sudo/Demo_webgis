/**
 * Created by Franklin on 2017/5/14.
 */

var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');
var Crypto = require('../../action/utils/crypto');

var PortalInfo = React.createClass({
    getInitialState : function(){
        return {
            loading : true,
            err : false,
            data : null,
            processBar : false,
            warning : null
        };
    },

    componentDidMount : function(){
        this.refresh();
    },

    refresh : function(){
        Axios.get('/json/portalinfo').then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({loading : false, data : data.data.data});
                }
                else if(data.data.result == 'err'){
                    this.setState({loading : false, err : data.data.message});
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    onSubmit : function(){
        var portalname = $('#txtPortalName').val();
        var portalpwd = Crypto.crypto($('#txtPortalPwdNew').val());

        Axios.put('/json/portalinfo?portalname=' + portalname + '&portalpwd=' + portalpwd).then(
            data => {
                if(data.data.result == 'suc'){
                    NoteDialog.openNoteDia('Info!', 'Portal Account Information update successfully!');
                    this.dialogClose();
                    this.refresh();
                }
                else{
                    this.setState({warning : 'Fail!'});
                }
                this.setState({processBar : false});
            },
            err => {}
        );
        this.setState({processBar : true});
    },
    

    onUnregister : function(){
        if(confirm('Sure to unregister') == true){
            Axios.delete('/json/portalinfo').then(
                data => {
                    if(data.data.result == 'suc'){
                        NoteDialog.openNoteDia('Info!', 'Portal Account Information unregister successfully!');
                        this.refresh();
                    }
                },
                err => {}
            );
        }
    },

    onRefresh : function(){
        Axios.put('/json/portalinfo?ac=refresh&portalname=' + this.state.data).then(
            data => {
                if(data.data.result == 'suc'){
                    NoteDialog.openNoteDia('Info!', 'Portal Account Information update successfully!');
                    this.refresh();
                }
            },
            err => {}
        );
    },

    dialogClose : function(){
        $('#portalInfoDia').modal('hide');
    },

    render : function(){
        if(this.state.loading){
            return (<span>loading...</span>);
        }
        if(this.state.err){
            return (<span>Error: {JSON.stringify(this.state.err)}</span>);
        }
        var warning = null;
        if(this.state.warning){
            warning = (
                <div className="alert alert-block alert-danger fade in">
                    <strong>{this.state.warning}</strong>
                </div>
            );
        }
        var processBar = null;
        var btnDisabled = null;
        if(this.state.processBar){
            processBar = (
                <div className="progress progress-striped active progress-sm">
                    <div style={ { 'width' : '100%' }} aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" className="progress-bar progress-bar-success">
                        <span className="sr-only"> </span>
                    </div>
                </div>
            );
            btnDisabled = 'disabled';
        }
        var setBtn = null;
        var unregister = null;
        var refresh = null;
        if(this.props['data-type'] != 'show'){
            setBtn = (<button className="btn btn-sm btn-info"  data-toggle="modal"
                        data-target="#portalInfoDia" >Set</button>);
        }
        if(this.state.data != 'username'){
            unregister = (<button className="btn btn-sm btn-warning" onClick={this.onUnregister} >Unregister</button>);
            refresh = (<button className="btn btn-sm btn-success" onClick={this.onRefresh} >Refresh</button>);
        }
        return (
            <div>
                <p>Portal Account User Name: {this.state.data} &nbsp;&nbsp;&nbsp;{setBtn}&nbsp;{unregister}&nbsp;{refresh}</p>
                <div aria-hidden="true" aria-labelledby="portalInfoDia" role="dialog" tabIndex="-1" id="portalInfoDia" style={{"zIndex":"1050"}} className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">Set Portal Account</h4>
                            </div>
                            <div className="modal-body">
                                <label htmlFor="txtPortalName" className="control-label" style={{ "textAlign" : "left"}}>Portal User Name : </label>
                                <input id="txtPortalName" name="txtPortalName" type="text" placeholder="User Name" className="form-control"/>
                                <label htmlFor="txtPortalPwdNew" className="control-label" style={{ "texAlign" : "left"}}>Portal Password : </label>
                                <input id="txtPortalPwdNew" name="txtPortalPwdNew" type="password" className="form-control"/>
                                <br />
                                {processBar}
                                {warning}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" onClick={this.onSubmit} disabled={btnDisabled} >Confirm</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal" >Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PortalInfo;