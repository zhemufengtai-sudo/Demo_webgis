/**
 * Author : Fengyuan(Franklin) Zhang
 * Date : 2018/12/6
 * Description : Diagram showing of model service
 */

var React = require('react');
var Axios = require('axios');

var DiagramModel = React.createClass({

    getInitialState : function(){
        return {
            diagramModel : null
        };
    },

    componentDidMount : function(){
        this.setState({diagramModel: new OGMSDiagram()}, function(){
            this.state.diagramModel.init( $('#ogmsModelStateDiagramContainer'), 
                {
                    width : '100%',       //! Width of panel 
                    height : '100%',       //! Height of panel
                    enabled : false      //! Edit enabled 
                },
                false,
                false,
                '/js/ogmsDiagram/images/modelState.png',    //! state IMG
                '/js/ogmsDiagram/images/grid.gif',          //! Grid IMG
                '/js/ogmsDiagram/images/connector.gif',     //! Connection center IMG
            );
            Axios.get('/modelser/diagram/json/' + this.props['data-msid']).then(
                data => {
                    for (var i = 0; i < data.data.data.StateGroup.States.length; i++){
                        data.data.data.StateGroup.States[i].events = data.data.data.StateGroup.States[i].Events;
                    }
                    var behavior = {
                        states : data.data.data.StateGroup.States,
                        transition : data.data.data.StateGroup.StateTransitions,
                        dataRef : data.data.data.RelatedDatasets
                    };
                    this.state.diagramModel.loadJSON(JSON.stringify(behavior));
                },
                err => {}
            );
        });
    },

    setStateAsRunning : function(state){
        this.diagramModel.setStateAsRunning(state);
    },

    setStateAsFinished : function(state){
        this.diagramModel.setStateAsFinished(state);
    },

    render : function(){
        return (<div id="ogmsModelStateDiagramContainer" ></div>);
    }
});

module.exports = DiagramModel;