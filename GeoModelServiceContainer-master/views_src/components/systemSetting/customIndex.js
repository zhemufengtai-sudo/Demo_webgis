/**
 * Created by Franklin on 2017/6/19.
 */

var React = require('react');
var Axios = require('axios');

var CustomIndexPanel = React.createClass({
    openModelSers : function(e){
        window.open('/public/modelser/all');
    },

    openComputerResInfo : function(e){
        window.open('/public/info');
    },

    openManagerPage : function(e){
        window.open('/index');
    },

    openHelpPage : function(e){
        window.open('/help.html');
    },

    openDemoPage : function(e){
        window.open('/public/modelser/preparation/598341264cd2df0878a1fd0c');
    },

    openUpdatePage : function(e){
        window.open('/help.html');
    },

    render : function(){
        return (
            <div>
                <div className="row state-overview">
                    <div className="col-md-6 col-xs-12 col-sm-6" onClick={this.openModelSers} >
                        <div className="panel purple">
                            <div className="symbol">
                                <i className="fa fa-tasks" ></i>
                            </div>
                            <div className="state-value">
                                <div className="value">Model Services</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xs-12 col-sm-6" onClick={this.openComputerResInfo}>
                        <div className="panel red">
                            <div className="symbol">
                                <i className="fa fa-info"></i>
                            </div>
                            <div className="state-value">
                                <div className="value">Computer Information</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row state-overview">
                    <div className="col-md-6 col-xs-12 col-sm-6" onClick={this.openManagerPage} >
                        <div className="panel blue">
                            <div className="symbol">
                                <i className="fa fa-wrench" ></i>
                            </div>
                            <div className="state-value">
                                <div className="value">Manager</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xs-12 col-sm-6" onClick={this.openHelpPage}>
                        <div className="panel green">
                            <div className="symbol">
                                <i className="fa fa-eye"></i>
                            </div>
                            <div className="state-value">
                                <div className="value">Help</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row state-overview">
                    <div className="col-md-6 col-xs-12 col-sm-6" onClick={this.openDemoPage} >
                        <div className="panel yellow">
                            <div className="symbol">
                                <i className="fa fa-book" ></i>
                            </div>
                            <div className="state-value">
                                <div className="value">Demo</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xs-12 col-sm-6" onClick={this.openUpdatePage}>
                        <div className="panel grey">
                            <div className="symbol">
                                <i className="fa fa-check-circle"></i>
                            </div>
                            <div className="state-value">
                                <div className="value">New Features</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = CustomIndexPanel;