/**
 * Created by Franklin on 2017/3/22.
 */
var React = require('react');
var Axios = require('axios');

var PortalInfo = require('../systemSetting/portalInfo');
var NoteDialog = require('../../action/utils/noteDialog');

var RmtModelSerTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            ms : null,
            init : true,
            type : this.props['data-type'],
            item : null,
            progress : false
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'err')
                {
                    this.setState({loading : false, err : data.data.message});
                }
                else
                {
                    this.setState({loading : false, err : false, data : data.data.data});
                    if(this.state.init)
                    {
                        var options = {
                            //数据URL
                            "data": "/modelser/json/rmtall",
                            //载入数据的时候是否显示“正在加载中...”
                            "processing": true,
                            //是否显示分页
                            "bPaginate": true,
                            //每页显示条目数
                            "bLengthChange": true,
                            //排序
                            "bSort": true,
                            //排序配置
                            //"aaSorting": [[0, "desc"]],
                            //自适应宽度
                            "bAutoWidth": true,
                            //多语言配置
                            "oLanguage": {
                                "sLengthMenu": window.LanguageConfig.TablePaging.LengthMenu,
                                "sZeroRecords": window.LanguageConfig.TablePaging.ZeroRecords,
                                "sInfo": window.LanguageConfig.TablePaging.Info,
                                "sInfoEmtpy": window.LanguageConfig.TablePaging.InfoEmtpy,
                                "sInfoFiltered": window.LanguageConfig.TablePaging.InfoFiltered,
                                "sProcessing": window.LanguageConfig.TablePaging.Processing,
                                "sSearch": window.LanguageConfig.TablePaging.Search,
                                //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
                                "sUrl": "",
                                "oPaginate": {
                                    "sFirst":    window.LanguageConfig.TablePaging.Paginate.First,
                                    "sPrevious": window.LanguageConfig.TablePaging.Paginate.Previous,
                                    "sNext":     window.LanguageConfig.TablePaging.Paginate.Next,
                                    "sLast":     window.LanguageConfig.TablePaging.Paginate.Last
                                }
                            }
                        };
                        if(this.state.type == 'admin'){
                            options["aoColumnDefs"] = [ { "bSortable": false, "aTargets": [ 0 ] }];
                        }
                        //初始化完成
                        $('#modelservice-table').dataTable(options);
                        this.setState({init : false});
                    }

                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    startModelSerHandle : function (e, host, msid) {
        if(confirm('Open this model service?') == true)
        {
            if(host){
                Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=start').then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else{
                Axios.put('/modelser/' + msid + '?ac=start').then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    stopModelSerHandle : function (e, host, msid) {
        if(confirm('Close this model service?') == true)
        {
            if(host){
                Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=stop').then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else {
                Axios.put('/modelser/' + msid + '?ac=stop').then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    deleteModelSerHandle : function(e, host, msid) {
        if(confirm('Delete this model service?') == true)
        {
            if(host){
                Axios.delete('/modelser/rmt/' + host + '/' + msid ).then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else{
                Axios.delete('/modelser/' + msid ).then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    openModelSerInfoHandle : function (e, host, msid) {
        if(host && host == 'custom'){
            window.location = '/public/modelser/' + msid;
        }
        else if(host){
            window.location = '/modelser/rmt/' + host + '/' + msid;
        }
        else{
            window.location = '/modelser/' + msid;
        }
    },

    uploadModelSer : function(e, host, msid){
        if(host){

        }
        else{
            window.open('/modelser/uploader/' + msid);
        }
    },

    openModelSerProHandle : function (e, host, msid) {
        if(host && host == 'custom'){
            window.open('/public/modelser/preparation/' + msid);
        }
        else if(host){
            window.open('/modelser/rmt/preparation/' + host + '/' + msid + '');
        }
        else{
            window.open('/modelser/preparation/' + msid );
        }
    },

    openRegisterDialogHandle : function (e, item) {
        this.setState({ item : item });
        $('#mdModelSerRegister').modal('show');
    },

    registerConfim : function(e){
        this.setState({progress : true});
        Axios.put('/modelser/' + this.state.item._id + '?ac=register').then(
            data => {
                if(data.data.result == 'suc'){
                    NoteDialog.openNoteDia('Info', 'Model service register successfully!');
                    this.setState({item : null, progress : false});
                    this.refresh();
                    $('#mdModelSerRegister').modal('hide');
                }
                else{
                    this.setState({item : null, progress : false});
                   // NoteDialog.openNoteDia('Error', 'Error in registering a model service! Please go to Pottal to build Model Item. Message : ' + data.data.message);
                   NoteDialog.openNoteDia('Error', 'Error in registering a model service! Message : ' + data.data.message);
                    this.refresh();
                    $('#mdModelSerRegister').modal('hide');
                }
            },
            err => {
                this.setState({item : null, progress : false});
                this.refresh();
                $('#mdModelSerRegister').modal('hide');
            }
        );
    },

    unregisterHandle : function(e, id, name){
        if(confirm('Unregister this model service [' + name + ']?')){
            Axios.put('/modelser/' + id + '?ac=unregister').then(
                data => {
                    if(data.data.result == 'suc'){
                        NoteDialog.openNoteDia('Info', 'Model service unregister successfully!');
                        this.refresh();
                    }
                    else{
                        NoteDialog.openNoteDia('Error', 'Error in unregistering a model service! Message : ' + data.data.message);
                        this.refresh();
                    }
                },
                err => {
                    this.refresh();
                }
            );
        }
    },

    lockHandle : function(e, host, msid){
        if(confirm('Lock this model service?') == true)
        {
            if(host){
                Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=lock').then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else{
                Axios.put('/modelser/' + msid + '?ac=lock').then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    unlockHandle : function(e, host, msid){
        if(confirm('Unlock this model service?') == true)
        {
            if(host){
                Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=unlock').then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else{
                Axios.put('/modelser/' + msid + '?ac=unlock').then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    getCheckedList : function(){
        var inputs = $('input[name="ms_check"]:checked');
        if(inputs.length == 0){ return null; }
        var msids = [];
        for(var i = 0; i < inputs.length; i++){
            msids.push(inputs[i].value);
        };
        return msids;
    },

    batchStart : function(e){
        var msids = this.getCheckedList();
        if(msids == null){
            return;
        }
        if(confirm('Start these model services?')){
            Axios.put('/modelser/all?ac=start&msids=' + JSON.stringify(msids)).then(
                data => {
                    if(data.data.result == 'suc'){
                        this.refresh();
                    }
                },
                err => {}
            );
        }
    },

    batchStop : function(e){
        var msids = this.getCheckedList();
        if(msids == null){
            return;
        }
        if(confirm('Stop these model services?')){
            Axios.put('/modelser/all?ac=stop&msids=' + JSON.stringify(msids)).then(
                data => {
                    if(data.data.result == 'suc'){
                        this.refresh();
                    }
                },
                err => {}
            );
        }
    },

    batchLock : function(e){
        var msids = this.getCheckedList();
        if(msids == null){
            return;
        }
        if(confirm('Lock these model services?')){
            Axios.put('/modelser/all?ac=lock&msids=' + JSON.stringify(msids)).then(
                data => {
                    if(data.data.result == 'suc'){
                        this.refresh();
                    }
                },
                err => {}
            );
        }
    },

    batchUnlock : function(e){
        var msids = this.getCheckedList();
        if(msids == null){
            return;
        }
        if(confirm('Unlock these model services?')){
            Axios.put('/modelser/all?ac=unlock&msids=' + JSON.stringify(msids)).then(
                data => {
                    if(data.data.result == 'suc'){
                        this.refresh();
                    }
                },
                err => {}
            );
        }
    },

    checkAll : function(e){
        if($('#cb_checkall').is(':checked')){
            $('input[name="ms_check"]').attr("checked",'false');
        }
        else{
            $('input[name="ms_check"]').removeAttr("checked");
        }
    },

    render : function () {
        if(this.state.loading)
        {
            return (
                <span>loading...</span>
                );
        }
        if(this.state.err)
        {
            return (
                <span>Error : {JSON.stringify(this.state.err)}</span>
            );
        }
        var MsItems = [];
        var Heading = null;
        //! reomote model services
        if(this.state.type == 'rmt'){
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Version}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>{window.LanguageConfig.ModelService.Address}</th>
                    <th>{window.LanguageConfig.ModelService.Platform}</th>
                    <th>{window.LanguageConfig.ModelService.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
                </tr>
            );
            MsItems = this.state.data.map(function(host){
                if(host.ping == 'err'){
                    return;
                }
                var mss = host.ms.data.map(function (item) {
                    var platform;
                    if(item.ms_platform == 1)
                    {
                        platform = (<span className="label label-info"><i className="fa fa-windows"> </i> windows</span>);
                    }
                    else if(item.ms_platform == 2)
                    {
                        platform = (<span className="label label-info"><i className="fa fa-linux"> </i> linux</span>);
                    }
                    else
                    {
                        platform = (<span className="label label-info"> Unknown</span>);
                    }
                    var status;
                    var button;
                    var button2;
                    if(item.ms_status == 1)
                    {
                        status = (<span className="badge badge-success hand" onClick={(e)=>{this.stopModelSerHandle(e, host.host, item._id)}}>{window.LanguageConfig.ModelService.Avai}</span>);
                        button = (
                            <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openModelSerProHandle(e, host.host, item._id) }} >
                                <i className="fa fa-retweet"> </i>{window.LanguageConfig.ModelService.Invoking}
                            </button>);
                        // button2 = (
                        //     <button className="btn btn-danger btn-xs tooltips" type="button" title={window.LanguageConfig.ModelService.Stop} 
                        //             onClick={(e)=>{this.stopModelSerHandle(e, host.host, item._id)}} >
                        //         <i className="fa fa-stop"> </i> {window.LanguageConfig.ModelService.Stop} 
                        //     </button>
                        // );
                    }
                    else
                    {
                        status = (<span className="badge badge-defult hand" onClick={(e)=>{this.startModelSerHandle(e, host.host, item._id)}}>{window.LanguageConfig.ModelService.Unavai}</span>);
                        button = (
                            <button className="btn btn-warning btn-xs tooltips" type="button" title={window.LanguageConfig.ModelService.Delete}
                                    onClick={(e) => { this.deleteModelSerHandle(e, host.host, item._id) }} >
                                <i className="fa fa-trash-o"> </i> {window.LanguageConfig.ModelService.Delete}
                            </button>
                        );
                        // button2 = (
                        //     <button className="btn btn-success btn-xs tooltips" type="button" title={window.LanguageConfig.ModelService.Start} 
                        //             onClick={(e)=>{this.startModelSerHandle(e, host.host, item._id)}} >
                        //         <i className="fa fa-play"> </i> {window.LanguageConfig.ModelService.Start} 
                        //     </button>
                        // );
                    }
                    var name = item.ms_model.m_name;
                    if(name.length > 25){
                        name = name.substr(0, 25) + '...';
                    }
                    var type = item.ms_model.m_type;
                    if(type == undefined || type == null){
                        type = '';
                    }
                    if(type.length > 20){
                        type = type.substr(0, 20) + '...';
                    }
                    return (
                        <tr>
                            <td  title={item.ms_model.m_name + '-' + item.ms_des} >{name}</td>
                            <td>{item.mv_num}</td>
                            <td title={item.ms_model.m_type}>{type}</td>
                            <td>{host.host}</td>
                            <td>{platform}</td>
                            <td>{status}</td>
                            <td>
                                <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerInfoHandle(e, host.host, item._id ) } }  ><i className="fa fa-book"> </i>{window.LanguageConfig.ModelServiceTable.Detail}</button>&nbsp;
                                {button}&nbsp;{button2}
                            </td>
                        </tr>
                    );
                }.bind(this));
                return mss;
            }.bind(this));
        }
        //! custom model services
        else if(this.state.type == 'custom'){
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Version}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>{window.LanguageConfig.ModelService.Permission}</th>
                    <th>{window.LanguageConfig.ModelService.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
                </tr>
            );
            MsItems = this.state.data.map(function (item) {
                var status;
                var button;
                if(item.ms_status == 1)
                {
                    status = (<span className="badge badge-success">{window.LanguageConfig.ModelService.Online}</span>);
                    button = (
                        <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openModelSerProHandle(e, 'custom', item._id) }} >
                            <i className="fa fa-retweet"> </i>{window.LanguageConfig.ModelService.Invoking}
                        </button>);
                }
                else
                {
                    status = (<span className="badge badge-defult">{window.LanguageConfig.ModelService.Offline}</span>);
                }
                var permission = null;
                if(item.ms_permission == 1){
                    permission = (<span className="label label-default tooltips" title={window.LanguageConfig.ModelService.Auth} ><i className="fa fa-lock" ></i>&nbsp;{window.LanguageConfig.ModelService.Auth}</span>);
                }
                else{
                    permission = (<span className="label label-success tooltips" title={window.LanguageConfig.ModelService.Public} ><i className="fa fa-unlock" ></i>&nbsp;{window.LanguageConfig.ModelService.Public}</span>);
                }
                var name = item.ms_model.m_name;
                if(name.length > 25){
                    name = name.substr(0, 25) + '...';
                }
                var type = item.ms_model.m_type;
                if(type == undefined || type == null){
                    type = '';
                }
                if(type.length > 20){
                    type = type.substr(0, 20) + '...';
                }
                return (
                    <tr key={item._id}>
                        <td title={item.ms_model.m_name + '-' + item.ms_des}>{name}</td>
                        <td>{item.mv_num}</td>
                        <td title={item.ms_model.m_type}>{type}</td>
                        <td>{permission}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerInfoHandle(e, 'custom', item._id ) } }  ><i className="fa fa-book"> </i>{window.LanguageConfig.ModelServiceTable.Detail}</button>&nbsp;
                            {button}
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        //! remote host model services
        else if(this.state.type == 'rmthost'){
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Version}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>Permission</th>
                    <th>{window.LanguageConfig.ModelService.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
                </tr>
            );
            MsItems = this.state.data.map(function (item) {
                var status;
                var button;
                if(item.ms_status == 1)
                {
                    status = (<span className="badge badge-success">Online</span>);
                    button = (
                        <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openModelSerProHandle(e, this.props['data-host'], item._id) }} >
                            <i className="fa fa-retweet"> </i>{window.LanguageConfig.ModelService.Invoking}
                        </button>);
                }
                else
                {
                    status = (<span className="badge badge-defult">Offline</span>);
                }
                var permission = null;
                if(item.ms_permission == 1){
                    permission = (<span className="label label-default tooltips" title={window.LanguageConfig.ModelService.Auth} ><i className="fa fa-lock" ></i>&nbsp;{window.LanguageConfig.ModelService.Auth}</span>);
                }
                else{
                    permission = (<span className="label label-success tooltips" title={window.LanguageConfig.ModelService.Public} ><i className="fa fa-unlock" ></i>&nbsp;{window.LanguageConfig.ModelService.Public}</span>);
                }
                var name = item.ms_model.m_name;
                if(name.length > 25){
                    name = name.substr(0, 25) + '...';
                }
                var type = item.ms_model.m_type;
                if(type == undefined || type == null){
                    type = '';
                }
                if(type.length > 20){
                    type = type.substr(0, 20) + '...';
                }
                return (
                    <tr key={item._id}>
                        <td title={item.ms_model.m_name + '-' + item.ms_des}>{name}</td>
                        <td>{item.mv_num}</td>
                        <td title={item.ms_model.m_type}>{type}</td>
                        <td>{permission}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerInfoHandle(e, this.props['data-host'], item._id ) } }  ><i className="fa fa-book"> </i>{window.LanguageConfig.ModelServiceTable.Detail}</button>&nbsp;
                            {button}
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        //! local model services
        else if(this.state.type == 'admin'){
            Heading = (
                <tr>
                    <th onClick={this.test} ><input id="cb_checkall" type="checkbox" onChange={this.checkAll} /></th>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Version}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>{window.LanguageConfig.ModelService.Permission}</th>
                    <th>{window.LanguageConfig.ModelService.Accessibility}</th>
                    <th>{window.LanguageConfig.ModelService.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
                </tr>
            );
            MsItems = this.state.data.map(function (item) {
                var platform;
                if(item.ms_platform == 1)
                {
                    platform = (<span className="label label-info"><i className="fa fa-windows"> </i> windows</span>);
                }
                else if(item.ms_platform == 2)
                {
                    platform = (<span className="label label-info"><i className="fa fa-linux"> </i> linux</span>);
                }
                else
                {
                    platform = (<span className="label label-info">Unknown</span>);
                }
                var status;
                var button;
                var button2;
                var button3 = null;
                //! Now, all public model services are provided to the public web (mod by F. Z. , 2021-1-22)
                // if(!item.ms_model.m_register){
                //     button3 = (
                //         <button className="btn btn-default btn-xs" type="button" onClick={(e) => { this.openRegisterDialogHandle(e, item) }} >
                //             <i className="fa fa-cloud-upload"> </i>&nbsp;{window.LanguageConfig.ModelServiceTable.Register}
                //         </button>);
                // }
                // else{
                //     button3 = (
                //         <button className="btn btn-default btn-xs" type="button" onClick={(e) => { this.unregisterHandle(e, item._id, item.ms_model.m_name) }} >
                //             <i className="fa fa-share-square-o"> </i>&nbsp;Unregister
                //         </button>);
                // }
                if(item.ms_status == 1)
                {
                    status = (<span className="badge badge-success hand" onClick={(e)=>{this.stopModelSerHandle(e, null, item._id)}} >{window.LanguageConfig.ModelService.Online}</span>);
                    button2 = (
                        <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openModelSerProHandle(e, null, item._id) }} >
                            <i className="fa fa-retweet"> </i>{window.LanguageConfig.ModelService.Invoking}
                        </button>);
                }
                else
                {
                    status = (<span className="badge badge-defult hand" onClick={(e)=>{this.startModelSerHandle(e, null, item._id)}}>{window.LanguageConfig.ModelService.Offline}</span>);
                    button2 = (
                        <button className="btn btn-warning btn-xs tooltips" type="button" data-toggle="tooltip" data-placement=" bottom" title={window.LanguageConfig.ModelService.Delete} data-original-title={window.LanguageConfig.ModelService.Delete}
                                onClick={(e) => { this.deleteModelSerHandle(e, null, item._id) }} >
                            <i className="fa fa-trash-o"> </i>&nbsp;{window.LanguageConfig.ModelService.Delete}
                        </button>
                    );
                }
                var limited = null;
                if(item.ms_limited == 1){
                    limited = (<button className="btn btn-warning btn-xs" title={window.LanguageConfig.ModelService.Private} onClick={ (e) => { this.unlockHandle(e, null, item._id) } } ><i className="fa fa-user" ></i>&nbsp;{window.LanguageConfig.ModelService.Private}</button>);
                }
                else{
                    limited = (<button className="btn btn-success btn-xs" title={window.LanguageConfig.ModelService.Public} onClick={ (e) => { this.lockHandle(e, null, item._id) } } ><i className="fa fa-users" ></i>&nbsp;{window.LanguageConfig.ModelService.Public}</button>);
                }
                var permission = null;
                if(item.ms_permission == 1){
                    permission = (<span className="label label-default tooltips" title={window.LanguageConfig.ModelService.Auth} ><i className="fa fa-lock" ></i>&nbsp;{window.LanguageConfig.ModelService.Auth}</span>);
                }
                else{
                    permission = (<span className="label label-success tooltips" title="Open" ><i className="fa fa-unlock" ></i>&nbsp;{window.LanguageConfig.ModelService.Open}</span>);
                }
                var name = item.ms_model.m_name;
                if(name.length > 25){
                    name = name.substr(0, 25) + '...';
                }
                var type = item.ms_model.m_type;
                if(type == undefined || type == null){
                    type = '';
                }
                if(type.length > 20){
                    type = type.substr(0, 20) + '...';
                }
                return (
                    <tr key={item._id} >
                        <td><input name="ms_check" type="checkbox" value={item._id} /></td>
                        <td title={ item.ms_model.m_name + ' - ' +item.ms_des}>{name}</td>
                        <td>{item.mv_num}</td>
                        <td title={ item.ms_model.m_type }>{type}</td>
                        <td>{permission}</td>
                        <td>{limited}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerInfoHandle(e, null, item._id ) } }  ><i className="fa fa-book"> </i>{window.LanguageConfig.ModelServiceTable.Detail}</button>&nbsp;
                            {button}&nbsp;{button2}&nbsp;{button3}&nbsp;
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        var ms_name = null;
        var ms_des = null;
        if(this.state.item){
            ms_name = this.state.item.ms_model.m_name;
            ms_des = this.state.item.ms_des;
        }
        var btnDisabled = null;
        var progress = null;
        var operation = null;
        if(this.state.type == 'admin' ){
            operation = (
                <div>
                    <button className="btn btn-success btn-sm" onClick={this.batchStart} ><i className="fa fa-play"></i> {window.LanguageConfig.ModelServiceTable.Start}</button>&nbsp;
                    <button className="btn btn-danger btn-sm" onClick={this.batchStop}><i className="fa fa-stop"></i> {window.LanguageConfig.ModelServiceTable.Stop}</button>&nbsp;
                    <button className="btn btn-warning btn-sm" onClick={this.batchLock}><i className="fa fa-user"></i> {window.LanguageConfig.ModelServiceTable.Hidden}</button>&nbsp;
                    <button className="btn btn-success btn-sm" onClick={this.batchUnlock}><i className="fa fa-users"></i> {window.LanguageConfig.ModelServiceTable.Publish}</button>
                </div>
            );
        }
        if(this.state.progress){
            btnDisabled = 'disabled';
            progress = (
            <div className="progress progress-striped active progress-sm">
                <div id="upload_bar" style={{"width": "100%"}} aria-valuemax="100" aria-valuemin="0" aria-valuenow="0" role="progressbar" className="progress-bar progress-bar-success">
                        <span className="sr-only"></span>
                    </div>
                </div>);
        }
        return (
            <div>
                {operation}
                {/* <button className="btn btn-success btn-sm"  >success</button> */}
                <table className="display table table-bordered table-striped" id="modelservice-table">
                    <thead>
                        {Heading}
                    </thead>
                    <tbody>
                        {MsItems}
                    </tbody>
                </table>
                <div aria-hidden="true" aria-labelledby="mdModelSerRegister" role="dialog" tabIndex="-1" id="mdModelSerRegister" style={{"zIndex":"1050"}}  className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">Register</h4>
                            </div>
                            <div className="modal-body">
                                <PortalInfo data-type="show" />
                                <h5 >Service Name : {ms_name} </h5>
                                <h5 >Service Description : {ms_des} </h5>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" disabled={btnDisabled} onClick={ this.registerConfim } >Confirm</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                <br />
                            </div>
                            {progress}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = RmtModelSerTable;