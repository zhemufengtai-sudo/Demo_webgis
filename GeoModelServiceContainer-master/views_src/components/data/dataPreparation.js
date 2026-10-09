/**
 * Created by Franklin on 2017/4/5.
 */
var React = require('react');
var Axios = require('axios');

var DataUpLoader = require('./dataUploader');

var DataPreparation = React.createClass({
    getInitialState : function () {
        var rmt = 0;
        var host = '';
        if(this.props['data-type'] == 'rmt'){
            rmt = 1;
            host = this.props['data-host'];
        }

        return {
            rmt : rmt,
            host : host,
            states : [],
            pms : null,
            allInputData : [],
            allOutputData : [],
            loading : true,
            permission : 0,
            authToken : ''
        };
    },

    componentDidMount : function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'suc')
                {
                    data.data.data.Params['cp'] = {};
                    this.setState({states : data.data.data.States, loading : false, pms : data.data.data.Params, permission : data.data.data.Permission});
                    this.state.states.map(function(State){
                        State.Event.map(function(Event){
                            if(Event.$.type == 'response'){
                                this.state.allInputData.push({
                                    StateId : State.$.id,
                                    StateName : State.$.name,
                                    StateDes : State.$.description,
                                    Event : Event.$.name,
                                    DataId : '',
                                    Tag : '',
                                    Destroyed : false,
                                    Optional : Event.$.optional
                                });
                            }
                            else if(Event.$.type == 'noresponse'){
                                this.state.allOutputData.push({
                                    StateId : State.$.id,
                                    StateName : State.$.name,
                                    StateDes : State.$.description,
                                    Event : Event.$.name,
                                    Destroyed : false,
                                    Tag : ''
                                });
                            }
                        }.bind(this));

                        window.allInputData = this.state.allInputData;
                        window.allOutputData = this.state.allOutputData;
                        window.authToken = this.state.authToken;
                        window.limited = this.state.limited;
                        window.addGeoData = this.onDataReady;
                        window.checkGeoData = this.checkGeoData;
                        window.addTestData = this.addTestData;

                    }.bind(this));
                }
            },
            err => {}
        );
    },

    onDataReady : function(stateId, eventName, gdid, tag){
        for(var i = 0; i < this.state.allInputData.length; i++)
        {
            if(this.state.allInputData[i].StateId == stateId && this.state.allInputData[i].Event == eventName)
            {
                this.state.allInputData[i].DataId = gdid;
                this.state.allInputData[i].Tag = tag;
                break;
            }
        }
        this.forceUpdate();
    },

    addTestData: function(StateId,eventName,gdid){
       for(var i =0 ; i < this.state.allInputData.length; i++){
           if(this.state.allInputData[i].StateId == StateId && this.state.allInputData[i].Event == eventName){
               this.state.allInputData[i].DataId = gdid;
               this.state.allInputData[i].Tag = this.state.allInputData[i].StateName + '-' + eventName;
               break;
           }
       }
       this.forceUpdate();
    },

    onRemoveData : function(e, stateId, eventName){
        if(confirm("Remove this data?"))
        {
            for(var i = 0; i < this.state.allInputData.length; i++)
            {
                if(this.state.allInputData[i].StateId == stateId && this.state.allInputData[i].Event == eventName)
                {
                    this.state.allInputData[i].DataId = '';
                    this.forceUpdate();
                    break;
                }
            }
        }
    },

    getDataState : function(stateId, eventName){
        for(var i = 0; i < this.state.allInputData.length; i++)
        {
            if(this.state.allInputData[i].StateId == stateId && this.state.allInputData[i].Event == eventName && this.state.allInputData[i].DataId != '')
            {
                var fname = null;
                var tag = allInputData[i].Tag;
                if(tag != null && tag != ''){
                    fname = tag;
                }
                else{
                    fname = allInputData[i].DataId;
                }
                return (
                    <p id={ 'data_pre_p_' + stateId + '_' + eventName }>
                        <strong>{window.LanguageConfig.InputData.Event.Ready}&nbsp;:&nbsp;</strong><span className="label label-success">{window.LanguageConfig.InputData.Event.DataReady}</span>&nbsp;&nbsp;
                        { fname }&nbsp;&nbsp;
                        <button className="btn btn-danger btn-xs" onClick={(e) => { this.onRemoveData(e, stateId, eventName) }} >{window.LanguageConfig.InputData.Event.DataRemove}</button>
                    </p>
                );
            }
        }
        return (<p id={ 'data_pre_p_' + stateId + '_' + eventName }><strong>{window.LanguageConfig.InputData.Event.Ready}&nbsp;:&nbsp;</strong><span className="label label-warning">{window.LanguageConfig.InputData.Event.DataNoReady}</span></p>);
    },

    getDataStateBool : function(stateId, eventName){
        for(var i = 0; i < this.state.allInputData.length; i++)
        {
            if(this.state.allInputData[i].StateId == stateId && this.state.allInputData[i].Event == eventName && this.state.allInputData[i].DataId != '')
            {
                return true;
            }
        }
        return false;
    },

    checkGeoData : function(){
        for(var i = 0; i < window.allInputData.length; i++){
            if(window.allInputData[i].DataId == '' && (window.allInputData[i].Optional == 0 || window.allInputData[i].Optional == "false")){
                return {
                    result : 'fail',
                    message : window.LanguageConfig.InputData.Event.DataNoReadyMessage
                };
            }
            else{
                if($('#dataDestroyed_' + window.allInputData[i].StateId + '_' + window.allInputData[i].Event)[0].checked){
                    window.allInputData[i].Destroyed = true;
                }
                else{
                    window.allInputData[i].Destroyed = false;
                }
            }
        }

        for(var i = 0; i < window.allOutputData.length; i++)
        {
            if($('#dataTag_' + window.allOutputData[i].StateId + '_' + window.allOutputData[i].Event).val().trim() == ''){
                window.allOutputData[i].Tag = window.allOutputData[i].StateName + '-' + window.allOutputData[i].Event;
            }
            else{
                window.allOutputData[i].Tag = $('#dataTag_' + window.allOutputData[i].StateId + '_' + window.allOutputData[i].Event).val();
            }
            if($('#dataDestroyed_' + window.allOutputData[i].StateId + '_' + window.allOutputData[i].Event)[0].checked){
                window.allOutputData[i].Destroyed = true;
            }
            else{
                window.allOutputData[i].Destroyed = false;
            }
        }

        return {
            result : 'suc'
        };
    },

    changeCP : function(e, key){
        var pms = this.state.pms;
        pms.cp[key] = e.target.value;
        this.setState({pms : pms});
    },

    render : function(){
        if(this.state.loading)
        {
            return (<span>loading...</span>);
        }
        var authPanel = null;
        if(this.state.permission == 1){
            authPanel = (
                <div className="form-group">
                    <label className="col-md-1 col-sm-1 control-label" style={{"paddingTop" : "8px"}} >Auth Token</label>
                    <div className="col-md-6 col-sm-6">
                        <input name="authToken" type="text" id="authToken" className="form-control"  />
                    </div>
                </div>);
        }
        var params = null;
        if(this.state.pms){
            var pptbbody = this.state.pms.ProcessParameters.map(function(item, index){
                return (
                <tr>
                    <td>{index + 1}</td>
                    <td>{item.$.key}</td>
                    <td>NULL</td>
                    <td>{item.$.description}</td>
                </tr>);
            });
            // this.state.pms.cp = {};
            window.cp = this.state.pms.cp;
            var cptbbody = this.state.pms.ControlParameters.map(function(item, index){
                if(this.state.pms.cp[item.$.key] == undefined || this.state.pms.cp[item.$.key] == null){
                    this.state.pms.cp[item.$.key] = item.$.defaultValue;
                    value = item.$.defaultValue;
                }
                else{
                    value = this.state.pms.cp[item.$.key];
                }
                return (
                <tr>
                    <td>{index + 1}</td>
                    <td>{item.$.key}</td>
                    <td>
                        <div className="col-md-4 form-group">
                            <input type="text" className="form-control small" value={this.state.pms.cp[item.$.key]} onChange={(e)=>{this.changeCP(e, item.$.key)}} ></input>
                        </div>
                    </td>
                    <td>{item.$.description}</td>
                </tr>);
            }.bind(this));
            params = (
                <div>
                    <h4 >{window.LanguageConfig.InputData.Parameters.ProcessParameters}</h4>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{window.LanguageConfig.InputData.Parameters.Key}</th>
                                <th>{window.LanguageConfig.InputData.Parameters.Value}</th>
                                <th>{window.LanguageConfig.InputData.Parameters.Description}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pptbbody}
                        </tbody>
                    </table>
                    <h4 >{window.LanguageConfig.InputData.Parameters.ControlParameters}</h4>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{window.LanguageConfig.InputData.Parameters.Key}</th>
                                <th>{window.LanguageConfig.InputData.Parameters.Value}</th>
                                <th>{window.LanguageConfig.InputData.Parameters.Description}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cptbbody}
                        </tbody>
                    </table>
                </div>
            );
        }
        var states = this.state.states.map(function(State, index){
            var mark = true;
            var EventHead = State.Event.map(function(Event){
                var tag = '';
                var flag = '';
                var hasData = this.getDataStateBool(State.$.id, Event.$.name);
                if(mark)
                {
                    tag = 'active';
                    mark = false;
                }
                if(Event.$.type == 'response' && !hasData){
                    flag = (<i className="fa fa-cloud-upload"> </i>);
                }
                return (
                    <li key={'head' + State.$.id + '_' + Event.$.name} className={tag}>
                        <a style={{ paddingRight : '8px !important' }} href={'#' + State.$.id + '_' + Event.$.name} data-toggle="tab">
                            <i className="fa fa-flash"> </i>{Event.$.name} &nbsp;{flag}&nbsp;&nbsp;&nbsp;&nbsp;
                        </a>
                    </li>
                );
            }.bind(this));

            mark = true;
            var EventBody = State.Event.map(function(Event){
                var tag = '';
                if(mark){
                    tag = 'active';
                    mark = false;
                }
                var dataSelect = null;
                var optional = null;
                var dataReady = null;
                var multiple = null;
                var dataType = 'SELECT';
                var dataDestoryed = (
                    <div className="checkbox">
                        <label>
                            <input id={ 'dataDestroyed_' + State.$.id + '_' + Event.$.name} type="checkbox" value="" />
                            {window.LanguageConfig.InputData.Event.Destoryed}
                        </label>
                    </div>
                );    
                if(this.props['data-type'] == 'CUSTOM'){
                    dataType = 'CUSTOM';
                }
                if(Event.$.type == 'response'){
                    dataSelect = (<DataUpLoader data-id={State.$.id + '_' + Event.$.name}
                                                data-type={dataType}
                                                data-rmt={this.state.rmt}
                                                data-host={this.state.host}
                                                data-title={'[' + State.$.name + '] - [' + Event.$.name + ']'}
                                                onFinish={ (gdid, tag) => { this.onDataReady(State.$.id, Event.$.name, gdid, tag) } } />);
                    dataReady = this.getDataState(State.$.id, Event.$.name);
                    if(Event.$.optional == '1' || Event.$.optional == "true"){
                        optional = (<h4 style={{color : '#66CD00' }}><strong>{window.LanguageConfig.InputData.Event.Control}</strong></h4>);
                    }
                    else{
                        optional = (<h4 style={{color : '#D2691E' }}><strong>{window.LanguageConfig.InputData.Event.Required}</strong></h4>);
                    }
                }
                else if(Event.$.type == 'noresponse'){
                    optional = (<h4 style={{color : '#6495ED' }}><strong>{window.LanguageConfig.InputData.Event.Response}</strong></h4>);
                    dataReady = (<p><strong>{window.LanguageConfig.InputData.Event.ResponseDataTag}:</strong></p>);
                    dataSelect = (<input id={'dataTag_' + State.$.id + '_' + Event.$.name } className="form-control" type="text" />);
                    if(Event.$.multiple && Event.$.multiple == "True"){
                        multiple = (<p><strong>{window.LanguageConfig.InputData.Event.Multiple} : </strong>True</p>)
                    }
                    else{
                        multiple = (<p><strong>{window.LanguageConfig.InputData.Event.Multiple} : </strong>False</p>)
                    }
                }
                var udxDec = null;
                if(Event.UDXDeclaration){
                    udxDec = Event.UDXDeclaration.$.name + ' - ' + Event.UDXDeclaration.$.description;
                }
                return (
                    <div key={'body' + State.$.id + '_' + Event.$.name} className={ 'tab-pane ' + tag } id={State.$.id + '_' + Event.$.name}>
                        {optional}
                        <p><strong>{window.LanguageConfig.InputData.Event.Name} : </strong>{Event.$.name}</p>
                        <p><strong>{window.LanguageConfig.InputData.Event.Type} : </strong>{Event.$.type}</p>
                        {multiple}
                        <p><strong>{window.LanguageConfig.InputData.Event.Description} : </strong>{Event.$.description}</p>
                        <p><strong>{window.LanguageConfig.InputData.Event.DataReference} : </strong>{udxDec}</p>
                        {dataReady}
                        {dataSelect}
                        {dataDestoryed}
                    </div>
                );
            }.bind(this));

            return(
                <div key={State.$.id} className="panel-body">
                    <h4 style={{color : '#9ad717'}}><strong>{window.LanguageConfig.InputData.State.Title + ' [' + (index + 1) + ']'}</strong></h4>
                    <p><strong>{window.LanguageConfig.InputData.State.Name}&nbsp;:&nbsp;</strong>{State.$.name}</p>
                    <p><strong>{window.LanguageConfig.InputData.State.ID}&nbsp;:&nbsp;</strong>{State.$.id}</p>
                    <p><strong>{window.LanguageConfig.InputData.State.Description}&nbsp;:&nbsp;</strong>{State.$.description}</p>
                    <p><strong>{window.LanguageConfig.InputData.State.Type}&nbsp;:&nbsp;</strong>{State.$.type}</p>
                    <br />
                    <h4><strong>{window.LanguageConfig.InputData.Event.Title}</strong></h4>
                    <section className="panel">
                        <header className="panel-heading custom-tab ">
                            <ul className="nav nav-tabs">
                                {EventHead}
                            </ul>
                        </header>
                        <div className="panel-body">
                            <div className="tab-content">
                                {EventBody}
                            </div>
                        </div>
                    </section>
                </div>);
        }.bind(this));
        return (
            <div>
                {authPanel}
                <br />
                <h3 ><strong>Parameters : </strong></h3>
                {params}
                <br />
                <h3 ><strong>States : </strong></h3>
                {states}
            </div>
        );
    }
});

module.exports = DataPreparation;