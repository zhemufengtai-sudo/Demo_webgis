/**
 * Created by Franklin on 2017/7/17.
 */

var React = require('react');
var Axios = require('axios');

var ModelSerRunPieStatisitc = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            data : []
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function(){
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({ loading : false});
                    var data = data.data.data;
                    var options = {
                        series: {
                            pie: {
                                show: true,
                                innerRadius: 0.3
                            }
                        },
                        legend: {
                            show: true
                        },
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        colors: ["#869cb3", "#6dc5a3", "#778a9f", "#ff6c60", '#6699ff', '#6633cc'],
                        tooltip: true,
                        label : {
                            show : true
                        },
                        tooltipOpts: {
                            content : '%p.0%, %s',
                            defaultTheme: false,
                        }
                    };
                    $.plot($("#records_pie_statistic"), data, options);
                }
                else{
                    this.setState({err : data.data.message, loading : false});
                }
             },
            err => {  }
        );
    },

    render : function () {
        return (
            <div >
                <div id="records_pie_statistic" style={{ "width" : "800px", "height" : "300px", "textAlign" : "center", "margin":"0 auto"}}>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerRunPieStatisitc;