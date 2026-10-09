/**
 * Created by Franklin on 2017/3/26.
 */
var React = require('react');
var Axios = require('axios');
var NoteDialog = require('../../action/utils/noteDialog');

var ChildrenTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            children : null,
            init : false
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function () {
        Axios.get(this.props.source).then(
            data => {
                if(data.data.result == 'err')
                {
                    this.setState({loading : false, err : data.data.message});
                }
                else
                {
                    this.setState({loading : false, err : false, data : data.data.data});
                    if(!this.state.init){
                        //初始化完成
                        $('#dynamic-table').dataTable(
                            {
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
                                "aaSorting": [[3, "desc"]],
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
                            }
                        );
                        this.setState({init : true});
                    }

                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    openUploadModelSerHandle : function (e, host) {
        window.location.href = '/modelser/rmt/' + host + '/new';
    },

    openChildNodePageHandle : function(e, host){
        window.location.href = '/child-node/' + host;
    },

    acceptChild : function(e, id, host){
        if(confirm('accept [' + host + '] as child node?')){
            Axios.put('/child-node/' + id + '?ac=accept').then(
                data => {
                    if(data.data.result == 'suc'){
                        if(data.data.data.n == 1){
                            NoteDialog.openNoteDia('Info','Accept child node [' + host + '] successfully');
                            this.refresh();
                            return;
                        }
                    }
                    NoteDialog.openNoteDia('Info','Accept child node [' + host + '] failed');
                    this.refresh();
                },
                err => {}
            );
        }
    },

    removeChild : function(e, cid, host){
        if(confirm('Delete this child node : [' + host + ']')){
            Axios.delete('/child-node/' + cid).then(
                data => {
                    if(data.data.result == 'suc'){
                        NoteDialog.openNoteDia('Info','Child node : [' + host + '] deleted successful！');
                        this.refresh();
                    }else{
                        NoteDialog.openNoteDia('Info','Child node : [' + host + '] deleted failed! ');
                        this.refresh();
                    }
                },
                err => {}
            );
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
        var Children = this.state.data.map(function(child) {
            var platform;
            if(child.platform == 1)
            {
                platform = (<span className="label label-info"><i className="fa fa-windows"></i> windows</span>);
            }
            else if(child.platform == 2)
            {
                platform = (<span className="label label-info"><i className="fa fa-linux"></i> linux</span>);
            }
            else
            {
                platform = (<span className="label label-info">Unknown</span>);
            }
            var status;
            var button;
            var button_detail;
            if(child.accepted == false){
                status = (<span className="badge badge-warning">Unaccepted</span>);
                button = (
                    <button className="btn btn-success btn-xs" type="button"  onClick={ (e)=>{this.acceptChild(e, child._id, child.host)} } >
                        <i className="fa fa-check"> </i>Accept
                    </button>);
            }
            else{
                if(child.ping == 1)
                {
                    status = (<span className="badge badge-success" >Online</span>);
                    button = (
                        <button className="btn btn-default btn-xs" type="button"  onClick={ (e)=>{this.openUploadModelSerHandle(e, child.host)} } >
                            <i className="fa fa-cloud-upload"> </i> Deployment
                        </button>);
                }
                else
                {
                    status = (<span className="badge badge-defult">Offline</span>);
                }
                button_detail = (
                        <button className="btn btn-info btn-xs" type="button"  onClick={ (e) => {this.openChildNodePageHandle(e, child._id)} } ><i className="fa fa-book"> </i> Detail</button>);
            }
            return (
                <tr key={child.host}>
                    <td>{child.host}</td>
                    <td>{child.port}</td>
                    <td>{platform}</td>
                    <td>{status}</td>
                    <td>
                        {button_detail}&nbsp;
                        {button}&nbsp;
                        <button className="btn btn-danger btn-xs" type="button" onClick={(e) => { this.removeChild(e, child._id, child.host) }} ><i className="fa fa-trash-o"> Delete</i></button>
                    </td>
                </tr>
            );
        }.bind(this));
        return (
            <table className="display table table-bordered table-striped" id="dynamic-table">
                <thead>
                <tr>
                    <th>Address</th>
                    <th>Port</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>Operation</th>
                </tr>
                </thead>
                <tbody>
                {Children}
                </tbody>
            </table>
        );
    }
});

module.exports = ChildrenTable;