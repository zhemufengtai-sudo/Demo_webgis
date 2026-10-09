/**
 * Created by SCR on 2017/6/1.
 */
var React = require('react');
var Axios = require('axios');
var EnMatchTable = require('./enMatchTable');

var EnMatchPanel = React.createClass({
    getInitialState:function () {
        return {
        };
    },

    componentDidMount:function () {

    },

    componentDidUpdate:function () {

    },

    render:function () {
        return (
            <div>
                <div className="panel panel-info">
                    <div className="panel-heading">
                        Software environment
                        <span className="tools pull-right">
                            <a className="fa fa-chevron-down"></a>
                        </span>
                    </div>
                    <div className="panel-body">
                        <div className="editable-table ">
                            <EnMatchTable
                                tableID="swe-table"
                                type="swe"
                                pid={this.props.pid}
                                place={this.props.place}
                                css={this.props.css}
                            />
                        </div>
					</div>
                </div>

                <div className="panel panel-info">
                    <div className="panel-heading">
                        Hardware environment
                        <span className="tools pull-right">
                            <a className="fa fa-chevron-down"></a>
                        </span>
                    </div>
                    <div className="panel-body">
                        <div className="editable-table ">
                            <EnMatchTable
                                tableID="hwe-table"
                                type="hwe"
                                pid={this.props.pid}
                                place={this.props.place}
                                css={this.props.css}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = EnMatchPanel;