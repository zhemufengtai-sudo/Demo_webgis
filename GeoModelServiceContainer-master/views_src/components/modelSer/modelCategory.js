/**
 * Created by Franklin on 2017/4/28.
 */

var React = require('react');
var Axios = require('axios');

var ModelCategory = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    onSelectItem : function(id){
        if(this.props.onSelectItem){
            this.props.onSelectItem(id);
        }
    },

    refresh : function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'err') {
                    this.setState({loading : false, err : data.data.message});
                }
                else{
                    this.setState({loading : false});
                    var tree = [data.data.data];
                    this.rebuild(tree);
                    $('#catalog_tree').treeview({
                        data: tree,
                        selectedBackColor : '#222244',
                        onNodeSelected: function(event, data) {
                            this.onSelectItem(data.id);
                        }.bind(this)
                    });
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },
    
    // rebuild tree data
    rebuild : function(array){
        if(!array || array.length == 0){
            return;
        }
        for(var i = 0; i < array.length; i++){
            var obj = array[i];
            obj["text"] = obj["nameEn"];
            obj["nodes"] = obj["children"];
            delete obj['children'];
            if(array.length > 0){
                this.rebuild(obj["nodes"])
            }
        }
    },

    render : function(){
        if(this.state.loading){
            return (
                <span>Loading...</span>
            );
        }
        if(this.state.err) {
            return (
                <span>Error:{JSON.stringify(this.state.err)}</span>
            );
        }
        return (
            <div id="catalog_tree"></div>
        );
    }
});

module.exports = ModelCategory;