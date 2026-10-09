/**
 * Created by SCR on 2017/6/10.
 */
var React = require('react');
var Axios = require('axios');
var EnMatchTable = require('./enMatchTable');
var NoteDialog = require('../../action/utils/noteDialog');

var EnMatchStepy = React.createClass({
    getInitialState: function () {
        var urlFinished = '/modelser/';
        var matchFinished = '/enMatchSuc/';
        var matchFailed = '/enMatchFail/';
        var urlFailed = '/modelser/new';
        //添加获取MDL信息url
        var loadMdlUrl = '/modelser/mdlRuntime/';
        return {
            ui: null,
            sweRst: null,
            hweRst: null,
            urlFinished: urlFinished,
            matchFinished: matchFinished,
            matchFailed: matchFailed,
            urlFailed: urlFailed,
            oid: null,
            matchstate: -1,
            loadMdlUrl: loadMdlUrl,
            matchresult: 0
        };
    },

    componentDidMount: function () {
        this.setState({ oid: this.props.id });
        //进行请求获取MDL Runtime节点信息，判断是否有软硬件信息以及节点是否标准
        this.loadMDL();

        this.forceUpdate();
    },

    loadMDL: function () {
        var url = this.state.loadMdlUrl + this.props.pid + '?place=' + this.props.place;
        Axios.get(url).then(
            data => {
                if (data.data.err) {
                    $.gritter.add({
                        title: 'Warning: ',
                        text: 'Failed to get hardware and software information, please correct the MDL file!',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({ matchstate: 0 }, function () {
                        // this.forceUpdate();
                        $('#MatchModal').modal('show');
                    });

                } else if (data.data.tabledata) {
                    let swe_data = data.data.tabledata.swe;
                    let hwe_data = data.data.tabledata.hwe;
                    if(swe_data.length == 0 && hwe_data.length == 0){
                        $.gritter.add({
                            title: 'Remind：',
                            text: 'No hardware and software environment information, maybe check out the MDL!',
                            sticky: false,
                            time: 2000
                        });
                        this.setState({ matchstate: 0 }, function () {
                            // this.forceUpdate();
                            $('#MatchModal').modal('show');
                        });
                    }else if (swe_data.length!= 0 && swe_data[0].platform === 'null') {
                        $.gritter.add({
                            title: 'Warning',
                            text: 'MDL Environment information is wrong, Please check out the MDL!',
                            sticky: false,
                            time: 2000
                        });
                        this.setState({ matchstate: 0 }, function () {
                            // this.forceUpdate();
                            $('#MatchModal').modal('show');
                        });
                    } else {
                        this.setState({ matchstate: 1 });
                        this.forceUpdate();
                    }
                }

            },
            err => {
                $.gritter.add({
                    title: 'Warning: ',
                    text: 'MDL Environment information is wrong, Please check out the MDL!',
                    sticky: false,
                    time: 2000
                });
                this.setState({ matchstate: 0 }, function () {
                    // this.forceUpdate();
                    $('#MatchModal').modal('show');
                });

            }
        )
    },


    GetMatchResult: function () {
        var self = this;
        webix.ready(function () {
            self.state.sweRst = self.refs['swe-table-ref'].getMatchedResult().result;
            self.state.hweRst = self.refs['hwe-table-ref'].getMatchedResult().result;
            var sweRst = 1, hweRst = 1;
            var sweRstLen = self.state.sweRst.length;
            var hweRstLen = self.state.hweRst.length;
            for (var i = 0; i < sweRstLen; i++) {
                if (self.state.sweRst[i].result == 0) {
                    sweRst = 0;
                    break;
                }
            }
            for (var j = 0; j < hweRstLen; j++) {
                if (self.state.hweRst[j].result == 0) {
                    hweRst = 0;
                    break;
                }
            }
            if (self.state.sweRst.length == 0) {
                self.state.sweRst.push({
                    name: 'null',
                    result: -1
                });
                sweRstLen += 1;
            }
            if (self.state.hweRst.length == 0) {
                self.state.hweRst.push({
                    name: 'null',
                    result: -1
                });
                hweRstLen += 1;
            }
            var sweHeight, hweHeight;
            sweHeight = 34 * (sweRstLen > 4 ? 4 : sweRstLen);
            hweHeight = 34 * (hweRstLen > 4 ? 4 : hweRstLen);
            var hweWidth = self.props.css.width.tabletree / 2;
            var rstList = {
                type: 'line',
                cols: [{
                    type: 'clean',
                    rows: [{
                        view: 'template',
                        type: 'header',
                        height: 40,
                        css: 'webix-list-header',
                        template: 'Software Environment'
                    }, {
                        type: 'clean',
                        view: 'list',
                        width: self.props.css.width.tabletree / 2,
                        height: sweHeight,
                        template: function (obj, common, value) {
                            return obj.name;
                        },
                        scheme: {
                            $init: function (obj) {
                                if (obj.result == 0)
                                    obj.$css = 'matchList-unmatched';
                                else if (obj.result == 1)
                                    obj.$css = 'matchList-matched';
                                else if (obj.result == -1)
                                    obj.$css = 'matchList-null';
                            }
                        },
                        data: self.state.sweRst,
                        scrollX: true,
                        scrollY: true,
                        borderless: true
                    }]
                }, {
                    type: 'clean',
                    rows: [{
                        view: 'template',
                        type: 'header',
                        height: 40,
                        css: 'webix-list-header',
                        template: 'Hardware Environment'
                    }, {
                        type: 'clean',
                        view: 'list',
                        width: hweWidth,
                        height: hweHeight,
                        template: function (obj, common, value) {
                            return obj.name;
                        },
                        scheme: {
                            $init: function (obj) {
                                if (obj.result == 0)
                                    obj.$css = 'matchList-unmatched';
                                else if (obj.result == 1)
                                    obj.$css = 'matchList-matched';
                                else if (obj.result == -1)
                                    obj.$css = 'matchList-null';
                            }
                        },
                        data: self.state.hweRst,
                        scrollX: true,
                        scrollY: true,
                        borderless: true
                    }]
                }]
            };
            if (sweRst && hweRst) {
                webix.ui({
                    id: 'match-rst',
                    type: 'clean',
                    width: self.props.css.width.tabletree,
                    container: self.props.id + '-match-result',
                    rows: [rstList, {
                        type: 'clean',
                        rows: [{
                            height: 20
                        }, {
                            type: 'clean',
                            view: 'template',
                            height: 20,
                            template: 'Environment is matched successfully, you can deploy the model!'
                        }, {
                            type: 'form',
                            view: 'button',
                            value: 'Deploy',
                            width: 100,
                            align:'right',
                            click: function () {
                                var urlSuc = self.state.matchFinished + self.state.oid;
                                Axios.get(urlSuc).then(
                                    data => {
                                        if (data.data.result == 'suc') {
                                            NoteDialog.openNoteDia('Info', 'Model Deployment success');
                                            window.location.href = self.state.urlFinished + self.state.oid;
                                        } else {
                                            NoteDialog.openNoteDia('Model Deployment failed', 'failed: ' + JSON.stringify(data.data.message));
                                        }
                                    },
                                    err => {
                                        NoteDialog.openNoteDia('Model Deployment failed！', 'failed: ' + JSON.stringify(err));
                                    }
                                )
                            }
                        }]
                    }]
                });
                //self.props.changeModalBtn(false);
            }
            else {
                webix.ui({
                    type: 'clean',
                    width: self.props.css.width.tabletree,
                    container: self.props.id + '-match-result',
                    rows: [rstList, {
                        type: 'clean',
                        rows: [{
                            height: 20
                        }, {
                            type: 'clean',
                            view: 'template',
                            height: 20,
                            template: 'Environment match failed,some hardware or software environment do not match!'
                        }, {
                            type: 'danger',
                            view: 'button',
                            value: 'Cancle',
                            width: 100,
                            align:'right',
                            click: function () {
                                var urlmsFail = self.state.matchFailed + self.state.oid;
                                Axios.delete(urlmsFail).then(
                                    data => {
                                        if (data.data.result == "suc") {
                                            NoteDialog.openNoteDia('Info', 'Model service undeployment success, please choose proper service machine');
                                            window.location.href = self.state.urlFailed;
                                        } else {
                                            NoteDialog.openNoteDia('Model UnDeployment failed', 'failed: ' + JSON.stringify(data.data.message));
                                        }
                                    },
                                    err => {
                                        NoteDialog.openNoteDia('Model UnDeployment failed！', 'failed: ' + JSON.stringify(err));
                                    }
                                )
                            }
                        }]
                    }]
                });
                //self.props.changeModalBtn(true);
            }
        });
    },

    tabOnClick: function (e) {
        var self = this;
        if ($($('#' + this.props.id + ' ul li')[2]).hasClass('active')) {
            if (self.refs['swe-table-ref'].hadLoaded() && self.refs['hwe-table-ref'].hadLoaded()) {
                //this.props.changeModalFooter(true);
                $('#' + self.props.id + '-match-result').children().remove();
                this.GetMatchResult();
            }
            else {
                $('#' + self.props.id + '-match-result').children().remove();
                webix.ready(function () {
                    webix.ui({
                        container: self.props.id + '-match-result',
                        template: '<span><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>&nbsp;&nbsp;&nbsp;Loading...</span>',
                        height: 60,
                        type: 'clean',
                        borderless: true,
                        border: false
                    })
                })
            }
        }
        else {
            console.log('hhahha');
            //this.props.changeModalFooter(false);
        }
    },

    changeMatchPanel: function(e,panelId){
      var self = this;
      if(self.refs['swe-table-ref'].hadLoaded() && self.refs['hwe-table-ref'].hadLoaded()){
        $('#' + self.props.id + '-match-result').children().remove();
        this.GetMatchResult();
      }else{
        $('#' + self.props.id + '-match-result').children().remove();
        webix.ready(function () {
            webix.ui({
                container: self.props.id + '-match-result',
                template: '<span><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>&nbsp;&nbsp;&nbsp;Loading...</span>',
                height: 60,
                type: 'clean',
                borderless: true,
                border: false
            })
        })
      }
      var parent_element = $('#' + panelId);
      parent_element.toggleClass("contract");
    },

    removeTab3: function () {
        $('#' + this.props.id + '-match-result').children().remove();
    },

    closeModal: function (e) {
        $('#MatchModal').modal('hide');
        var urlmsFail = this.state.matchFailed + this.state.oid;
        Axios.delete(urlmsFail).then(
            data => {
                if (data.data.result == 'suc') {
                    NoteDialog.openNoteDia('Info', 'Skip Environmet Match success');
                    window.location.href = this.state.urlFailed;
                } else {
                    NoteDialog.openNoteDia('Skip Environmet Match failed', 'failed: ' + JSON.stringify(data.data.message));
                }
            },
            err => {
                NoteDialog.openNoteDia('Skip Environmet Match failed！', 'failed: ' + JSON.stringify(err));
            }
        )
    },

    mandatoryDeploy: function (e) {
        $('#MatchModal').modal('hide');
        var urlSuc = this.state.matchFinished + this.state.oid;
        Axios.get(urlSuc).then(
            data => {
                if (data.data.result == 'suc') {
                    NoteDialog.openNoteDia('Info', 'Forced Deployment success');
                    window.location.href = this.state.urlFinished + this.state.oid;
                } else {
                    NoteDialog.openNoteDia('Forced Deployment failed', 'failed: ' + JSON.stringify(data.data.message));
                }
            },
            err => {
                NoteDialog.openNoteDia('Forced Deployment failed！', 'failed: ' + JSON.stringify(err));
            }
        )
    },

    changePanel: function (e, panelId) {
        var parent_element = $('#' + panelId);
        parent_element.toggleClass("contract");
    },

    setSet(obj){
     this.setState(obj);
    },

    render: function () {
        var content = null;
        var self = this;
        //当state状态发生改变时，就响应事件
        if(this.state.matchresult){
            if(self.refs['swe-table-ref'].hadLoaded() && self.refs['hwe-table-ref'].hadLoaded()){
                $('#' + self.props.id + '-match-result').children().remove();
                self.GetMatchResult();
              }else{
                $('#' + self.props.id + '-match-result').children().remove();
                webix.ready(function () {
                    webix.ui({
                        container: self.props.id + '-match-result',
                        template: '<span><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>&nbsp;&nbsp;&nbsp;Loading...</span>',
                        height: 60,
                        type: 'clean',
                        borderless: true,
                        border: false
                    })
                })
              }
        }

        if (this.state.matchstate === 1) {
            // content = (
            //     <section className="panel">
            //         <header className="panel-heading custom-tab ">
            //             <ul className="nav nav-tabs">
            //                 <li className="active" onClick={e => { this.tabOnClick(e) }}>
            //                     <a href="#swe-tab" data-toggle="tab">Software Enviroment</a>
            //                 </li>
            //                 <li className="" onClick={e => { this.tabOnClick(e) }}>
            //                     <a href="#hwe-tab" data-toggle="tab">Hardware Enviroment</a>
            //                 </li>
            //                 <li className="" onClick={e => { this.tabOnClick(e) }}>
            //                     <a href="#match-result" data-toggle="tab">Match result</a>
            //                 </li>
            //             </ul>
            //         </header>
            //         <div className="panel-body">
            //             <div className="tab-content">
            //                 <div className="tab-pane active" id="swe-tab">
            //                     <EnMatchTable
            //                         tableID="swe-table"
            //                         type="swe"
            //                         pid={this.props.pid}
            //                         place={this.props.place}
            //                         css={this.props.css}
            //                         ref='swe-table-ref'
            //                         removeTab3={this.removeTab3}
            //                     />
            //                 </div>
            //                 <div className="tab-pane" id="hwe-tab">
            //                     <EnMatchTable
            //                         tableID="hwe-table"
            //                         type="hwe"
            //                         pid={this.props.pid}
            //                         place={this.props.place}
            //                         css={this.props.css}
            //                         ref='hwe-table-ref'
            //                         removeTab3={this.removeTab3}
            //                     />
            //                 </div>
            //                 <div className="tab-pane" id="match-result">
            //                     <div id={this.props.id + '-match-result'}></div>
            //                 </div>
            //             </div>
            //         </div>
            //     </section>
            // )

            content = (
                <div>
                    <div id="software" style={{marginBottom: '10px'}}>
                        <div className="panel panel-info" id='swe-panel-body'>
                            <div className="panel-heading">
                                Software Environment Match
                                <span className="tools pull-right">
                                    <a href="javascript:;" className="fa fa-chevron-down" onClick={(e) => { this.changePanel(e, 'swe-panel-body') }}></a>
                                </span>
                            </div>
                            <div className="panel-body" style={{ marginBottom: '10px' }}>
                                <EnMatchTable
                                    tableID="swe-table"
                                    type="swe"
                                    matchresult = {this.state.matchresult}
                                    pid={this.props.pid}
                                    place={this.props.place}
                                    css={this.props.css}
                                    ref='swe-table-ref'
                                    removeTab3={this.removeTab3}
                                    setSet={this.setSet}
                                />
                            </div>
                        </div>
                    </div>

                    <div id="hardware" style={{marginBottom: '10px'}}>
                        <div className="panel panel-info" id='hwe-panel-body'>
                            <div className="panel-heading">
                                Hardware Environment Match
                                <span className="tools pull-right">
                                    <a href="javascript:;" className="fa fa-chevron-down" onClick={(e) => { this.changePanel(e, 'hwe-panel-body') }}></a>
                                </span>
                            </div>
                            <div className="panel-body" style={{ marginBottom: '10px' }}>
                                <EnMatchTable
                                    tableID="hwe-table"
                                    type="hwe"
                                    matchresult = {this.state.matchresult}
                                    pid={this.props.pid}
                                    place={this.props.place}
                                    css={this.props.css}
                                    ref='hwe-table-ref'
                                    removeTab3={this.removeTab3}
                                    setSet={this.setSet}    
                                />
                            </div>
                        </div>
                    </div>

                    <div id="matchresult" style={{marginBottom: '10px'}}>
                        <div className="panel panel-info contract" id="match-panel-body">
                            <div className="panel-heading">
                                Match Results
                                <span className="tools pull-right">
                                    <a href="javascript:;" className="fa fa-chevron-down" onClick={(e) => { this.changeMatchPanel(e, 'match-panel-body') }}></a>
                                </span>
                            </div>
                            <div className="panel-body" style={{ marginBottom: '10px' }}>
                                <div id="match-result">
                                    <div id={this.props.id + '-match-result'}>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            )
        } else if (this.state.matchstate === 0) {
            content = (
                <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id="MatchModal" className="modal fade">
                    <div className="modal-dialog" style={{ width: '750px' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    Environment Matching
                        </h4>
                            </div>
                            <div className="modal-body">
                                <p>The environment information about software and hardware is null or maybe with some error about it, Do you want to skip the environment match and deploy the model Mandatory ?  </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={(e) => { this.closeModal(e) }}>Close
                        </button>
                                <button type="button" className="btn btn-primary" onClick={(e) => { this.mandatoryDeploy(e) }}>
                                    Mandatory Deployment
                        </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div id={this.props.id}>
                {content}
            </div>
        )

    }
});

module.exports = EnMatchStepy;