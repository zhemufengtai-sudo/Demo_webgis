// created by wangming at 2018.2.5

var React = require('react');
var Axios = require('axios');
var PortalInfo = require('./portalInfo');
var NoteDialog = require('../../action/utils/noteDialog');
var Crypto = require('../../action/utils/crypto');

var CheckServerIP = React.createClass({
    getInitialState: function(){
        return {
            visualize: true,
            processBar: false,
            warning : null
        };
    },

    componentDidMount: function(){
        this.refresh();
    },

    refresh : function(){
        Axios.get('json/checkIP').then(
            msg =>{
                var title, detail;
                if(msg.data['status'] == -1){
                    title = 'Warning: ';
                    detail = 'Error in getting IP information!';
                    this.setState({visualize: false});
                }else if(msg.data['status'] == 0){
                    detail = null;
                    this.setState({visualize: false});
                }else if(msg.data['status'] == 1){
                    title = 'Attention: ';
                    detail = 'The Local IP changes and the portal service resource cannot be used normally. Please update the registration information!';
                }
                if(detail){
                    $.gritter.add({
                        title: title,
                        text: '<p>' + detail + '</p>',
                        sticky: false,
                        time: 2000
                    });
                }

            },
            err =>{

            }
        ).then(
           () =>{ $('#portalInfoDia').modal('show');}
        )
    },

    onSubmit: function(){
        var portalname = $('#txtPortalName').val();
        var portalpwd = Crypto.crypto($('#txtPortalPwdNew').val());
        this.setState({processBar : true});
        Axios.put('/json/checkIP?portalname=' + portalname + '&portalpwd=' + portalpwd).then(
            data =>{
                if(data.data.result == 'suc'){
                    NoteDialog.openNoteDia('Info!', 'Machine Register Information update successfully!');
                    this.dialogClose();
                    this.refresh();
                }else{
                    this.setState({warning: 'Fail!'});
                }
                this.setState({processBar : false});
            },
            err =>{}
        );
        
    },

    dialogClose: function(){
        $('#portalInfoDia').modal('hide');
    },
    
    render: function(){
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
        var warning = null;
        if(this.state.warning){
            warning = (
                <div className="alert alert-block alert-danger fade in">
                    <strong>{this.state.warning}</strong>
                </div>
            );
        }
        var modalDialog = null;
        if(this.state.visualize){
            modalDialog = (
                <div aria-hidden="true" aria-labelledby="portalInfoDia" role="dialog" tabIndex="-1" id="portalInfoDia" style={{"zIndex":"1050"}} className="modal fade">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                            <h4 className="modal-title">Update the Information of Register </h4>
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
            );
        }
        return (
            <div>
               {modalDialog}
            </div> 
        )
    }

});

module.exports = CheckServerIP;