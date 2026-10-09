/**
 * Created by Franklin on 2017/7/20.
 */

var React = require('react');
var Axios = require('axios');

var ModelItemSelect = require('./modelItemSelect');
var PortalInfo = require('../systemSetting/portalInfo');
var NoteDialog = require('../../action/utils/noteDialog');
var ModelSerFlowSelect = require('./modelSerFlowSelect')

var ModelSerTransform = React.createClass({
    getInitialState : function () {
        return {
            pid : null,
            processBar : false,
            stepy : null,
            pkgs : [],
            itemDetail : null
        };
    },

    componentDidMount : function(){
        var stepy = $('#stepy_form').stepy({
            backLabel: '上一步',
            nextLabel: '下一步',
            errorImage: true,
            block: false,
            description: true,
            legend: true,
            titleClick: true,
            titleTarget: '#top_tabby',
            validate: false,
            finishButton:true,
            finish: function() {
                var formData = $('#stepy_form').serialize();
                
                return false;
            }.bind(this)
        });
        this.setState({stepy : stepy});
    },
    
    downCloudModelPackage : function(e, pid){
        this.setState({ processBar : true, pid : pid});
        Axios.get('/modelser/cloud/packages/' + pid + '?ac=download&fields=' + JSON.stringify(this.state.itemDetail)).then(
            data => {
                if(data.data.result == 'suc'){
                    NoteDialog.openNoteDia('INFO','Model service : [' + this.state.itemDetail.model_name + '] download successfully!');
                    this.refs.modelItemSelector.getModelItems();
                    this.onSelectedModelItem(e);
                    this.setState({ processBar : false, pid : null });
                }
            },
            err => {}
        );
    },

    onSelectedModelItem : function(e, item){
        if(item == undefined || item == null){
            item = this.state.itemDetail;
        }
        Axios.get('/modelser/cloud/json/packages?mid=' + item.model_id).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({pkgs : data.data.data, itemDetail : item});
                    $('#stepy_form-title-1').click();
                }
            },
            err => {
            }
        );
    },

    render : function(){
        var procBar = null;
        var btnEnabled = null;
        if(this.state.processBar){
            btnEnabled = 'disabled';
        }
        var pkgs = this.state.pkgs.map(function(item){
            var platform = (<span className="label label-info" >Unknown</span>);
            var des = item.desc;
            if(des.length > 20){
                des = des.substr(0, 20);
                des = des + '...';
            }
            if(item.platform == '1'){
                platform = (<span className="label label-info" ><i className="fa fa-windows" ></i> windows</span>);
            }
            if(this.state.processBar){
                return (
                    <tr>
                        <td>{item.name}</td>
                        <td>{platform}</td>
                        <td title={item.desc} >{des}</td>
                        <td>
                            <div className="progress progress-striped active progress-sm col-lg-12">
                                <div style={{ "width": "100%"}} aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" className="progress-bar progress-bar-success">
                                    <span className="sr-only"></span>
                                </div>
                            </div>
                        </td>
                    </tr>
                );
            }
            var button = (<button className="btn btn-default btn-xs" disabled={btnEnabled} onClick={(e) => {this.downCloudModelPackage(e, item.id)}} ><i className="fa fa-download"></i> Transform</button>);
            if(item.pulled){
                button = (<button className="btn btn-success btn-xs" onClick={ (e) => { window.location.href='/modelser/' + item.ms_id } } ><i className="fa fa-eye"></i> View</button>);
            }
            return (
                <tr>
                    <td>{item.name}</td>
                    <td>{platform}</td>
                    <td title={item.desc} >{des}</td>
                    <td>
                        <button className="btn btn-info btn-xs" ><i className="fa fa-book"></i> Match</button>&nbsp;
                        {button}
                    </td>
                </tr>
            );
        }.bind(this));
        return (
            <div className="box-widget">
                <div className="widget-head clearfix">
                    <div id="top_tabby" className="block-tabby pull-left"></div>
                </div>
                <div className="widget-container">
                    <div className="widget-block">
                        <div className="widget-content box-padding">
                            <form id="stepy_form" className="form-horizontal left-align form-well" >
                                <fieldset title="Step 1">
                                    <legend>Model Classification</legend>
                                    <ModelItemSelect  
                                        ref="modelItemSelector"
                                        data-source={this.props['data-source-category']} 
                                        data-btn-text="Choose" 
                                        onSelectedItem={ this.onSelectedModelItem } />
                                </fieldset>
                                <fieldset title="Step 2">
                                    <legend>Choose Model Service</legend>
                                    <table className="display table table-bordered table-striped" id="dynamic-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Platform</th>
                                                <th>Description</th>
                                                <th>Operation</th>
                                            </tr>
                                        </thead>
                                        <tbody id="pkgs_tablebody">
                                            {pkgs}
                                        </tbody>
                                    </table>
                                </fieldset>
                                <br />
                                {procBar}
                                <button id="btn_ok" name="btn_upload" type="submit" className="finish btn btn-info btn-extend" style={{ "display" : "none" }} >submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerTransform;