//环境字典面板
//包括：
//     展示信息的panel
//     添加操作的button
//     modal以及对应的操作

var React = require('react');
var Axios = require('axios');

var EnviroTableTree = require('./enviroTableTree');

var EnviroPanel = React.createClass({
    getInitialState : function () {
        return {};
    },

    componentDidMount : function () {

    },

    componentDidUpdate:function () {

    },

    addChecked:function (e,refname) {
        var method = refname.indexOf('auto')!=-1?'auto':'select';
        var type = refname.indexOf('swe')!=-1?'software':'hardware';
        var checkedItems = this.refs[refname].getChecked();
        if(checkedItems.length == 0){
            return $.gritter.add({
                title: 'Attention: ',
                text: 'Please choose the '+ type +'Environment:',
                sticky: false,
                time: 2000
            });
        }
        var addData = {
            itemsID:checkedItems
        };
        var url = '/setting/enviro?method=' + method + '&type=' + type;
        Axios.post(url,addData).then(
            data => {
                if(data.data.status == 1){
                    $('#' + this.props.tableID + '-' + method + '-modal').trigger("click");
                    //局部刷新tabletree，并打开新添加的节点
                    if(data.data.newInsertedItems　&& data.data.newInsertedItems.length != 0) {
                        this.refs[this.props.tableID + '-ref'].addItems(data.data.newInsertedItems);
                    }
                    if(data.data.hasInsertedItems &&　data.data.hasInsertedItems.length != 0){
                        this.refs[this.props.tableID + '-ref'].openItems(data.data.hasInsertedItems);
                        $.gritter.add({
                            title: 'Attention: ',
                            text: 'some'+ type + 'environment already exist, please edit them!',
                            sticky: false,
                            time: 2000
                        });
                    }
                }
                else{
                    $.gritter.add({
                        title: 'Attention: ',
                        text: 'Adding'+ type + 'environment failed, please try again later!',
                        sticky: false,
                        time: 2000
                    });
                }
            },
            err => {
                $.gritter.add({
                    title: 'Warning: ',
                    text: 'Adding'+ type + 'environment failed, please try again later!',
                    sticky: false,
                    time: 2000
                });
            }
        );
    },

    changePanel: function(e,panelId){
        var parent_element = $('#' + panelId);
        parent_element.toggleClass("contract");
    },
    

    // addFinished : function(method){
    //     $("#" + this.props.tableID + "-" + method + "-modal").modal('hide');
    // },

    // add by shenchaoran
    render : function() {
        var url = '/setting/enviro?type=' + this.props.type;
        var panelTitle,addBySelect,autoAddName;
        if(this.props.type == 'software'){
            autoAddName = 'Detection-Added';
            panelTitle = 'Software Environment Dictionary';
            // addBySelect = (
            //     <div style={{margin:'0 20px 0 0px'}} className="btn-group">
            //         <button id={this.props.tableID + '-select-btn'} data-toggle="modal" data-target={'#' + this.props.tableID + '-select-modal'} className="btn btn-primary">
            //             选择添加 <i className="fa fa-plus"></i>
            //         </button>
            //     </div>
            // );
        }
        else if(this.props.type == 'hardware'){
            autoAddName = 'Detection-Added';
            panelTitle = 'Hardware Environment Dictionary';
            addBySelect = null;
        }

        var autoTableTree = {
            editable:false,
            checkbox:true,
            operate:false,
            autowidth:false,
            css:{
                width:{
                    tabletree:700,
                    title:350,
                    value:350
                }
            }
        };
        var autoModalTT = null,selectModalTT = null;
        autoModalTT = (
            <EnviroTableTree
                tableID={this.props.tableID + '-auto'}
                tabletree={autoTableTree}
                source={url + '&method=auto'}
                ref={this.props.tableID + '-auto-ref'}
                fields={this.props.fields}
            />
        );
        //目前屏蔽选择添加功能，后面考虑完门户的表之后再准备添加
        // if(this.props.type == 'software'){
        //     selectModalTT = (
        //         <EnviroTableTree
        //             tableID={this.props.tableID + '-select'}
        //             tabletree={autoTableTree}
        //             source={url + '&method=select'}
        //             ref={this.props.tableID + '-select-ref'}
        //             fields={this.props.fields}
        //         />
        //     );
        // }

        return (
            <div>
                <div className="panel panel-info" id={this.props.tableID + '-panel-body'}>
                    <div className="panel-heading">
                        {panelTitle}
                        <span className="tools pull-right">
                            <a href="javascript:;" className="fa fa-chevron-down" onClick={(e) =>{this.changePanel(e,this.props.tableID + '-panel-body')}}></a>
                        </span>
                    </div>
                    <div className="panel-body" style={{marginBottom: '10px'}}>
                        <div className="editable-table ">
                            <div className="clearfix" style={{margin:"0 0 10px 0px"}}>
                                {/* {addBySelect} */}
                                <div style={{margin:'0 20px 0 0px'}} className="btn-group">
                                    <button id={this.props.tableID + '-auto-btn'} data-toggle="modal" data-target={'#' + this.props.tableID + '-auto-modal'} className="btn btn-primary">
                                        {autoAddName} <i className="fa fa-plus"></i>
                                    </button>
                                </div>
                                <div className="btn-group">
                                    <button id={this.props.tableID + '-btn'} onClick={e => {this.refs[this.props.tableID + '-ref'].getTableTree().newItem()}} className="btn btn-primary">
                                        Manually-added <i className="fa fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="space15"></div>

                            <EnviroTableTree
                                tableID={this.props.tableID}
                                tabletree={this.props.tabletree}
                                source={url + '&method=get'}
                                ref={this.props.tableID + '-ref'}
                                fields={this.props.fields}
                            />
                        </div>
                    </div>
                </div>

                <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id={this.props.tableID + '-auto-modal'} className="modal fade">
                    <div className="modal-dialog" style={{width: '750px'}}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" id="close-modal" className="close" data-dismiss="modal" aria-hidden="true">
                                    &times;
                                </button>
                                <h4 className="modal-title">
                                    Add environment options from the Detection-Added
                                </h4>
                            </div>
                            <div className="modal-body">
                                {autoModalTT}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close
                                </button>
                                <button type="button" className="btn btn-primary" onClick={(e) => {this.addChecked(e,this.props.tableID + '-auto-ref')}}>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id={this.props.tableID + '-select-modal'} className="modal fade">
                    <div className="modal-dialog" style={{width: '750px'}}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" id="close-modal" className="close" data-dismiss="modal" aria-hidden="true">
                                    &times;
                                </button>
                                <h4 className="modal-title">
                                    Add environment options selected from the summary database
                                </h4>
                            </div>
                            <div className="modal-body">
                                {selectModalTT}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close
                                </button>
                                <button type="button" className="btn btn-primary" onClick={ (e) => {this.addChecked(e,this.props.tableID + '-select-ref')}}>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
});

module.exports = EnviroPanel;