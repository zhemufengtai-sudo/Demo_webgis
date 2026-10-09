/**
 * Created by SCR on 2017/6/1.
 */
var React = require('react');
var Axios = require('axios');

var EnMatchTable = React.createClass({
    getInitialState: function () {
        return {
            loading: true,
            err: null,
            demandsEn: null,
            allEn: null,
            tabletree: null,
            matchTT: null,
            allTT: null,
            modalUI: null,
            btnDisabled: true,
            done: false,
            pid: ''
        }
    },

    loadData: function () {
        var url = '/modelser/tabledata/' + this.props.pid + '?place=' + this.props.place + '&type=' + this.props.type;
        Axios.get(url).then(
            data => {
                if (data.data.err) {
                    $.gritter.add({
                        title: 'Warning: ',
                        text: 'Failed to get the matching environment, please try again later!',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({ loading: false, err: { code: 'Getting the matching environment failure!' } });
                }
                else if (data.data.tabledata) {
                    this.state.pid = this.props.pid;
                    this.state.demandsEn = data.data.tabledata;
                    this.Init();
                    this.setState({ loading: false, demandsEn: data.data.tabledata });
                }
            },
            err => {
                $.gritter.add({
                    title: 'Warning: ',
                    text: 'Failed to get the matching environment, please try again later!',
                    sticky: false,
                    time: 2000
                });
                this.setState({ loading: false, err: err });
            }
        );

        var url2 = '/setting/enviro?method=get&type=';
        var zhCnType;
        var enCnType;
        if (this.props.type == 'swe') {
            url2 += 'software';
            zhCnType = '软件';
            enCnType = "software";
        }
        else if (this.props.type == 'hwe') {
            url2 += 'hardware';
            zhCnType = '硬件';
            enCnType = "hardware";
        }
        Axios.get(url2).then(
            data => {
                if (data.data.status == 1) {
                    this.state.pid = this.props.pid;
                    this.setState({ loading: false, allEn: data.data.enviro })
                }
                else {
                    $.gritter.add({
                        title: 'Warning: ',
                        text: 'Failed to get the' + enCnType + 'environment list, please try again later!',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({ loading: false, err: { code: 'Failed to get the' + enCnType + 'environment list!' } });
                }
            },
            err => {
                $.gritter.add({
                    title: 'Warning: ',
                    text: 'Failed to get the' + enCnType + 'environment list, please try again later!',
                    sticky: false,
                    time: 2000
                });
                this.setState({ loading: false, err: err });
            }
        );
    },

    componentDidMount: function () {
        this.loadData();
    },

    hadLoaded: function () {
        return !this.state.loading;
    },

    Init: function () {
        $('#' + this.props.tableID).children().remove();
        $('#pager_' + this.props.tableID).children().remove();
        if (this.props.removeTab3)
            this.props.removeTab3();
        var demandsEn = this.state.demandsEn;
        var self = this;
        var type = (self.props.type.indexOf('swe') == -1) ? '硬件' : '软件';
        if (demandsEn) {
            webix.ready(function () {
                var pagerID = "pager_" + self.props.tableID;
                var myjson = webix.DataDriver.myjson = webix.copy(webix.DataDriver.json);
                myjson.child = function (obj) {
                    return obj.children;
                };
                webix.locale.pager = {
                    next: ">",
                    prev: "<"
                };

                var columns = [{
                    id: 'title',
                    header: 'Key',
                    template: '{common.treetable()} #title#',
                    // adjust:'data',
                    width: self.props.css.width.title
                }, {
                    id: 'Value',
                    header: 'Demand',
                    // adjust:'data',
                    width: self.props.css.width.demand
                }, {
                    id: 'value',
                    header: 'Matched&nbsp;' +
                    '<button id="' + self.props.tableID + '-matchBtn" class="tt-select-btn tabletree-btn btn btn-info btn-xs" type="button" ' +
                    'onclick="window[\'' + self.props.tableID + '-props\'].showModal()" ' +
                    'data-toggle="modal" ' +
                    'data-target="#' + self.props.tableID + '-select-modal" ' +
                    ' ><i class=""></i>more</button>',
                    width: self.props.css.width.enviro,
                    // adjust:'data',
                    template: function (obj, common, value) {
                        if (obj.title == 'result') {
                            var rootID = obj.id;
                            while (self.state.tabletree.getItem(rootID).$parent != 0) {
                                rootID = self.state.tabletree.getItem(rootID).$parent;
                            }
                            self.state.tabletree.getItem(rootID).result = value;
                            if (value == 1) {
                                if (value != obj.defaultValue) {
                                    return "<div class='webix_table_checkbox webix_checked'>Forced Matched</div>";
                                }
                                return "<div class='webix_table_checkbox webix_checked'>Matched</div>";
                            }
                            else {
                                if (value != obj.defaultValue) {
                                    return "<div class='webix_table_checkbox webix_notchecked'>Forced Unmatched</div>";
                                }
                                return "<div class='webix_table_checkbox webix_notchecked'>Unmatched</div>";
                            }
                        }
                        else if (obj.value && obj.value != undefined)
                            return obj.value;
                        else
                            return '';
                    },
                    editor: 'inline-checkbox',
                    fillspace: true
                }
                    // , {
                    //     id: 'select',
                    //     header: 'Select',
                    //     width: 70,
                    //     css: "tabletree-operate",
                    //     template: function (obj) {
                    //         if(obj.type == 'Object')
                    //             return "<button class='tt-select-btn tabletree-btn btn btn-info btn-xs' " +
                    //                 "id='" + obj.id + "_select_btn' " +
                    //                 "type='button'" +
                    //                 "onclick='showModal(this)'" +
                    //                 "data-toggle='modal' " +
                    //                 "data-target='#'" + self.props.tableID + "'-select-modal'" +
                    //                 "><i class='fa fa-search'></i></button>";
                    //         return '';
                    //     }
                    // }
                    // , {
                    //     id: 'evaluate',
                    //     header: 'Evaluate',
                    //     width: 120,
                    //     css: "tabletree-operate",
                    //     editor: 'select',
                    //     options: ['未知','匹配','半匹配','不匹配']
                    // }
                ];

                var tabletree = webix.ui({
                    type: 'line',
                    container: self.props.tableID,
                    view: 'treetable',
                    columns: columns,
                    pager: {
                        template: "{common.prev()}&nbsp;<div class='paging1'>{common.page()}/#limit#</div>{common.next()}",
                        container: pagerID,
                        size: 1,
                        group: 1,
                        level: 1,
                        width: 180,
                        animate: true,
                        on: {
                            onAfterPageChange: function (new_page) {
                                if (!window[self.props.tableID + '-props'])
                                    window[self.props.tableID + '-props'] = {};
                                window[self.props.tableID + '-props'].currentPage = new_page;
                                if (new_page == this.config.limit - 1)
                                    self.state.done = true;
                            }
                        }
                    },
                    scroll: 'xy',
                    checkboxRefresh: true,
                    editable: true,
                    autoheight: true,
                    width: self.props.css.width.tabletree,
                    select: false,
                    resizeColumn: { headerOnly: true },
                    datatype: 'myjson',
                    data: demandsEn
                });
                self.state.tabletree = tabletree;
                if (!window[self.props.tableID + '-props'])
                    window[self.props.tableID + '-props'] = {};
                window[self.props.tableID + '-props'].currentPage = 0;

                tabletree.openAll();

                self.addDefaultMatched();

                tabletree.attachEvent('onBeforeEditStart', function (cell) {
                    if (this.getItem(cell.row).title != 'result') {
                        return false;
                    }
                    return true;
                });

                tabletree.attachEvent('onAfterRender', function () {
                    let keyvalue = self.props.matchresult + 1;
                    self.props.setSet({ matchresult: keyvalue });
                })

                window[self.props.tableID + '-props'].showModal = function () {
                    var i = 0;
                    var id = self.state.tabletree.getFirstId();
                    if (id == undefined) {
                        $.gritter.add({
                            title: 'Warning:',
                            text: 'Not all environmental conditions matched!',
                            sticky: false,
                            time: 2000
                        });
                    }
                    else {
                        while (i < window[self.props.tableID + '-props'].currentPage && id) {
                            id = self.state.tabletree.getNextSiblingId(id);
                            i += 1;
                        }
                        window.demandNodeID = id;
                        var modalData = self.state.tabletree.getItem(id).matched;
                        var width = $('#' + self.props.tableID + '-select-modal .modal-dialog').width();
                        width = (width - 100) / 2;

                        var myjson = webix.DataDriver.myjson = webix.copy(webix.DataDriver.json);
                        myjson.child = function (obj) {
                            return obj.children;
                        };
                        webix.locale.pager = {
                            first: "<<",
                            last: ">>",
                            next: ">",
                            prev: "<"
                        };
                        var modalColumns1 = [{
                            id: 'title',
                            header: 'Key',
                            template: '{common.space()}{common.treecheckbox()}{common.icon()}#title#',
                            width: width
                        }, {
                            id: 'Value',
                            header: 'Value',
                            width: width,
                            fillspace: true
                        }];
                        var modalColumns2 = [{
                            id: 'title',
                            header: 'Key',
                            template: '{common.space()}{common.treecheckbox()}{common.icon()}#title#',
                            width: width
                        }, {
                            id: 'Value',
                            header: 'Value',
                            width: width,
                            fillspace: true
                        }];
                        var pagerModal1 = {
                            paddingY: 15,
                            rows: [{
                                view: 'pager',
                                template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                                id: self.props.tableID + '_modal_pager1',
                                size: 10,
                                group: 5,
                                width: 500,
                                level: 1,
                                animate: true,
                            }]
                        };
                        var pagerModal2 = {
                            paddingY: 15,
                            rows: [{
                                view: 'pager',
                                template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                                id: self.props.tableID + '_modal_pager2',
                                size: 10,
                                group: 5,
                                width: 500,
                                level: 1,
                                animate: true,
                            }]
                        };
                        var modalTT1 = {
                            view: 'treetable',
                            columns: modalColumns1,
                            pager: self.props.tableID + '_modal_pager1',
                            editable: false,
                            autoheight: true,
                            maxWidth: width * 2,
                            scroll: 'xy',
                            select: 'row',
                            resizeColumn: true,
                            datatype: 'myjson',
                            data: modalData == null ? [] : modalData,
                            on: {
                                //最多只能选中一个
                                'onItemCheck': function (id, state) {
                                    if (state) {
                                        var checked = this.getChecked();
                                        for (var i = 0; i < checked.length; i++) {
                                            if (id == checked[i])
                                                continue;
                                            this.uncheckItem(checked[i]);
                                        }
                                    }
                                    var submitBtn = $('#' + self.props.tableID + '-select-modal .btn-tt-submit');
                                    if (this.getChecked().length != 0) {
                                        self.setState({ btnDisabled: false });
                                    }
                                    else {
                                        self.setState({ btnDisabled: true });
                                    }
                                }
                            }
                        };
                        var modalTT2 = {
                            view: 'treetable',
                            columns: modalColumns2,
                            pager: self.props.tableID + '_modal_pager2',
                            editable: false,
                            autoheight: true,
                            maxWidth: width * 2,
                            scroll: 'xy',
                            select: 'row',
                            resizeColumn: true,
                            datatype: 'myjson',
                            data: self.state.allEn == null ? [] : self.state.allEn,
                            on: {
                                //最多只能选中一个
                                'onItemCheck': function (id, state) {
                                    if (state) {
                                        var checked = this.getChecked();
                                        for (var i = 0; i < checked.length; i++) {
                                            if (id == checked[i])
                                                continue;
                                            this.uncheckItem(checked[i]);
                                        }
                                    }
                                    var submitBtn = $('#' + self.props.tableID + '-select-modal .btn-tt-submit');
                                    if (this.getChecked().length != 0) {
                                        self.setState({ btnDisabled: false });
                                    }
                                    else {
                                        self.setState({ btnDisabled: true });
                                    }
                                }
                            }
                        };
                        self.state.modalUI = webix.ui({
                            type: 'line',
                            container: $('#' + self.props.tableID + '-select-modal .modal-body').attr('id'),
                            rows: [{
                                view: 'tabbar',
                                multiview: true,
                                options: [
                                    { id: '1', value: 'Matched Environmental Conditions', width: 100 },
                                    { id: '2', value: 'All Environmental Conditions', width: 100 }
                                ],
                                on: {
                                    'onChange': function () {
                                        var submitBtn = $('#' + self.props.tableID + '-select-modal .btn-tt-submit');
                                        var tt;
                                        if (this.getValue() == '1') {
                                            tt = self.state.matchTT;
                                        }
                                        else if (this.getValue() == '2') {
                                            tt = self.state.allTT;
                                        }
                                        if (tt.getChecked().length != 0) {
                                            self.setState({ btnDisabled: false });
                                        }
                                        else {
                                            self.setState({ btnDisabled: true });
                                        }
                                    }
                                }
                            }, {
                                cells: [
                                    {
                                        id: '1',
                                        rows: [
                                            pagerModal1,
                                            modalTT1
                                        ]
                                    },
                                    {
                                        id: '2',
                                        rows: [
                                            pagerModal2,
                                            modalTT2
                                        ]
                                    }
                                ]
                            }]
                        });
                        self.state.matchTT = self.state.modalUI.getChildViews()[1].getChildViews()[0].getChildViews()[1];
                        self.state.allTT = self.state.modalUI.getChildViews()[1].getChildViews()[1].getChildViews()[1];

                        $('#' + self.props.tableID + '-select-modal').modal('show');


                        $('#' + self.props.tableID + '-select-modal').on('show.bs.modal', function () {
                            var submitBtn = $('#' + self.props.tableID + '-select-modal .btn-tt-submit');
                            var tt;
                            var tabUI = self.state.modalUI.getChildViews()[0];
                            if (tabUI.getValue() == '1') {
                                tt = self.state.matchTT;
                            }
                            else if (tabUI.getValue() == '2') {
                                tt = self.state.allTT;
                            }
                            if (tt.getChecked().length != 0) {
                                self.setState({ btnDisabled: false });
                            }
                            else {
                                self.setState({ btnDisabled: true });
                            }
                        });

                        $('#' + self.props.tableID + '-select-modal').on("hidden.bs.modal", function () {
                            $(this).find('.modal-body').children().remove();
                            window.demandNodeID = '';
                        });

                    }
                };






                // var height = self.props.css.height.tabbar;
                // webix.ui({
                //     container:'enMatchSpan',
                //     height:height
                // });
            })
        }
    },

    addDefaultMatched: function () {
        var tt = this.state.tabletree;
        var itemID = tt.getFirstId();
        while (itemID) {
            var itemNode = tt.getItem(itemID);
            var defaultMatched = itemNode.matched[0];
            if (defaultMatched) {
                // {
                //     var score = 0;
                //     for(var i=0;i<defaultMatched.children.length;i++){
                //         if(defaultMatched.children[i].title == 'score'){
                //             score = defaultMatched.children[i].Value;
                //             break;
                //         }
                //     }
                //     if(score >= 1.0){
                //         itemNode.evaluate = '匹配';
                //     }
                //     else{
                //         itemNode.evaluate = '不匹配';
                //         // continue;
                //     }
                // }
                var score = 0;
                for (var i = 0; i < itemNode.children.length; i++) {
                    for (var j = 0; j < defaultMatched.children.length; j++) {
                        if (itemNode.children[i].title == 'result' && defaultMatched.children[j].title == 'score') {
                            score = defaultMatched.children[j].Value;
                            itemNode.children[i].value = score >= 1 ? 1 : 0;
                            itemNode.result = score >= 1 ? 1 : 0;
                            itemNode.children[i].defaultValue = score >= 1 ? 1 : 0;
                            tt.refresh();
                        }
                        if (itemNode.children[i].title == defaultMatched.children[j].title) {
                            if (itemNode.children[i].title == 'alias') {
                                for (var k = 0; k < defaultMatched.children[j].children.length; k++) {
                                    var tmp = defaultMatched.children[j].children[k];
                                    this.state.tabletree.add({
                                        title: itemNode.children[i].$count,
                                        value: tmp.Value,
                                        type: 'string'
                                    }, -1, itemNode.children[i].id);
                                    tt.refresh();
                                }
                            }
                            else {
                                itemNode.children[i].value = defaultMatched.children[j].Value;
                            }
                            tt.refresh();
                        }
                    }
                }
            }
            else {
                itemNode.result = 0;
                tt.refresh();
            }
            itemID = tt.getNextSiblingId(itemID);
        }
    },

    changeMatched: function (e) {
        if (window.demandNodeID && window.demandNodeID == '')
            return;
        var tt;
        var tabUI = this.state.modalUI.getChildViews()[0];
        var tabValue = tabUI.getValue();
        if (tabValue == '1') {
            tt = this.state.matchTT;
        }
        else if (tabValue == '2') {
            tt = this.state.allTT;
        }
        var checkedID = tt.getChecked();
        if (checkedID.length != 0)
            checkedID = checkedID[0];
        else
            checkedID = null;
        if (checkedID) {
            var checkedNode = tt.getItem(checkedID);
            var originalNode = this.state.tabletree.getItem(window.demandNodeID);
            // {
            //     var score = 0;
            //     for(var i=0;i<checkedNode.children.length;i++){
            //         if(checkedNode.children[i].title == 'score'){
            //             score = checkedNode.children[i].Value;
            //             break;
            //         }
            //     }
            //     if(score >= 1){
            //         originalNode.evaluate = '匹配';
            //     }
            //     else{
            //         originalNode.evaluate = '不匹配';
            //         this.state.tabletree.refresh();
            //         // $('#' + this.props.tableID + '-select-modal').modal('hide');
            //         // return;
            //     }
            // }
            var score = 0;
            for (var i = 0; i < originalNode.children.length; i++) {
                if (tabValue == '2' && originalNode.children[i].title == 'result') {
                    originalNode.children[i].value = 0;
                }
                for (var j = 0; j < checkedNode.children.length; j++) {
                    if (originalNode.children[i].title == 'result' && checkedNode.children[j].title == 'score') {
                        score = checkedNode.children[j].Value;
                        originalNode.children[i].value = score >= 1 ? 1 : 0;
                        originalNode.children[i].defaultValue = score >= 1 ? 1 : 0;
                        originalNode.result = score >= 1 ? 1 : 0;
                        this.state.tabletree.refresh();
                    }
                    if (originalNode.children[i].title == checkedNode.children[j].title) {
                        if (originalNode.children[i].title == 'alias') {
                            var aliasID = this.state.tabletree.getFirstChildId(originalNode.children[i].id);
                            while (aliasID) {
                                var tmpID = this.state.tabletree.getNextSiblingId(aliasID);
                                this.state.tabletree.remove(aliasID);
                                aliasID = tmpID;
                            }
                            this.state.tabletree.refresh();
                            for (var k = 0; k < checkedNode.children[j].children.length; k++) {
                                var tmp = checkedNode.children[j].children[k];
                                this.state.tabletree.add({
                                    title: originalNode.children[i].$count,
                                    value: tmp.Value,
                                    type: 'string'
                                }, -1, originalNode.children[i].id);
                                this.state.tabletree.refresh();
                            }
                        }
                        else
                            originalNode.children[i].value = checkedNode.children[j].Value;
                    }
                }
            }
            this.state.tabletree.refresh();
            //改变父组件的状态

            $('#' + this.props.tableID + '-select-modal').modal('hide');
        }
        else {
            alert('Please select matched environmental conditions!');
        }
    },

    getMatchedResult: function () {
        var msg = {
            done: this.state.done
        };
        var result = [];
        var rootID = this.state.tabletree.getFirstId();
        while (rootID) {
            var rootNode = this.state.tabletree.getItem(rootID);
            result.push({
                name: rootNode.title,
                result: rootNode.result
            });
            rootID = this.state.tabletree.getNextSiblingId(rootID);
        }
        msg.result = result;
        return msg;
    },

    render: function () {
        if (this.state.loading)
            return (<span><i className="fa fa-spinner fa-spin fa-3x fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Loading...</span>);
        if (this.state.err)
            return (<span>Server error: {JSON.stringify(this.state.err)}</span>);
        if (this.state.pid != this.props.pid)
            this.loadData();
        return (
            <div>
                <div>
                    <div id={this.props.tableID}></div>
                    <div id={'pager_' + this.props.tableID} style={{ float: 'right' }}></div>
                    <div className="enMatchSpan"></div>
                </div>
                <div aria-hidden="true" aria-labelledby="myModalLabel" tabIndex="-1" id={this.props.tableID + '-select-modal'} className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" id="close-modal" className="close" data-dismiss="modal" aria-hidden="true">
                                    &times;
                                </button>
                                <h4 className="modal-title">
                                    Select matched environment condition
                                </h4>
                            </div>
                            <div id={this.props.tableID + '_modal-body'} className="modal-body">
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close
                                </button>
                                <button type="button" className="btn-tt-submit btn btn-primary" disabled={this.state.btnDisabled} onClick={(e) => { this.changeMatched(e) }}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = EnMatchTable;