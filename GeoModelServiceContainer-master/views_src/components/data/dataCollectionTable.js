/**
 * Created by Franklin on 2017/3/30.
 */
var React = require('react');
var Axios = require('axios');

var DataUploader = require('./dataUploader');
var NoteDialog = require('../../action/utils/noteDialog');

var DataCollectionTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            data : null,
            init : false
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function () {
        Axios.get(this.props.source).then(
            data => {
                if(data.data.res == 'err')
                {
                    this.setState({loading : false, err : data.data.message});
                }
                else
                {
                    this.setState({loading : false, err : false, data : data.data.data});
                    if(!this.state.init)
                    {
                        $('#dataCollection-table').dataTable(
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

    displayData : function(e, gdid){
        window.open('/geodata/json/' + gdid);
    },

    downloadData : function(e, gdid){
        window.open('/geodata/' + gdid);
    },

    deleteData : function(e, gdid, gdtag){
        if(confirm(window.LanguageConfig.DataTable.DeleteConfirm + ' - ' + gdid + ' - ' + gdtag))
        {
            Axios.delete('/geodata/' + gdid).then(
                data => {
                    if(data.data.result == 'suc'){
                        NoteDialog.openNoteDia('Info', 'Detele this data successfully!');
                        this.refresh();
                    } },
                err => {  }
            );
        }
    },

    clearCache : function(e){
        var length = $('#selCacheLength').val();
        if(confirm('Clear data cache of ' + length + ' day(s) ago?'))
        {
            Axios.delete('/geodata/all?day=' + length).then(
                data => {
                    if(data.data.result == 'suc'){
                        NoteDialog.openNoteDia('Info', 'Detele data cache successfully!');
                        this.refresh();
                    } },
                err => {  }
            );
        }
    },

    dataPreview : function (e,gdid) {
        return window.open('/geodata/' + gdid + '?ac=visualize');
    },

    render : function() {
        if(this.state.loading)
        {
            return (
                <span>Loading...</span>
            );
        }
        if(this.state.err)
        {
            return (
                <span>Error:{JSON.stringify(this.state.err)}</span>
            );
        }
        var allSize = 0;
        var dataItems = this.state.data.map(function(item){
            var format = null;
            if(item.gd_type == 'FILE' || item.gd_type == 'RAW')
            {
                format = (<span className="label label-info" ><i className="fa fa-file"></i> Raw</span>);
            }
            else if(item.gd_type == 'XML')
            {
                format = (<span className="label label-info" ><i className="fa fa-code"></i> XML </span>);
            }
            else if(item.gd_type == 'STREAM' || item.gd_type == 'XML')
            {
                format = (<span className="label label-info" ><i className="fa fa-ellipsis-v"></i> {window.LanguageConfig.DataTable.Stream}</span>);
            }
            else if(item.gd_type == 'ZIP')
            {
                format = (<span className="label label-info" ><i className="fa fa-folder-o"></i> ZIP </span>);
            }
            var size = item.gd_size - 16;
            allSize = allSize + size;
            size = (size/1024).toFixed(2);
            var unit = 'KB';
            if(size > 1024){
                size = (size/1024).toFixed(2);
                unit = 'MB';
            }
            if(size > 1024){
                size = (size/1024).toFixed(2);
                unit = 'GB';
            }
            var gd_tag = item.gd_tag;
            if(item.gd_tag.length > 20){
                gd_tag = item.gd_tag.substr(0, 20) + '...';
            }
            return(
                <tr key={item.gd_id} title={item.gd_id}>
                    <td title={item.gd_tag} >{gd_tag}</td>
                    <td>{format}</td>
                    <td>{size + ' ' + unit} </td>
                    <td>{item.gd_datetime}</td>
                    <td>
                        <button className="btn btn-info btn-xs" onClick={(e) => {this.displayData(e, item.gd_id)} } ><i className="fa fa-book"> </i> {window.LanguageConfig.DataTable.Check}</button>&nbsp;
                        <button className="btn btn-success btn-xs btn-lg" data-toggle="modal" data-target="#myModal"  onClick={(e) => {this.dataPreview(e, item.gd_id)} } ><i className="fa fa-picture-o"> </i> {window.LanguageConfig.DataTable.Vistualization}</button>&nbsp;
                        <button className="btn btn-default btn-xs" onClick={(e) => {this.downloadData(e, item.gd_id)} } ><i className="fa fa-download"> </i> {window.LanguageConfig.DataTable.Download}</button>&nbsp;
                        <button className="btn btn-warning btn-xs" onClick={(e) => {this.deleteData(e, item.gd_id, item.gd_tag)} } ><i className="fa fa-trash-o"> </i> {window.LanguageConfig.DataTable.Delete}</button>
                    </td>
                </tr>
            );
        }.bind(this));
    
        allSize = (allSize / 1024).toFixed(2);
        allUnit = 'KB'

        if(allSize > 1024){
            allSize = (allSize / 1024).toFixed(2);
            allUnit = 'MB'
        }
        if(allSize > 1024){
            allSize = (allSize / 1024).toFixed(2);
            allUnit = 'GB'
        }

        return (
            <div>
                <div className="panel-body">
                    <div className="col-lg-12" >
                        <p className="muted" >{window.LanguageConfig.DataTable.AllDataSize} : {allSize + ' ' + allUnit}</p>
                    </div>
                    <div className="col-lg-3">
                        {window.LanguageConfig.DataTable.ClearDataCache} : 
                        <div className="input-group m-bot15">
                            <select id="selCacheLength" className="form-control" >
                                <option value="1" >{window.LanguageConfig.DataTable.OneDayAgo}</option>
                                <option value="7" >{window.LanguageConfig.DataTable.OneWeekAgo}</option>
                                <option value="30" >{window.LanguageConfig.DataTable.OneMonthAgo}</option>
                                <option value="90" >{window.LanguageConfig.DataTable.ThreeMonthsAgo}</option>
                                <option value="365" >{window.LanguageConfig.DataTable.OneYearAgo}</option>
                            </select>
                            <span className="input-group-btn">
                                <button className="btn btn-default" type="button" onClick={ this.clearCache } >{window.LanguageConfig.DataTable.CacheClear}</button>
                            </span>
                        </div>
                    </div>
                </div>
                <table className="display table table-bordered table-striped" id="dataCollection-table">
                    <thead>
                        <tr>
                            <th>{window.LanguageConfig.DataTable.Tag}</th>
                            <th>{window.LanguageConfig.DataTable.Storage}</th>
                            <th>{window.LanguageConfig.DataTable.Size}</th>
                            <th>{window.LanguageConfig.DataTable.DateTime}</th>
                            <th>{window.LanguageConfig.DataTable.Operation}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataItems}
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = DataCollectionTable;