/**
 * Created by Franklin on 2017/7/28.
 */

var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');

var NoticeTable = React.createClass({
    getInitialState : function(){
        return {
            loading : true,
            err : null,
            notices : [],
            type : 'all',
            read : 'all',
            page : 0,
            pageCount : 0
        };
    },

    componentDidMount : function(){
        this.refresh();
    },

    refresh : function(){
        var query ='?type=' + this.state.type + '&read=' + this.state.read;
        Axios.get('/notices/all' + query).then(
            data => {
                if(data.data.result == 'suc'){
                    var pageCount = parseInt((data.data.data.length - 1) / 15) + 1;
                    this.setState({notices : data.data.data, pageCount : pageCount, page : 0});
                }
            },
            err => {
            }
        );
    },

    fisrtPage : function(e){
        this.setState({page : 0});
    },

    previousPage : function(e){
        if(this.state.page > 0){
            this.setState({page : this.state.page - 1});
        }
    },

    nextPage : function(e){
        if(this.state.page + 1 < this.state.pageCount){
            this.setState({page : this.state.page + 1});
        }
    },

    lastPage : function(e){
        this.setState({page : this.state.pageCount - 1});
    },

    selectStartType : function(e){
        this.state.type = 'start';
        this.refresh();
    },

    selectStopType : function(e){
        this.state.type = 'stop';
        this.refresh();
    },

    selectDeleteType : function(e){
        this.state.type = 'delete';
        this.refresh();
    },

    selectAllType : function(e){
        this.state.type = 'all';
        this.refresh();
    },

    selectRead : function(e){
        this.state.read = 'true';
        this.refresh();
    },

    selectUnread : function(e){
        this.state.read = 'false';
        this.refresh();
    },

    selectAll : function(e){
        this.state.read = 'all';
        this.refresh();
    },

    markAllAsRead : function(e){
        Axios.put('/notices/all?type=read').then(
            data => {
                NoteDialog.openNoteDia('Info', 'All notices have been marked as read');
                this.refresh();
            },
            err => {}
        );
    },

    markAsRead : function(e, id){
        Axios.put('/notices/' + id + '?type=read').then(
            data => {
                this.refresh();
            },
            err => {}
        );
    },

    showDetail : function(e, title, detail, datetime){
        
    },

    render : function(){
        var list = this.state.notices.slice(this.state.page * 15, (this.state.page + 1)*15);
        var items = list.map(function(item){
            var unread = null;
            if(!item.hasRead){
                unread = (<span className="label label-sm btn-success" onClick={ (e) => { this.markAsRead(e, item._id) } }>{window.LanguageConfig.Notice.AllUnreadMessage}</span>);
            }
            var date = new Date(item.time).toLocaleString();
            return (
                <li className="list-group-item">
                    <a className="" href="#"> <small className="pull-right text-muted">{ date }</small> <strong>{item.title}</strong>  <span>{item.detail}</span> {unread} </a>
                </li>
            )
        }.bind(this));
        var btnFisrtDisabled = 'disabled';
        var btnLastDisabled = 'disabled';
        if(this.state.page > 0){
            btnFisrtDisabled = '';
        }
        if(this.state.page < this.state.pageCount - 1){
            btnLastDisabled = '';
        }
        var read = this.state.read;
        if(read == 'all'){
            read = 'All';
        }
        else if(read == 'true'){
            read = 'Read';
        }
        else if(read == 'false'){
            read = 'Unread';
        }
        return (
            <div className="mail-box">
                <aside className="mail-nav mail-nav-bg-color">
                    <header className="header"> <h4>{window.LanguageConfig.Notice.NoticeTable}</h4> </header>
                    <div className="mail-nav-body">
                        <div className="text-center">
                            <a className="btn btn-compose" href="#" onClick={this.selectAllType} >
                                {window.LanguageConfig.Notice.AllMessage}
                            </a>
                        </div>
                        <ul className="nav nav-pills nav-stacked mail-navigation">
                            <li onClick={this.selectStartType} ><a href="#" > <i className="fa fa-play"></i> {window.LanguageConfig.Notice.Start} <span className="label label-info pull-right inbox-notification"></span></a></li>
                            <li onClick={this.selectStopType}><a href="#" > <i className="fa fa-stop"></i> {window.LanguageConfig.Notice.Stop} <span className="label label-info pull-right inbox-notification"></span></a></li>
                            <li onClick={this.selectDeleteType}><a href="#" > <i className="fa fa-trash-o"></i> {window.LanguageConfig.Notice.Delete} <span className="label label-danger pull-right inbox-notification"></span></a></li>
                        </ul>
                    </div>
                </aside>
                <section className="mail-box-info">
                    <header className="header">
                        <div className="pull-right" >
                            <span className="label label-primary"> {window.LanguageConfig.Notice.Page} : {this.state.page + 1} / {this.state.pageCount} </span>&nbsp;&nbsp;
                            <a href="#" className="first btn btn-sm btn-primary" disabled={btnFisrtDisabled} data-action="first" onClick={this.fisrtPage}><i className="fa fa-backward"></i></a>
                            <a href="#" className="previous btn btn-sm btn-primary" disabled={btnFisrtDisabled} data-action="previous" onClick={this.previousPage}><i className="fa fa-chevron-left"></i></a>
                            <a href="#" className="next btn btn-sm btn-primary" disabled={btnLastDisabled} data-action="next" onClick={this.nextPage}><i className="fa fa-chevron-right"></i></a>
                            <a href="#" className="last btn btn-sm btn-primary" disabled={btnLastDisabled} data-action="last" onClick={this.lastPage}><i className="fa fa-forward"></i></a>
                        </div>

                        <div className="btn-toolbar">
                            <div className="btn-group">
                                <button className="btn btn-sm btn-primary"><i className="fa fa-refresh"></i></button>
                            </div>

                            <div className="btn-group select">
                                <button data-toggle="dropdown" className="btn btn-primary btn-sm dropdown-toggle">
                                    <span id="selectedType" className="dropdown-label">{read}</span>
                                    <span className="caret"></span>
                                </button>
                                <ul id="typeUL" className="dropdown-menu text-left text-sm">
                                    <li><a href="#" onClick={this.selectAll}>{window.LanguageConfig.Notice.AllMessage}</a></li>
                                    <li><a href="#" onClick={this.selectUnread}>{window.LanguageConfig.Notice.AllUnreadMessage}</a></li>
                                    <li><a href="#" onClick={this.selectRead}>{window.LanguageConfig.Notice.AllReadMessage}</a></li>
                                </ul>
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-sm btn-primary" onClick={this.markAllAsRead}><i className="fa fa-check"></i>&nbsp;&nbsp;{window.LanguageConfig.Notice.MarkAllRead}</button>
                            </div>
                        </div>
                    </header>
                    <section className="mail-list">
                        <ul className="list-group ">
                            {items}
                        </ul>
                    </section>
                </section>
            </div>
        );
    }
});

module.exports = NoticeTable;