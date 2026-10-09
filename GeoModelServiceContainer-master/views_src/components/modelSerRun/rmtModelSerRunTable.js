/**
 * Created by Franklin on 2017/3/25.
 */

var React = require('react');
var Axios = require('axios');

var RmtModelSerRunTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            msr : null,
            init : true,
            type : this.props['data-type']
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
                        var sortIndex = 2;
                        if(this.props['data-type'] == 'rmt'){
                            sortIndex = 3;
                        }
                        else if(this.props['data-type'] == 'ms' || this.props['data-type'] == 'rms'){
                            sortIndex = 0;
                        }
                        //初始化完成
                        $('#dynamic-table').dataTable(
                            {
                                //数据URL
                                "data": "/modelserrun/json/rmtall",
                                //载入数据的时候是否显示“正在加载中...”
                                "processing": true,
                                //是否显示分页
                                "bPaginate": true,
                                //初始化显示条目数
                                "iDisplayLength" : 10,
                                //每页显示条目数
                                "bLengthChange": true,
                                //排序
                                "bSort": true,
                                //排序配置
                                "aaSorting": [[sortIndex, "desc"]],
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
                        this.setState({init : false});
                    }

                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    openModelSerRunInfoHandle : function (e, host, msid) {
        if(host) {
            window.location = '/modelserrun/rmt/' + host + '/' + msid;
        }
        else{
            window.location = '/modelserrun/' + msid;
        }
    },

    render : function () {
        if(this.state.loading)
        {
            return (
                <span>Loading...</span>
            );
        }
        if(this.state.err)
        {
            return (
                <span>Error : {JSON.stringify(this.state.err)}</span>
            );
        }
        var MsrItems = [];
        var Heading = (
            <tr>
                <th>{window.LanguageConfig.ModelServiceRecord.Address}</th>
                <th>{window.LanguageConfig.ModelService.Name}</th>
                <th>{window.LanguageConfig.ModelServiceRecord.InstanceID}</th>
                <th>{window.LanguageConfig.ModelServiceRecord.StartTime}</th>
                <th>{window.LanguageConfig.ModelServiceRecord.Status}</th>
                <th>{window.LanguageConfig.ModelServiceRecord.Operation}</th>
            </tr>
        );
        if(this.state.type == 'rmt'){
            MsrItems = this.state.data.map(function(host){
                if(host.ping == 'err')
                {
                    return;
                }
                var msrs = host.msr.data.map(function (item) {
                    var status = '';
                    if(item.msr_status == 0)
                    {
                        status = window.LanguageConfig.ModelServiceRecord.Unfinished;
                    }
                    if(item.msr_status == -1)
                    {
                        status = window.LanguageConfig.ModelServiceRecord.Error;
                    }
                    if(item.msr_status == 1)
                    {
                        status = window.LanguageConfig.ModelServiceRecord.Finished;
                    }
                    return (
                        <tr key={host.host + item._id}>
                            <td>{host.host}</td>
                            <td>{item.msr_ms.ms_model.m_name}</td>
                            <td>{item.msr_guid}</td>
                            <td>{item.msr_datetime}</td>
                            <td>{status}</td>
                            <td>
                                <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerRunInfoHandle(e, host.host, item._id ) } }  ><i className="fa fa-book"></i>{window.LanguageConfig.ModelServiceRecord.Detail}</button>&nbsp;
                            </td>
                        </tr>
                    );
                }.bind(this));
                return msrs;
            }.bind(this));
        }
        else if(this.state.type == 'ms'){
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelServiceRecord.StartTime}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.Operation}</th>
                </tr>
            );
            MsrItems = this.state.data.map(function (item) {
                var status = '';
                if(item.msr_status == 0)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Unfinished;
                }
                if(item.msr_status == -1)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Error;
                }
                if(item.msr_status == 1)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Finished;
                }
                var date = new Date(item.msr_datetime).toLocaleString();
                return (
                    <tr key={item._id}>
                        <td>{date}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerRunInfoHandle(e, null, item._id ) } }  ><i className="fa fa-book"></i>{window.LanguageConfig.ModelServiceRecord.Detail}</button>&nbsp;
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        else if(this.state.type == 'rms'){
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelServiceRecord.StartTime}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.Operation}</th>
                </tr>
            );
            MsrItems = this.state.data.map(function (item) {
                var status = '';
                if(item.msr_status == 0)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Unfinished;
                }
                if(item.msr_status == -1)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Error;
                }
                if(item.msr_status == 1)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Finished;
                }
                var date = new Date(item.msr_datetime).toLocaleString();
                return (
                    <tr key={item._id}>
                        <td>{date}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerRunInfoHandle(e, this.props['data-host'], item._id ) } }  ><i className="fa fa-book"></i>{window.LanguageConfig.ModelServiceRecord.Detail}</button>&nbsp;
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        else if(this.state.type == 'rmthost'){
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.StartTime}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.Operation}</th>
                </tr>
            );
            MsrItems = this.state.data.map(function (item) {
                var status = '';
                if(item.msr_status == 0)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Unfinished;
                }
                if(item.msr_status == -1)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Error;
                }
                if(item.msr_status == 1)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Finished;
                }
                var date = new Date(item.msr_datetime).toLocaleString();
                return (
                    <tr key={item._id}>
                        <td>{item.msr_ms.ms_model.m_name}</td>
                        <td>{item.msr_ms.ms_model.m_type}</td>
                        <td>{date}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerRunInfoHandle(e, this.props['data-host'], item._id ) } }  ><i className="fa fa-book"></i>{window.LanguageConfig.ModelServiceRecord.Detail}</button>&nbsp;
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        else{
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.StartTime}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceRecord.Operation}</th>
                </tr>
            );
            MsrItems = this.state.data.map(function (item) {
                if(!item.msr_ms){
                    return '';
                }
                var status = '';
                if(item.msr_status == 0)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Unfinished;
                }
                if(item.msr_status == -1)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Error;
                }
                if(item.msr_status == 1)
                {
                    status = window.LanguageConfig.ModelServiceRecord.Finished;
                }
                var date = new Date(item.msr_datetime).toLocaleString();
                return (
                    <tr key={item._id}>
                        <td>{item.msr_ms.ms_model.m_name}</td>
                        <td>{item.msr_ms.ms_model.m_type}</td>
                        <td>{date}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerRunInfoHandle(e, null, item._id ) } }  ><i className="fa fa-book"></i>{window.LanguageConfig.ModelServiceRecord.Detail}</button>&nbsp;
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        return (
            <table className="display table table-bordered table-striped" id="dynamic-table">
                <thead>
                    {Heading}
                </thead>
                <tbody>
                    {MsrItems}
                </tbody>
            </table>
        );
    }
});

module.exports = RmtModelSerRunTable;