/**
 * Created by Franklin on 2017/3/30.
 */
var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');
var ModelItemSelect = require('./modelItemSelect');
var EnMatchStepy = require('../enviro/enMatchStepy');

var CloudModelSerTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            items : [],
            itemErr : null,
            init : false,
            itemDetail : {},
            itemPackage : [],
            processBar : false,
            cid : ''
        };
    },

    openModelDetail : function(e, item){
        this.setState({itemDetail : item});
        Axios.get('/modelser/cloud/json/packages?mid=' + item.model_id).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({itemPackage : data.data.data});
                    $('#md_modelItemDetail').modal('show');
                }
            },
            err => {

                $('#md_modelItemDetail').modal('show');
            }
        );
    },

    downCloudModelPackage : function(e, pid){
        this.setState({ processBar : true });
        Axios.get('/modelser/cloud/packages/' + pid + '?ac=download&fields=' + JSON.stringify(this.state.itemDetail)).then(
            data => {
                if(data.data.result == 'suc'){
                    $('#'+ pid+'-match-modal').modal('hide');
                    $('#md_modelItemDetail').modal('hide');
                    NoteDialog.openNoteDia('模型拉取成功！','模型 : ' + this.state.itemDetail.model_name + ' 拉取成功！');
                    this.refs.modelItemSelector.getModelItems();
                    this.setState({ processBar : false });
                }
            },
            err => {}
        );
    },

    render : function() {
        var self = this;
        var modalList = [];
        var childModalWidth = 530;
        var css = {
            width:{
                tabletree:childModalWidth,
                title:120,
                demand:(childModalWidth-120)/2,
                enviro:(childModalWidth-120)/2,
                tabbar:childModalWidth
            },
            height:{
                tabbar:500
            }
        };
        var packages = this.state.itemPackage.map(function(item){
            var procBar = null;
            if(this.state.processBar){
                procBar = (
                    <div style={{textAlign:'center'}}>
                        <i className="fa fa-spinner fa-spin fa-3x fa-fw" style={{margin:'0 auto'}}></i>
                    </div>
                );
            }
            var changeModalFooter = function (display) {
                if(display == true){
                    $($('#' + item.id+'-match-modal .modal-footer')[2]).show();
                    $('#' + item.id+'-match-modal .progress').show();
                }
                else if(display == false){
                    $($('#' + item.id+'-match-modal .modal-footer')[2]).hide();
                    $('#' + item.id+'-match-modal .progress').hide();
                }
            };
            var changeModalBtn = function (display) {
                if(display)
                    $('#'+item.id+'-match-modal .editEn-btn').show();
                else
                    $('#'+item.id+'-match-modal .editEn-btn').hide();
            };
            var btn = null;
            if(item.pulled == true){
                btn = (<button className="btn btn-success btn-sm" onClick={ (e) => { window.location.href='/modelser/' + item.ms_id } }><i className="fa fa-eye"> </i>查看</button>);
            }
            else{
                var disabled = null;
                if(this.state.processBar){
                    disabled = 'disable';
                }
                modalList.push((
                    <div id={item.id+'-match-modal'} className="modal fade" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                                    <h4 className="modal-title">Enviroment Match</h4>
                                </div>
                                <div className="modal-body">
                                    <EnMatchStepy
                                        id={item.id+'-match'}
                                        pid={item.id}
                                        place="portal"
                                        css={css}
                                        changeModalFooter = {changeModalFooter}
                                        changeModalBtn = {changeModalBtn}
                                        ref={item.id+'-match-ref'}
                                    />
                                    {procBar}
                                </div>
                                <div className="modal-footer" style={{display:'none',margin:0}}>
                                    <button type="button" data-dismiss="modal" className="btn btn-default">Close</button>
                                    <a className="btn btn-primary editEn-btn" style={{display:'none'}} href='/setting/enviroment'>Edit Enviroment</a>
                                    <button type="button" className="btn btn-success" onClick={ (e) => { this.downCloudModelPackage(e, item.id); } } disabled={disabled}><i className="fa fa-download"> </i>Deploy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ));
                btn = (
                    <button href={'#'+item.id+'-match-modal'} data-toggle="modal" className="btn btn-info btn-sm" ><i className="fa fa-book"> </i> 环境匹配</button>
                );
            }
            return (
                <tr key={item.id}>
                    <td>v1.0</td>
                    <td>{item.name}</td>
                    <td>{btn}</td>
                </tr>
            );
        }.bind(this));
        return (
            <div className="wrapper">
                <ModelItemSelect ref="modelItemSelector" data-source={this.props['data-source']} onSelectedItem={this.openModelDetail} />
                <div aria-hidden="true" aria-labelledby="myModel_ModelItemDetail" role="dialog" tabIndex="-1" id="md_modelItemDetail" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">模型详细信息</h4>
                            </div>
                            <div className="modal-body">
                                <h5 >ID : {this.state.itemDetail.model_id} </h5>
                                <h5 >名称 : {this.state.itemDetail.model_name} </h5>
                                <h5 >作者 : {this.state.itemDetail.model_author + ' - ' + this.state.itemDetail.model_authorId} </h5>
                                <h5 >描述 : {this.state.itemDetail.model_description} </h5>
                                <h5 >登记时间 : {this.state.itemDetail.model_registerTime} </h5>
                                <h5 >平台 : {this.state.itemDetail.model_platform} </h5>
                                <h5 >状态 : {this.state.itemDetail.model_status} </h5>
                                <table className="table" style={{margin:0}}>
                                    <thead>
                                    <tr>
                                        <th>版本</th>
                                        <th>名称</th>
                                        <th>操作</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {packages}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">关闭</button>
                            </div>
                        </div>
                    </div>
                </div>
                {modalList}
            </div>
        );
    }
});

module.exports = CloudModelSerTable;