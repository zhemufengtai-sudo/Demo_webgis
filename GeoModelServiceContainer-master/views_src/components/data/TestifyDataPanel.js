/**
 * Created by Franklin on 2017/6/14.
 */

var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');

var TestifyDataPanel = React.createClass({
    getInitialState: function () {
        return {
            loading: true,
            err: null,
            data: null,
            index: 0
        };
    },

    componentDidMount: function () {
        this.refresh();
    },

    refresh: function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if (data.data.code == 1) {
                    this.setState({
                        loading: false,
                        err: null,
                        data: data.data.data
                    });
                }
                else if (data.data.code == -1) {
                    this.setState({
                        loading: false,
                        err: null,
                        data: []
                    });
                    NoteDialog.openNoteDia(window.LanguageConfig.Notice.WarningTitle, window.LanguageConfig.TestData.LoadTestifyFailed);
                }
            }, err => {
                if (err) {
                    this.setState({
                        loading: false,
                        err: err
                    });
                }
            }
        );
    },

    onSelectChange: function (e) {
        this.setState({ index: e.target.selectedIndex })
    },

    loadTestData: function (e) {
        var testData = this.state.data[this.state.index].inputs;
        if (testData == undefined || testData == null) {
            return NoteDialog.openNoteDia(window.LanguageConfig.Notice.WarningTitle, this.state.data[this.state.index].tag + window.LanguageConfig.TestData.LoadTestDataSuccessfully);
        }
        //添加路由，请求后台将testify目录下的数据进行类似于数据上传的操作，后返回一个json字符串
        var returnData;
        Axios.put(this.props['data-source'] + "?path=" + this.state.data[this.state.index].title).then(
            data => {
                if (data.data.code == 1) {
                    returnData = data.data.data;
                    if (JSON.stringify(returnData) === '[]') {
                        returnData = [];
                        NoteDialog.openNoteDia(window.LanguageConfig.Notice.WarningTitle, window.LanguageConfig.TestData.LoadTestifyFailed);
                    } else {
                        //进行配置数据操作
                        for (var i = 0; i < returnData[0].inputs.length; i++) {
                            window.addTestData(returnData[0].inputs[i].StateId, returnData[0].inputs[i].Event, returnData[0].inputs[i].DataId);
                        }
                        NoteDialog.openNoteDia(window.LanguageConfig.Notice.InfoTitle, this.state.data[this.state.index].tag + window.LanguageConfig.TestData.LoadTestDataSuccessfully);
                    }

                } else if (data.data.code == 0) {
                    returnData = [];
                    NoteDialog.openNoteDia(window.LanguageConfig.Notice.WarningTitle, window.LanguageConfig.TestData.LoadTestifyFailed);
                } else if (data.data.code == -1) {
                    returnData = [];
                    NoteDialog.openNoteDia(window.LanguageConfig.Notice.WarningTitle, window.LanguageConfig.TestData.LoadTestifyFailed);
                }
            },
            err => {
                if (err) {
                    this.setState({
                        err: err
                    });
                    NoteDialog.openNoteDia(window.LanguageConfig.Notice.WarningTitle, window.LanguageConfig.TestData.LoadTestifyFailed);
                }
            }
        );
    },

    deleteTestData: function (e) {
        Axios.delete(this.props['data-source'] + "?path=" + this.state.data[this.state.index].title).then(
            data => {
                if (data.data.result == 'suc') {
                    if (data.data.data) {
                        NoteDialog.openNoteDia(window.LanguageConfig.Notice.InfoTitle, this.state.data[this.state.index].tag + 'data delete successful !');
                        this.refresh();
                        this.forceUpdate();
                    }
                    else {

                        NoteDialog.openNoteDia(window.LanguageConfig.Notice.InfoTitle, this.state.data[this.state.index].tag + data.data.message);
                        this.refresh();
                        this.forceUpdate();
                    }
                } else {
                    NoteDialog.openNoteDia(window.LanguageConfig.Notice.InfoTitle, this.state.data[this.state.index].tag + data.data.message);
                    this.refresh();
                    this.forceUpdate();
                }
            },
            err => { }
        );
    },

    render: function () {
        var body = null;
        if (this.state.loading) {
            body = (
                <div className="panel-body">
                    <div id="testify-body" className="panel-body" >
                        Loading...
                    </div>
                </div>
            );
        }
        else if (this.state.err) {
            body = (
                <div className="panel-body">
                    <div id="testify-body" className="panel-body" >
                        Error : {JSON.stringify(this.state.err)}
                    </div>
                </div>
            );
        }
        else {
            if (this.state.data.length == 0) {
                body = (
                    <div id="testify-body" className="panel-body" >
                        <h4>{window.LanguageConfig.TestData.NoTestData}</h4>
                    </div>
                );
            }
            else {
                var selectOptions = null;
                selectOptions = this.state.data.map(function (element) {
                    return (<option key={element.tag} >{element.tag}</option>);
                });

                var delButton = null;
                if (this.props["data-type"] != 'CUSTOM') {
                    delButton = (<input id="btn_testify_del" type="button" className="btn btn-danger" value={window.LanguageConfig.TestData.DeleteTestData} onClick={this.deleteTestData} />);
                }

                body = (
                    <div id="testify-body" className="panel-body" >
                        <div className="form-horizontal adminex-form" >
                            <div className="form-group" >
                                <label className="col-sm-2 col-sm-2 control-label" htmlFor="testifies">{window.LanguageConfig.TestData.Tag}:</label>
                                <div className="col-sm-6" >
                                    <select id="testifies" className="form-control m-bot15" onChange={this.onSelectChange} >
                                        {selectOptions}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" >
                                <label className="col-sm-2 col-sm-2 control-label" >{window.LanguageConfig.TestData.Description}:</label>
                                <div className="col-sm-6" >
                                    <p>{this.state.data[this.state.index].detail}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <input id="btn_testify_load" type="button" className="btn btn-warning" value={window.LanguageConfig.TestData.LoadTestData} onClick={this.loadTestData} /> &nbsp;&nbsp;&nbsp;
                                {delButton}
                            </div>
                        </div>
                    </div>
                );
            }
        }

        return (
            <div className="panel panel-info" id="testify-panel">
                <div className="panel-heading" style={{ "backgroundColor": "#46B8DA", "bordeColor": "#46B8DA" }}>
                    {window.LanguageConfig.TestData.Title}
                    <span className="tools pull-right">
                        <a href="javascript:;" className="fa fa-chevron-down"></a>
                    </span>
                </div>
                {body}
            </div>
        );
    }
});

module.exports = TestifyDataPanel;