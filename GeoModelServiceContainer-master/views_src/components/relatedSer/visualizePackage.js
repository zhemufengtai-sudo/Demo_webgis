//created by wangmin on 2018/4/4

var React = require('react');
var Axios = require('axios');
var NoteDialog = require('../../action/utils/noteDialog');

var VisualizePackage = React.createClass({
    getInitialState: function () {
        return {
            loading: true,
            err: null,
            init: true,
            progress: true,
            btn_dataContainer: false
        }
    },
    componentDidMount: function () {
        this.refresh();
    },
    refresh: function () {
        //获取本地可视化服务数据
        Axios.get(this.props['data-source']).then(
            data => {
                if (data.data.res == 'err') {
                    this.setState({ loading: false, err: data.data.message });
                } else {
                    this.setState({ loading: false, err: false, data: data.data.data });
                    if (this.state.init) {
                        //初始化完成
                        $('#dynamic-table').dataTable(
                            {
                                //数据URL
                                "data": "/dataVisualize/json/all",
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
                                        "sFirst": window.LanguageConfig.TablePaging.Paginate.First,
                                        "sPrevious": window.LanguageConfig.TablePaging.Paginate.Previous,
                                        "sNext": window.LanguageConfig.TablePaging.Paginate.Next,
                                        "sLast": window.LanguageConfig.TablePaging.Paginate.Last
                                    }
                                }
                            }
                        );
                        this.setState({ init: false });
                    }
                }
            },
            err =>{
                this.setState({loading: false,err: err});
            }
        )
    },

    checkAll: function(e){
        if ($('#cb_checkall').is(':checked')) {
            $('input[name="vs_check"]').attr("checked", 'false');
        } else {
            $('input[name="vs_check"]').removeAttr("checked");
        }
    },

    openVisualizeSerHandle: function(e,vsid){
         if(confirm('Invoke this visualization service?') == true){
             //首先根据vsid获取所选择可视化包的信息
             Axios.get('/dataVisualize/' + vsid + '?ac=invoke').then(
                 data =>{
                      if(data.data.result == 'err'){
                        NoteDialog.openNoteDia('System Error', 'Please check the visualize package');
                      }else{
                          var path = data.data.data.path;
                          console.log(path);
                          window.location.href = path + this.props['data-gdid'];
                      }
                 },
                 err =>{
                    NoteDialog.openNoteDia('System Error', 'Please check the visualize package');
                 }
             )
         }
    },

    // openVisualizeInfoHandle: function(e,vsid){
    //     return null;
    // },

    render: function () {
        if(this.state.loading){
            return (
                <span>loading</span>
            );
        }
        if(this.state.err){
            return (
                <span>Error : {JSON.stringify(this.state.err)}</span>
            );
        }

        var VsItems = [];
        var Heading =(
            <tr>
                <th onClick={this.test}><input id="cb_checkall" type="checkbox" onChange={this.checkAll} /></th>
                <th>{window.LanguageConfig.ModelService.Name}</th>
                <th>Snapshot</th>
                <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
            </tr>
        );

        VsItems = this.state.data.map(function(item){
            var status;
            var snapshot;
            var button2;
            snapshot = (<img style={{ "width": "150px", "height": "60px" }} src={item.vs_img} />);
            if(item.vs_status == 1){
                button2 = (
                    <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openVisualizeSerHandle(e, item._id) }}>
                    <i className="fa fa-retweet"></i>&nbsp;Invoke
                </button>
                );
            }else{
                return null;
            }

            return(
                <tr key={item._id}>
                   <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}><input name="vs_check" type="checkbox" value={item._id} /></td>
                   <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}>{item.vs_model.vs_name}</td>
                   <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}>{snapshot}</td>
                   <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}>
                        {button2}&nbsp;
                    </td>
                </tr>
            );
        }.bind(this));

    return (
        <div>
            <table className="display table table-bordered table-striped" id="dynamic-table">
               <thead>
                   {Heading}
               </thead>
               <tbody>
                   {VsItems}
               </tbody>
            </table>
        </div>
    )
    }
});

module.exports = VisualizePackage;