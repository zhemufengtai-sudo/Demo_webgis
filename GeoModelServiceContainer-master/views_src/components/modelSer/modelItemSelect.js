/**
 * Created by Franklin on 2017/5/3.
 */
var React = require('react');
var Axios = require('axios');

var ModelCategory = require('./modelCategory');

var ModelItemSelect = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            items : [],
            itemErr : null,
            init : false,
            page : 1,
            cid : ''
        };
    },

    getModelItems : function(cid, updatePage){
        if(cid == null){
            cid = this.state.cid
        }
        else {
            this.state.cid = cid;
        }
        Axios.get('/modelser/cloud/json/modelsers?cid=' + cid + '&page=' + this.state.page).then(
            data => {
                if(data.data.result == 'err') {
                    this.setState({itemErr : data.data.message});
                }
                else{
                    var pagecount = this.state.page;
                    if(updatePage){
                        pagecount = 1;
                    }
                    this.setState({itemErr : null, items : data.data.data.items, count : data.data.data.count, page : pagecount});
                }
            },
            err => {}
        );
    },

    changePage : function(e, page){
        if(page == undefined){
            this.state.page = parseInt(e.currentTarget.attributes['data-page'].nodeValue);
        }
        else{
            this.state.page = page;
        }
        this.getModelItems(null, false);
    },

    onSelectedItem : function(e, item){
        if(this.props['onSelectedItem']) {
            this.props.onSelectedItem(e, item);
        }
    },

    render : function() {
        var Items = null;
        var Paging = null;
        if(this.state.itemErr){
            Items = (<span>Error : {JSON.stringify(this.state.itemErr)}</span>);
        }
        else{
            var pages = parseInt(this.state.count / 10) + 1;
            var count = 0;

            var buttonText = window.LanguageConfig.CloudModelService.Detail;
            if(this.props['data-btn-text']){
                buttonText = this.props['data-btn-text'];
            }
            Items = this.state.items.map(function(item){
                count ++;
                var pulled = null;
                if(this.props['data-pulltag'] != 'false'){
                    if(item.pulled){
                        pulled = (<span className="label label-success">{window.LanguageConfig.CloudModelService.Pulled}</span>);
                    }
                    else{
                        pulled = (<span className="label label-default">{window.LanguageConfig.CloudModelService.NotPulled}</span>);
                    }
                }
                return (
                    <div key={item.model_id} className="highlight">
                        <pre>
                            <h5><i className="fa fa-gear"> </i>{item.model_name} &nbsp; {pulled} </h5>
                            <h5><i className="fa fa-user"> </i>{item.model_author}</h5>
                            <p>{item.model_description}</p>
                            <button className="btn btn-info btn-sm" onClick= { (e)=>{ this.onSelectedItem(e, item) }} > {buttonText} </button>
                        </pre>
                    </div>
                )
            }.bind(this));
            if(pages > 1){
                var pre = null;
                var last = null;
                if(this.state.page != 1){
                    pre = (<li><a href="#" onClick={ (e) => { this.changePage(e, this.state.page - 1) } } >«</a></li>);
                }
                if(this.state.page != pages){
                    last = (<li><a href="#" onClick={ (e) => { this.changePage(e, this.state.page + 1) } } >»</a></li>);
                }
                Paging = (function(){
                    var doms = [];
                    for(var i = 1; i < pages + 1; i++){
                        if(i == this.state.page){
                            doms.push(<li key={i} className="active"><a href="#" >{i}</a></li>);
                        }
                        else{
                            doms.push(<li key={i} ><a href="#" data-page={i} onClick={ (e) => { this.changePage(e) } } >{i}</a></li>);
                        }
                    }
                    return doms;
                }.bind(this))();
                Paging = (
                    <ul className="pagination">
                        {pre}
                        {Paging}
                        {last}
                    </ul>);
            }
        }
        return (
                <div className="row">
                    <div className="col-md-4">
                        <section className="panel" >
                            <header className="panel-heading">
                                {window.LanguageConfig.CloudModelService.CloudModelServiceCategory}
                            </header>
                            <ModelCategory data-source={this.props['data-source']} onSelectItem={this.getModelItems} />
                        </section>
                    </div>
                    <div className="col-md-8">
                        <section className="panel" >
                            <header className="panel-heading">
                                {window.LanguageConfig.CloudModelService.CloudModelServiceItems}
                            </header>
                            <div className="panel-body" >
                                <div className="input-group m-bot15">
                                    <span className="input-group-btn">
                                        <button type="button" className="btn btn-default"><i className="fa fa-search"></i></button>
                                    </span>
                                    <input type="text" className="form-control" />
                                </div>
                                {Items}
                                {Paging}
                            </div>
                        </section>
                    </div>
                </div>
        );
    }
});

module.exports = ModelItemSelect;