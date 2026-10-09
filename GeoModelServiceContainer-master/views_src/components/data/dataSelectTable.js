/**
 * Created by Franklin on 2017/4/5.
 */
var React = require('react');
var Axios = require('axios');

var DataSelectTable = React.createClass({
    getInitialState : function () {
        var id = '';
        if(this.props['data-id'])
        {
            id = this.props['data-id'];
        }
        return {
            id : id,
            loading : true,
            err : null,
            data : null,
            gdid : ''
        };
    },

    componentDidMount : function () {
        //this.refresh();
    },

    getSelectedGDID : function(){
        var value =  $("input[name='rd_GDID']:checked").val();
        var guid = value.substr(0, value.indexOf('\t\t\t'));
        return guid;
    },

    getSelectedTAG : function(){
        var value =  $("input[name='rd_GDID']:checked").val();
        var tag = value.substr(value.indexOf('\t\t\t') + 3);
        return tag;
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
                    if(!this.state.init)
                    {
                        $('#dataSelect-table' + this.state.id).dataTable(
                            {
                                //数据URL
                                "data": "/geodata/json/all",
                                //载入数据的时候是否显示“正在加载中...”
                                "processing": true,
                                //是否显示分页
                                "bPaginate": true,
                                //每页显示条目数
                                "bLengthChange": false,
                                //初始化显示条目数
                                "iDisplayLength" : 5,
                                //排序
                                "bSort": true,
                                //排序配置
                                "aaSorting": [[2, "desc"]],
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
        var dataItems = this.state.data.map(function(item){
            var size = (parseInt(item.gd_size) / 1024).toFixed(2);
            var unit = 'KB';
            if(size > 1024){
                size = (size / 1024).toFixed(2);
                unit = 'MB';
            }
            if(size > 1024){
                size = (size / 1024).toFixed(2);
                unit = 'GB';
            }
            var gd_tag = item.gd_tag;
            if(item.gd_tag.length > 20){
                gd_tag = item.gd_tag.substr(0, 20) + '...';
            }
            return(
                <tr title={item.gd_id} key={item.gd_id}>
                    <td><input className="radio " name="rd_GDID" type="radio" value={item.gd_id + '\t\t\t' + item.gd_tag} /></td>
                    <td title={item.gd_tag}>{gd_tag}</td>
                    <td>{item.gd_datetime}</td>
                    <td>{size + ' ' + unit}</td>
                </tr>
            );
        }.bind(this));
        return (
            <div>
                <table className="display table table-bordered table-striped" id={'dataSelect-table' + this.state.id}>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>{window.LanguageConfig.DataTable.Tag}</th>
                        <th>{window.LanguageConfig.DataTable.DateTime}</th>
                        <th>Size</th>
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

module.exports = DataSelectTable;