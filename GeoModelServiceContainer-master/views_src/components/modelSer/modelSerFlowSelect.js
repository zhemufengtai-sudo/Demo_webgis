/**
 * Created by Franklin on 2017/7/10.
 */

var React = require('react');
var Axios = require('axios');

var ModelSerFlowSelect = React.createClass({
    render : function(){
        return (
            <div>
                当前流程ID&nbsp;:&nbsp;&nbsp;
                <button className="btn btn-sm btn-info" type="button"   data-toggle="modal" data-target="#flowSelectDia" >选取</button>
                <input type="hidden" id="msflowid" name="msflowid"  />
                <div aria-hidden="true" aria-labelledby="flowSelectDia" role="dialog" tabIndex="-1" id="flowSelectDia" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">相关流程图</h4>
                            </div>
                            <div className="modal-body">
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" >确认</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal" >关闭</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerFlowSelect;