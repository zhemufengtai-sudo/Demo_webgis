/**
 * Created by Franklin on 2017/3/26.
 */

var React = require('react');
var Axios = require('axios');

var SystemSetting = React.createClass({
    getInitialState: function () {
        return {
            loading: true,
            err: null,
            data: null,
            progress: false,
            index : 2 
        };
    },

    componentDidMount: function () {
        this.refresh();
    },

    refresh: function () {
        Axios.get(this.props.source).then(
            data => { this.setState({ loading: false, err: null, data: data.data.data }); },
            err => { this.setState({ loading: false, err: err, data: null }); }
        );
    },

    changeRegisterState: function () {
        var url = '/task';
        var qs;
        if (this.state.data.registered == 1) {
            qs = 'unregister';
        }
        else if (this.state.data.registered == 0) {
            qs = 'register';
        }
        url = url + '/' + qs;
        this.setState({ progress: true });
        Axios.get(url).then(
            msg => {
                let title, detail;
                if (qs == 'register') {
                    if (msg.data['code'] == -1) {
                        title = 'Warning: ';
                        detail = 'Server error, please try again later!';
                        this.setState({ progress: false });
                    }
                    else if (msg.data['code'] == 1) {
                        title = 'Attention: ';
                        detail = 'Registration successful!';
                        this.setState({ progress: false });
                    }
                    $.gritter.add({
                        title: title,
                        text: '<p>' + detail + '</p>',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({ progress: false });
                    this.refresh();
                    return false;
                } else if (qs == 'unregister') {
                    if (msg.data['code'] == -1) {
                        title = 'Warning: ';
                        detail = 'Server error, please try again later!';
                        this.setState({ progress: false });
                    }
                    else if (msg.data['code'] == 1) {
                        title = 'Attention: ';
                        detail = 'Logout Successful!';
                        this.setState({ progress: false });
                    }
                    $.gritter.add({
                        title: title,
                        text: '<p>' + detail + '</p>',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({ progress: false });
                    this.refresh();
                    return false;
                };
            },
            err => {
                $.gritter.add({
                    title: 'Warning:',
                    text: '<p>Server error, please try again later!</p>',
                    sticky: false,
                    time: 2000
                });
                this.setState({ progress: false });
                this.refresh();
                return false;
            }
        );
    },

    registerContainer: function (){
        var selectIndex = this.state.index;
        this.setState({progress: true});
        var url = '/task/register';
        $('#typeChooseModal').modal('hide');
        if(selectIndex == 1){
            let host = $('#taskIP').val();
            let port = $('#taskPort').val();
            url = url + '?type=1&host=' + host + '&port=' + port;

        }else if(selectIndex == 2){
            url = url + '?type=2';    
        }
        Axios.get(url).then(
            msg =>{
                let title, detail;
                if(msg.data['code'] == -1){
                    title = 'Warning: ';
                    detail = 'Server error, please try again later!';
                    this.setState({ progress: false });
                }
                else if (msg.data['code'] == 1) {
                    title = 'Attention: ';
                    detail = 'Registration successful!';
                    $('#taskPort').val('');
                    $('#taskIP').val('');
                    this.setState({ progress: false });
                }
                $.gritter.add({
                    title: title,
                    text: '<p>' + detail + '</p>',
                    sticky: false,
                    time: 2000
                });
                this.setState({ progress: false });
                this.refresh();
                return false;
            },
            err => {
                $.gritter.add({
                    title: 'Warning:',
                    text: '<p>Server error, please try again later!</p>',
                    sticky: false,
                    time: 2000
                });
                this.setState({ progress: false });
                this.refresh();
                return false;
            }
        );
    },

    judgeRegisterState: function(){
        if(this.state.data.registered == 1){
            //has been registered status, don't need to open modal, request directly
            var url = '/task/unregister';
            this.setState({progress: true});
            Axios.get(url).then(
                msg =>{
                    let title, detail;
                    if(msg.data['code'] == -1){
                        title = 'Warning: ';
                        detail = 'Server error, please try again later!';
                        this.setState({ progress: false });
                    }else if(msg.data['code'] == 1){
                        title = 'Attention: ';
                        detail = 'Logout Successful!';
                        this.setState({ progress: false });
                    }
                    $.gritter.add({
                        title: title,
                        text: '<p>' + detail + '</p>',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({ progress: false });
                    this.refresh();
                    return true;
                },
                err =>{
                    $.gritter.add({
                        title: 'Warning:',
                        text: '<p>Server error, please try again later!</p>',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({ progress: false });
                    this.refresh();
                    return false;
                }
            );
        }else{
            $('#typeChooseModal').modal('show');
        }
    },

    onSelectChange: function(e){
        var selectIndex = e.target.selectedIndex;
        if(selectIndex == 1){
            $('#TaskForm')[0].style.display = "block";
            this.setState({index: 1});
            console.log('1status');
        }else{
            $('#TaskForm')[0].style.display = "none";
            this.setState({index: 2});
            console.log('2status');
        }
    },

    render: function () {
        if (this.state.loading) {
            return (<span>loading...</span>);
        }
        if (this.state.err) {
            return (<span>err: {JSON.stringify(this.state.err)}</span>);
        }
        console.log(this.state.index);
        var platform = (<span className="label label-info">Unknown</span>);
        if (this.state.data.platform == 1) {
            platform = (<span className="label label-info"><i className="fa fa-windows"></i> windows</span>);
        }
        else if (this.state.data.platform == 2) {
            platform = (<span className="label label-info"><i className="fa fa-linux"></i> linux</span>);
        }
        var debug = 'False';
        if (this.state.data.debug) {
            debug = 'True';
        }
        var btnDisable = null;
        var progress = null;
        if (this.state.progress) {
            btnDisable = 'disabled';
            progress = (
                <div className="progress progress-striped active progress-sm" style={{ "marginTop": "20px" }}>
                    <div id="upload_bar" style={{ "width": "100%" }} aria-valuemax="100" aria-valuemax="100" aria-valuemin="0" aria-valuenow="0" role="progressbar" className="progress-bar progress-bar-success">
                        <span className="sr-only"></span>
                    </div>
                </div>
            );
        }
        if (this.state.data.registered != -1) {
            var state;
            if (this.state.data.registered == 1)
                state = window.LanguageConfig.Settings.UnRegister;
            else if (this.state.data.registered == 0)
                state = window.LanguageConfig.Settings.Register;
            register = (<button className="btn btn-success btn-sm" type="button" disabled={btnDisable} onClick={e => { this.judgeRegisterState() }}><i className="fa fa-retweet"> </i>{state}</button>)
        }
        return (
            <div className="wrapper">
                <p><strong>{window.LanguageConfig.Settings.Version}&nbsp;:&nbsp;</strong><span>v{this.state.data.version}</span> </p>
                {/* <p><strong>{window.LanguageConfig.Settings.OID}&nbsp;:&nbsp;</strong><span>{this.state.data.oid}</span> </p> */}
                <p><strong>{window.LanguageConfig.Settings.Port}&nbsp;:&nbsp;</strong><span>{this.state.data.port}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.Platform}&nbsp;:&nbsp;</strong><span>{platform}</span> </p>
                {/* <p><strong>{window.LanguageConfig.Settings.DBTitle}&nbsp;:&nbsp;</strong><span>{window.LanguageConfig.Settings.DBName}&nbsp;:&nbsp;{this.state.data.mongodb.name}&nbsp;{window.LanguageConfig.Settings.DBHost}&nbsp;:&nbsp;{this.state.data.mongodb.host}&nbsp;{window.LanguageConfig.Settings.DBPort}&nbsp;:&nbsp;{this.state.data.mongodb.port}</span> </p> */}
                <p><strong>{window.LanguageConfig.Settings.SocketTitle}&nbsp;:&nbsp;</strong><span>{window.LanguageConfig.Settings.SocketHost}&nbsp;:&nbsp;{this.state.data.socket.host}&nbsp;{window.LanguageConfig.Settings.SocketPort}&nbsp;:&nbsp;{this.state.data.socket.port}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.Demarcation}&nbsp;:&nbsp;</strong><span>{this.state.data.data_size}&nbsp;byte</span> </p>
                <p><strong>{window.LanguageConfig.Settings.DebugMode}&nbsp;:&nbsp;</strong><span>{debug}</span> </p>
                {register}
                {progress}
                <div className="modal fade " id="typeChooseModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" type="button" className="close" data-dismiss="modal">
                                    x
                                </button>
                                <h4 className="modal-title" id="myModalLabel">Choose Register Type</h4>
                            </div>
                            <div className="modal-body">
                                <h4>Container Type</h4>
                                <select id="containerType" className="form-control" onChange={this.onSelectChange}>
                                   <option key="InternetNetwork">
                                        Internet Network Type
                                    </option>
                                    <option key="LocalNetwork">
                                        Local Network Type
                                    </option>
                                </select>
                                <form id="TaskForm" style={{"display": "none"}}>
                                    <h4>Register IP</h4>
                                    <div>
                                        <input id="taskIP" name="taskIP" type="text" className="form-control" style={{ "display": "inline" }} />    
                                    </div>
                                    <h4>Register Port</h4>
                                    <div>
                                        <input id="taskPort" name="taskPort" type="text" className="form-control" style={{ "display": "inline" }} />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" onClick={this.registerContainer}>
                                    Finish
                                </button>
                                <button type="button" className="btn btn-default" data-dismiss="modal">
                                    Cancle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = SystemSetting;