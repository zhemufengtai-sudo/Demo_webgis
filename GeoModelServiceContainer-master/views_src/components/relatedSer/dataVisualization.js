// Created by wangming on 2018/1/23.
var React = require('react');
var Axios = require('axios');
var NoteDialog = require('../../action/utils/noteDialog');

var DataVisualization = React.createClass({
    getInitialState: function () {
        return {
            loading: true,
            err: null,
            init: true,
            progress: true,
            btn_dataContainer: false
        };
    },

    componentDidMount: function () {
        this.refresh();
    },

    refresh: function () {
        //根据sources获取本地数据库中的数据
        Axios.get(this.props['data-source']).then(
            data => {
                if (data.data.res == 'err') {
                    this.setState({ loading: false, err: data.data.message });
                }
                else {
                    this.setState({ loading: false, err: false, data: data.data.data });
                    if (this.state.init) {
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
            err => {
                this.setState({ loading: false, err: err });
            }
        )

    },

    addLocalPackage: function () {
        window.location.href = '/dataVisualize/new';
    },

    checkAll: function (e) {
        if ($('#cb_checkall').is(':checked')) {
            $('input[name="vs_check"]').attr("checked", 'false');
        } else {
            $('input[name="vs_check"]').removeAttr("checked");
        }
    },

    stopVisualizeSerHandle: function (e, vsid) {
        if (confirm('Close this visualization service?') == true) {
            Axios.put('/dataVisualize/' + vsid + '?ac=stop').then(
                data => {
                    this.refresh();
                },
                err => {
                    NoteDialog.openNoteDia('Error', 'Failed to stop the visualization server');
                }
            )
        }
    },

    startVisualizeSerHandle: function (e, vsid) {
        if (confirm('Start the visualization service?') == true) {
            Axios.put('/dataVisualize/' + vsid + '?ac=start').then(
                data => {
                    this.refresh();
                },
                err => {
                    NoteDialog.openNoteDia('Error', 'Failed to stop the visualization server');
                }
            )
        }
    },

    openVisualizeSerHandle: function (e, vsid) {
        //还没想好怎么实现
        console.log('fuck fuck fuck you !!!');
    },

    deleteVisualizeHandle: function (e, vsid) {
        if (confirm('Delete this visualization service?') == true) {
            Axios.delete('/dataVisualize/' + vsid).then(
                data => {
                    this.refresh();
                },
                err => {
                    NoteDialog.openNoteDia('Error', 'Failed to delete the visualization server');
                }
            );
        }
    },

    checkServer: function () {
        //判断能否连接到数据容器之上
        var port = "8899";
        // var username = "admin";
        // var password = "123";
        if ($('#txtNewDataContainerHost').val().trim() == '') {
            return;
        }
        if ($('#txtNewDataContainerPort').val().trim() != '') {
            port = $('#txtNewDataContainerPort').val().trim();
        }
        // if($('#txtUserName').val().trim() != ''){
        //     username = $('#txtUserName').val().trim();
        // }
        // if($('#txtPassword').val().trim() != ''){
        //     password = $('#txtPassword').val().trim();
        // }
        //请求相关数据容器路由来判断本机器能否和数据容器进行通讯
        //未实现 /dataVisualize/checkserver/:server
        Axios.put('/dataVisualize/check/' + $('#txtNewDataContainerHost').val() + ':' + port).then(
            data =>{
                if(data.data.result == 'OK'){
                    console.log("连接成功");
                    this.setState({ proDataCTHost: $('#txtNewDataContainerHost').val(), proDataCTPort: port });
                    this.setState({ btn_dataContainer: true });
                }else{
                    this.setState({ btn_dataContainer: false });
                }
            },
            err =>{
                console.log("连接失败");
            }
        )
        
    },

    disableConfirmBtn: function () {
        this.setState({ disableConfirmBtn: false });
    },
    onSubmit: function (e) {
        if ($('#txtUserName').val().trim() == '') {
            NoteDialog.openNoteDia('Error', 'you must input the userName');
            return false;
        } else if ($('#txtPassword').val().trim() == '') {
            NoteDialog.openNoteDia('Error', 'you must input the password');
            return false;
        } else {
            this.setState({ proUsername: $('#txtUserName').val(), proPassword: $('#txtPassword').val().trim()});
            //请求获取数据容器所有可视化路由
            console.log('niubi');
            // Axios.put('/dataVisualize/request?host=' + this.state.proDataCTHost + '&port=' + this.state.proDataCTPort + '&username=' + this.state.proUsername + '&password=' + this.state.proPassword)
            //      .then(
            //          data =>{

            //          },
            //          err =>{

            //          }
            //      );
        }
    },


    render: function () {
        if (this.state.loading) {
            return (
                <span>loading</span>
            );
        }
        if (this.state.err) {
            return (
                <span>Error : {JSON.stringify(this.state.err)}</span>
            );
        };
        var DataContainerDisable = "disable";
        if (this.state.btn_dataContainer) {
            DataContainerDisable = null;
        }

        var MsItems = [];
        var Heading = (
            <tr>
                <th onClick={this.test}><input id="cb_checkall" type="checkbox" onChange={this.checkAll} /></th>
                <th>{window.LanguageConfig.ModelService.Name}</th>
                <th>Source</th>
                <th>Snapshot</th>
                <th>{window.LanguageConfig.ModelService.Status}</th>
                <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
            </tr>
        );

        MsItems = this.state.data.map(function (item) {
            var datasource;
            var status;
            var button2;
            var button3;
            if (item.vs_source == 0) {
                datasource = (<span className="label label-info"><i className="fa fa-home"> </i> Local</span>);
            } else if (item.vs_source == 1) {
                datasource = (<span className="label label-info"><i className="fa fa-cloud"> </i> Remote</span>);
            }

            var snapshot;
            snapshot = (<img style={{ "width": "150px", "height": "60px" }} src={item.vs_img} />);

            if (item.vs_status == 1) {
                status = (<span className="badge badge-success hand" onClick={(e) => { this.stopVisualizeSerHandle(e, item._id) }}> Available</span>);
                button2 = (
                    <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openVisualizeSerHandle(e, item._id) }}>
                        <i className="fa fa-retweet"></i>&nbsp;Invoke
                    </button>
                );
            } else {
                status = (<span className="badge badge-defult hand" onClick={(e) => { this.startVisualizeSerHandle(e, item._id) }}> Disabled</span>);
                button2 = (
                    <button className="btn btn-warning btn-xs tooltips" type="button" data-toggle="tooltip" data-placement=" bottom" title={window.LanguageConfig.ModelService.Delete} data-original-title={window.LanguageConfig.ModelService.Delete}
                        onClick={(e) => { this.deleteVisualizeHandle(e, item._id) }}>
                        <i className="fa fa-trash-o"></i>&nbsp;Delete
                    </button>
                );
            }

            return (
                <tr key={item._id}>
                    <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}><input name="vs_check" type="checkbox" value={item._id} /></td>
                    <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}>{item.vs_model.vs_name}</td>
                    <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}>{datasource}</td>
                    <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}>{snapshot}</td>
                    <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}>{status}</td>
                    <td style={{ "textAlign": "center", "verticalAlign": "inherit" }}>
                        <button className="btn btn-info btn-xs" type="button" onClick={(e) => { this.openVisualizeInfoHandle(e, item._id) }}>
                            <i className="fa fa-book"> </i>{window.LanguageConfig.ModelServiceTable.Detail}
                        </button>&nbsp;{button2}&nbsp;
                    </td>
                </tr>
            );
        }.bind(this));

        var operation = (
            <div>
                <button className="btn btn-info" type="button" onClick={this.addLocalPackage} style={{ "marginLeft": "10px" }}><i className="fa fa-cloud-upload"></i>&nbsp;Add From Local</button>&nbsp;&nbsp;&nbsp;
                <button className="btn btn-info" type="button" data-toggle="modal" href="#dataContainer"><i className="fa fa-cloud-download"></i>&nbsp;Add From DataContainer</button>&nbsp;&nbsp;&nbsp;
                <button className="btn btn-info" type="button"><i className="fa fa-trash-o"></i>&nbsp;Delete Visualization Package</button>
            </div>
        );

        return (
            <div>
                {operation}
                <table className="display table table-bordered table-striped" id="dynamic-table">
                    <thead>
                        {Heading}
                    </thead>
                    <tbody>
                        {MsItems}
                    </tbody>
                </table>
                <div aria-hidden="true" aria-labelledby="dataContainerDialog" role="dialog" tabIndex="-1" id="dataContainer" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">x</button>
                                <h4 className="modal-title">Add From DataContainer</h4>
                            </div>
                            <div className="modal-body">
                                <form className="form-horizontal">
                                    <label htmlFor="txtNewDataContainerHost" >Host</label>
                                    <input id="txtNewDataContainerHost" placeholder="172.21.212.85" type="text" className="form-control" onBlur={this.checkServer} onFocus={this.disableConfirmBtn} />
                                    <label htmlFor="txtNewDataContainerPort" >Port</label>
                                    <input id="txtNewDataContainerPort" placeholder="8899" type="text" className="form-control" onBlur={this.checkServer} onFocus={this.disableConfirmBtn} />
                                    <label htmlFor="txtUserName">UserName</label>
                                    <input id="txtUserName" type="text" className="form-control" onFocus={this.disableConfirmBtn} />
                                    <label htmlFor="txtPassword">Password</label>
                                    <input id="txtPassword" type="text" className="form-control" onFocus={this.disableConfirmBtn} />
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button id="btn_close" type="button" className="btn btn-default" data-dismiss="modal" >Close</button>
                                <button id="btn_ok" type="button" className="btn btn-success" disabled={DataContainerDisable} onClick={this.onSubmit} >Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = DataVisualization;




