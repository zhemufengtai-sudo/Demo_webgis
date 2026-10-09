/**
 * Created by Franklin on 2017/6/19.
 */

var React = require('react');
var Axios = require('axios');
var CopyToClipBoard = require('copy-to-clipboard');

var NoteDialog = require('../../action/utils/noteDialog');
var ModelSerOpera = require('./modelSerOpera');
var ModelSerRunTable = require('../modelSerRun/rmtModelSerRunTable');
var ModelSerRunStatistic = require('../modelSerRun/modelSerRunStatistic');

var ModelSerDetail = React.createClass({
    getInitialState : function(){
        return {
            loading : true,
            behaviors : null,
            err : null,
            ms : null
        };
    },

    componentDidMount : function(){
        this.refresh();
    },

    refresh : function(){
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({
                        loading : false,
                        err : null,
                        ms : data.data.data
                    });
                }
                else{
                    this.setState({
                        loading : false,
                        err : data.data.message,
                        ms : null
                    });
                }
            },
            err => {
                this.setState({
                    loading : false,
                    err : err.message,
                    ms : null
                });
            }
        );
    },

    copyToClipBoard : function(text){
        CopyToClipBoard(text);
        NoteDialog.openNoteDia(window.LanguageConfig.ModelServiceDetail.CopySuccessfully);
    },

    onDeleted : function(){
        if(this.props['data-type'] == 'admin'){
            window.location.href = '/modelser/all';
        }
        else{
            window.location.href = '/public/modelser/all';
        }
    },

    openIODesDia : function(e, msid){
        Axios.get('/modelser/inputdata/json/' + msid).then(
            data => {
                if(data.data.result == 'suc')
                {
                    this.setState({behaviors: data.data.data});
                    $('#mdModelIDDesDia').modal('show');
                }
            },
            err => {}
        );

    },

    render : function(){
        if(this.state.loading){
            return (
                <span>loading...</span>
            );
        }
        if(this.state.err){
            return (
                <span>Error : {JSON.stringify(this.state.err)}</span>
            );
        }
        var platform = null;
        if(this.state.ms.ms_platform == 1){
            platform = (
                <span className="label label-info">
                    <i className="fa fa-windows"></i>&nbsp;
                    windows
                </span>
            )
        }
        else if(this.state.ms.ms_platform == 2){
            platform = (
                <span className="label label-info">
                    <i className="fa fa-linux"></i>&nbsp;
                    linux
                </span>
            )
        }
        else{
            platform = (
                <span className="label label-info">
                    Unknown
                </span>
            )
        }
        var status = null;
        var opera_status = null;
        if(this.state.ms.ms_status == 1){
            opera_status = "started";
            status = (
                <span className="badge badge-success">{window.LanguageConfig.ModelService.Avai}</span>
            )
        }
        else {
            opera_status = "stopped";
            status = (
                <span className="badge badge-default">{window.LanguageConfig.ModelService.Unavai}</span>
            );
        }
        var img = null;
        if((this.state.ms.ms_img != null && this.state.ms.ms_img.trim() != '')){
            if(this.props['data-host'] != undefined){
                // img = (<img width="128" height="128" src={"/modelser/rmt/img/" + this.props['data-host'] + this.state.ms.ms_img } alt={this.state.ms.ms_model.ms_name} />);
                img = (<img width="128" height="128" src="/images/modelImg/default.png" alt={this.state.ms.ms_model.ms_name} />);
            }
            else{
                img = (<img width="128" height="128" src={"/images/modelImg/" + this.state.ms.ms_img } alt={this.state.ms.ms_model.ms_name} />);
            }
        }
        else{
            img = (<img width="128" height="128" src="/images/modelImg/default.png" alt={this.state.ms.ms_model.ms_name} />);
        }
        var moreInfo = null;
        if(this.state.ms.ms_model.m_url && this.state.ms.ms_model.m_url.trim() != ''){
            moreInfo = (<a href={this.state.ms.ms_model.m_url} >MORE</a>);
        }
        var limited = null;
        if(this.state.ms.ms_limited == 1){
            limited = (
                    <span className="label label-warning tooltips" data-toggle="tooltip" data-placement="top" data-original-title={window.LanguageConfig.ModelService.Private} >
                        <i className="fa fa-user" ></i>&nbsp;{window.LanguageConfig.ModelService.Private}
                    </span>);
        }
        else{
            limited = (
                    <span className="label label-success tooltips" data-toggle="tooltip" data-placement="top" data-original-title={window.LanguageConfig.ModelService.Public} >
                        <i className="fa fa-users" ></i>&nbsp;{window.LanguageConfig.ModelService.Public}
                    </span>);
        }
        var permission = null;
        if(this.state.ms.ms_permission == 1){
            permission = (
                    <span className="label label-default tooltips" data-toggle="tooltip" data-placement="top" data-original-title={window.LanguageConfig.ModelService.Auth} >
                        <i className="fa fa-lock" ></i>&nbsp;{window.LanguageConfig.ModelService.Auth}
                    </span>);
        }
        else{
            permission = (
                    <span className="label label-success tooltips" data-toggle="tooltip" data-placement="top" data-original-title="Open" >
                        <i className="fa fa-unlock" ></i>&nbsp;Open
                    </span>);
        }
        var url = window.location.href;
        url = url.substr(0, url.lastIndexOf(':') + 5);
        
        var starting = "/modelser/" + this.state.ms._id + '?ac=start';
        var stopping = "/modelser/" + this.state.ms._id + '?ac=stop';
        var deleting = "/modelser/" + this.state.ms._id;
        var run = "/modelser/preparation/" + this.state.ms._id;

        var modelserOpera = null;
        var records = null;
        var statistic = null;
        if(this.props['data-type'] == 'admin'){
            modelserOpera = (<ModelSerOpera 
                                    data-status={opera_status} 
                                    data-starting={starting}
                                    data-stopping={stopping}
                                    data-deleting={deleting}
                                    data-run={run}
                                    onStarted={this.refresh}
                                    onStopped={this.refresh}
                                    onDeleted={this.onDeleted}
                                        />);
        }
        
        var host = null;
        if(this.props['data-host']){
            host = (
                <p className="muted" >
                    Host&nbsp;:&nbsp;{this.props['data-host']}
                </p>
            );
        }

        var invorkingURL = url + '/public/modelser/preparation/' + this.state.ms._id;
        if(this.props['data-type'] == 'admin'){
            invorkingURL = url + '/modelser/preparation/' + this.state.ms._id
            records = (
                <div className="panel panel-info">
                    <div className="panel-heading" >
                        {window.LanguageConfig.ModelServiceDetail.Records}
                    </div>
                    <div className="panel-body">
                        <header className="panel-heading"> {window.LanguageConfig.ModelServiceDetail.RecordsStatistic} </header>
                        <ModelSerRunStatistic 
                            data-source={this.props['data-source-msrstatistic']}
                            />
                        <br />
                        <br />
                        <br />
                        <header className="panel-heading"> {window.LanguageConfig.ModelServiceDetail.RecordsTable} </header>
                        <ModelSerRunTable 
                            data-source={this.props['data-source-msr']}
                            data-type="rms"
                            data-host={this.props['data-host']}
                            />
                    </div>
                </div>
            );
        }
        var behaviorsinfo = null;
        if(this.state.behaviors != null){
            var behaviorsinfo = this.state.behaviors.States.map(function(State, sIndex){
                var mark = true;
                // var EventHead = State.Event.map(function(Event){
                //     var tag = '';
                //     var flag = '';
                //     if(mark)
                //     {
                //         tag = 'active';
                //         mark = false;
                //     }
                //     return (
                //         <li key={'head' + State.$.id + '_' + Event.$.name} className={tag}>
                //             <a style={{ paddingRight : '8px !important' }} href={'#' + State.$.id + '_' + Event.$.name} data-toggle="tab">
                //                 <i className="fa fa-flash"> </i>{Event.$.name} &nbsp;{flag}&nbsp;&nbsp;&nbsp;&nbsp;
                //             </a>
                //         </li>
                //     );
                // }.bind(this));
    
                var EventBody = State.Event.map(function(Event, eIndex){
                    var tag = '';
                    var optional = null;
                    var dataType = 'SELECT'; 
                    if(this.props['data-type'] == 'CUSTOM'){
                        dataType = 'CUSTOM';
                    }
                    if(Event.$.type == 'response'){
                        if(Event.$.optional == '1'){
                            optional = (<h4 style={{color : '#66CD00' }}><strong>{window.LanguageConfig.InputData.Event.Control}</strong></h4>);
                        }
                        else{
                            optional = (<h4 style={{color : '#D2691E' }}><strong>{window.LanguageConfig.InputData.Event.Required}</strong></h4>);
                        }
                    }
                    else if(Event.$.type == 'noresponse'){
                        optional = (<h4 style={{color : '#6495ED' }}><strong>{window.LanguageConfig.InputData.Event.Response}</strong></h4>);
                    }
                    var udxDec = null;
                    if(Event.UDXDeclaration){
                        udxDec = Event.UDXDeclaration.$.name + ' - ' + Event.UDXDeclaration.$.description;
                    }
                    return (
                        <div className="panel" key={'body' + State.$.id + '_' + Event.$.name}>
                            <div className="panel-heading blue">
                                <h4 className="panel-title">
                                    <a className="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion2" href={ '#' + State.$.id + '_' + Event.$.name}>
                                        <i className="fa fa-flash"> </i>{Event.$.name}
                                    </a>
                                </h4>
                            </div>
                            <div id={State.$.id + '_' + Event.$.name} className="panel-collapse collapse" style={{ "height" : "auto"}}>
                                <div className="panel-body">
                                    {optional}
                                    <p><strong>{window.LanguageConfig.InputData.Event.Name} : </strong>{Event.$.name} <button title="Copy" className="btn btn-default btn-xs" onClick={ (e) => { this.copyToClipBoard(Event.$.name) } } ><i className="fa fa-files-o" ></i> </button> </p>
                                    <p><strong>{window.LanguageConfig.InputData.Event.Type} : </strong>{Event.$.type}</p>
                                    <p><strong>{window.LanguageConfig.InputData.Event.Description} : </strong>{Event.$.description}</p>
                                    <p><strong>{window.LanguageConfig.InputData.Event.DataReference} : </strong>{udxDec}</p>
                                </div>
                            </div>
                        </div>
                    );
                }.bind(this));
    
                return(
                    <div key={State.$.id} className="panel-body">
                        <h4 style={{color : '#9ad717'}}><strong>State {sIndex + 1}</strong></h4>
                        <p><strong>{window.LanguageConfig.InputData.State.Name}&nbsp;:&nbsp;</strong>{State.$.name} <button title="Copy" className="btn btn-default btn-xs" onClick={ (e) => { this.copyToClipBoard(State.$.name) } } ><i className="fa fa-files-o" ></i> </button> </p>
                        <p><strong>{window.LanguageConfig.InputData.State.ID}&nbsp;:&nbsp;</strong>{State.$.id} <button title="Copy" className="btn btn-default btn-xs" onClick={ (e) => { this.copyToClipBoard(State.$.id) } } ><i className="fa fa-files-o" ></i> </button></p>
                        <p><strong>{window.LanguageConfig.InputData.State.Description}&nbsp;:&nbsp;</strong>{State.$.description}</p>
                        <p><strong>{window.LanguageConfig.InputData.State.Type}&nbsp;:&nbsp;</strong>{State.$.type}</p>
                        <br />
                        <h4><strong>Event</strong></h4>
                        <section className="panel-group">
                            {EventBody}
                        </section>
                    </div>);
            }.bind(this));
        }
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-body">
                        <div className="row">
                            <div className="col-md-2">
                                <div className="blog-img">
                                    {img}
                                </div>
                            </div>
                            <div className="col-md-7">
                                <h1 className="mtop35">{ this.state.ms.ms_model.m_name }</h1>
                                <p className="muted" >
                                    {window.LanguageConfig.ModelServiceDetail.Deployer}&nbsp;:&nbsp;{ this.state.ms.ms_user.u_name }&nbsp;&nbsp;&nbsp;&nbsp;
                                    Email&nbsp;:&nbsp;{ this.state.ms.ms_user.u_email }
                                </p>
                                <p className="muted" >
                                    {window.LanguageConfig.ModelService.Type}&nbsp;:&nbsp;{ this.state.ms.ms_model.m_type }
                                </p >
                                <p className="muted" >
                                    {window.LanguageConfig.ModelService.Version}&nbsp;:&nbsp;{ this.state.ms.mv_num }
                                </p>
                                {host}
                                <p className="muted" >
                                    {window.LanguageConfig.ModelService.Platform}&nbsp;:&nbsp;{platform}
                                </p>
                                <p className="muted" >
                                    {window.LanguageConfig.ModelServiceDetail.DeploymentTime}&nbsp;:&nbsp;{ this.state.ms.ms_update }
                                </p>
                                <p className="muted" >
                                    {window.LanguageConfig.ModelService.Status}&nbsp;:&nbsp;{status}
                                </p>
                                <p className="muted" >
                                    {window.LanguageConfig.ModelService.Accessibility}&nbsp;:&nbsp;{limited}
                                </p>
                                <p className="muted" >
                                    {window.LanguageConfig.ModelService.Permission}&nbsp;:&nbsp;{permission}
                                </p>
                                    {window.LanguageConfig.ModelServiceDetail.PublicInvoking}&nbsp;:&nbsp;
                                <div className="input-group m-bot15">
                                    <span className="input-group-btn">
                                        <button title={window.LanguageConfig.ModelServiceDetail.Copy} type="button" className="btn btn-default" onClick={ (e) => { this.copyToClipBoard(url + '/public/modelser/preparation/' + this.state.ms._id); } } ><i className="fa fa-files-o"></i></button>
                                        <button title={window.LanguageConfig.ModelServiceDetail.PublicInvoking} type="button" className="btn btn-default" onClick={ (e) => { window.open(invorkingURL); } } ><i className="fa fa-retweet"></i></button>
                                    </span>
                                    <input type="text" readOnly="readonly" className="form-control" value={url + '/public/modelser/preparation/' + this.state.ms._id} />
                                </div>
                                {window.LanguageConfig.ModelServiceDetail.API}&nbsp;:&nbsp;
                                <div className="input-group m-bot15">
                                    <span className="input-group-btn">
                                        <button title={window.LanguageConfig.ModelServiceDetail.Copy} type="button" className="btn btn-default" onClick={ (e) => { this.copyToClipBoard(url + '/modelser/preparation/' + this.state.ms._id); } } ><i className="fa fa-files-o"></i></button>
                                        <button title="Behaviors Description" type="button" className="btn btn-default" onClick={ (e) => { this.openIODesDia(e, this.state.ms._id) } } ><i className="fa fa-bolt"></i></button>
                                    </span>
                                    <input type="text" readOnly="readonly" className="form-control" value={url + '/modelser/' + this.state.ms._id + '?ac=run&inputdata=[]&outputdate=[]&auth="YOUR TOKEN"'} />
                                </div>
                                <p className="muted" >
                                    {window.LanguageConfig.ModelServiceDetail.Description}&nbsp;:&nbsp;
                                    { this.state.ms.ms_des }

                                </p>
                                {moreInfo}
                                <br />
                                <br />
                                
                            </div>
                        </div>
                    </div>
                </div>
                {records}
                <div aria-hidden="true" aria-labelledby="mdModelIODescription" role="dialog" tabIndex="-1" id="mdModelIDDesDia" style={{"zIndex":"1050"}}  className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">{window.LanguageConfig.ModelServiceDetail.BehaviorsDescription}</h4>
                            </div>
                            <div className="modal-body">
                            {window.LanguageConfig.ModelServiceDetail.ModelServiceID} : {this.state.ms._id}  <button title="Copy" className="btn btn-default btn-xs" onClick={ (e) => { this.copyToClipBoard(this.state.ms._id) } } ><i className="fa fa-files-o" ></i> </button>
                            {behaviorsinfo}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">{window.LanguageConfig.InputData.Data.Close}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerDetail;