/**
 * Created by Franklin on 2018/10/11.
 */

var React = require('react');
var Axios = require('axios');


var AssemblyInfo = React.createClass({
    getInitialState : function () {
        return {
            loading: true,
            err: null,
            data: null
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function(){
        Axios.get(this.props.source).then(
            data => { this.setState({ loading : false, err : null, data : data.data.data }); },
            err => { this.setState({ loading : false, err : err, data : null }); }
        );
    },

    render: function () {
        if (this.state.loading) {
            return (<span>loading...</span>);
        }
        var assemblies = null;
        if(this.state.data != null){
            assemblies = this.state.data.map(function(item, index){
                return (
                    <tr key={index + 1} >
                        <td>{index}</td>
                        <td>{item.name}</td>
                        <td>{item.platform}</td>
                        <td>{item.version}</td>
                    </tr>
                );
            });
        }
        return (
            <div className="wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>{window.LanguageConfig.Settings.Assembly.Name}</th>
                            <th>{window.LanguageConfig.Settings.Assembly.Platform}</th>
                            <th>{window.LanguageConfig.Settings.Assembly.Version}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assemblies}
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = AssemblyInfo;