/**
 * Created by Franklin on 2017/6/25.
 */

var React = require('react');
var Axios = require('axios');

var CustomInfoPanel = React.createClass({
    getInitialState : function(){
        return {
            currectLanguage : '',
            languages : null,
            settings : null
        };
    },

    componentDidMount : function(){
        this.getLanguageConfigs();
    },

    getLanguageConfigs : function(){
        Axios.get('/languages').then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({languages : data.data.data});
                    var language = getCookie('language');
                    if(!language){
                        setCookie('language', 'en.json');
                        this.setState({currectLanguage : 'en.json'});
                    }
                    else{
                        this.setState({currectLanguage : language});
                    }
                }
            },
            err => {}
        );
    },

    changeLanguage : function(e){
        setCookie('language', e.target.value);
        setLanguage(e.target.value);
    },

    render : function(){
        var langs = null;
        if(this.state.languages){
            langs = this.state.languages.map(function(item){
                return (<option key={item.File} value={item.File} >{item.ConfigName}</option>);
            });
        }
        return (
            <div className="wrapper">
                <p><strong>Computer Node ID&nbsp;:&nbsp;</strong><span>{"123"}</span> </p>
                <p><strong>Register&nbsp;:&nbsp;</strong><span>{"false"}</span> </p>
            </div>
        );
    }
});

module.exports = CustomInfoPanel;