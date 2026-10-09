/**
 * Created by Franklin on 2017/3/21.
 */

var React = require('react');
var Axios = require('axios');
var CopyToClipBoard = require('copy-to-clipboard');

var NoteDialog = require('../../action/utils/noteDialog');

var ModelSerInfo = React.createClass({
    getInitialState : function () {
        var host = 'localhost';
        if(this.props.host){
            host = this.props.host;
        }
        return {
            loading : true,
            err : null,
            ms : null,
            host : host
        };
    },

    componentDidMount : function () {
        Axios.get(this.props.source).then(
            data => {
                this.setState({loading : false, ms : data.data.data });
            },
            err => {
                this.setState({loading : false, err : err });
            }
        );
    },

    copyToClipBoard : function(text){
        CopyToClipBoard(text);
        NoteDialog.openNoteDia(window.LanguageConfig.ModelServiceDetail.CopySuccessfully);
    },

    render : function () {
        if(this.state.loading){
            return (
                <span className="" >loading...</span>
            );
        }
        if(this.state.ms == null)
        {
            return (
                <span>Can not find data</span>
            );
        }
        var platform = (
            <span className="label label-info">Unknown</span>);
        if(this.state.ms.ms_platform == 1)
        {
            platform = (
                <span className="label label-info">
                    <i className="fa fa-windows"> </i> windows
                </span>);
        }
        else if(this.state.ms.ms_platform == 2)
        {
            platform = (
                <span className="label label-info">
                    <i className="fa fa-linux"> </i>linux
                </span>);
        }
        var status = (
            <span className="badge badge-defult">{window.LanguageConfig.ModelService.Unavai}</span>);
        if(this.state.ms.ms_status == 1)
        {
            status = (
                <span className="badge badge-success">{window.LanguageConfig.ModelService.Avai}</span>
            );
        }
        var detail = '';
        if(this.state.ms.ms_model.m_url)
        {
            detail = (
                <a href={this.state.ms.ms_model.m_url} >MORE</a>
            );
        }
        var img = (<img src="/images/modelImg/default.png" alt=""  />);
        if(this.state.ms.ms_img != null && this.state.ms.ms_img.trim() != ''){
            if(this.state.host){
                img = (<img height="128px" width="128px" src={ '/images/modelImg/' + this.state.ms.ms_img } alt=""  />);
            }
            else{
                img = (<img height="128px" width="128px" src={ '/modelser/rmt/img/' + this.state.ms.ms_img } alt=""  />);
            }
        }
        var url = window.location.href;
        url = url.substr(0, url.lastIndexOf(':') + 5);
        var permission = null;
        if(this.state.ms.ms_permission == 1){
            permission = (
                    <span className="label label-default tooltips" data-toggle="tooltip" data-placement="top" data-original-title={window.LanguageConfig.ModelService.Auth} >
                        <i className="fa fa-lock" ></i>&nbsp;{window.LanguageConfig.ModelService.Auth}
                    </span>);
        }
        else{
            permission = (
                    <span className="label label-success tooltips" data-toggle="tooltip" data-placement="top" data-original-title="Open" >
                        <i className="fa fa-unlock" ></i>&nbsp;{window.LanguageConfig.ModelService.Open}
                    </span>);
        }
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">
                    {window.LanguageConfig.ModelServiceDetail.Title}
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="blog-img">
                                {img}
                            </div>
                        </div>
                        <div className="col-md-7">
                            <p className="muted" >{window.LanguageConfig.ModelService.Name}&nbsp;:&nbsp;{this.state.ms.ms_model.m_name}</p>
                            <p className="muted" >{window.LanguageConfig.ModelService.Type}&nbsp;:&nbsp;{this.state.ms.ms_model.m_type}</p>
                            <p className="muted" >{window.LanguageConfig.ModelService.Version}&nbsp;:&nbsp;{this.state.ms.mv_num}</p>
                            <p className="muted" >{window.LanguageConfig.ModelService.Platform}&nbsp;:&nbsp;{platform}</p>
                            <p className="muted" >{window.LanguageConfig.ModelServiceDetail.DeploymentTime}&nbsp;:&nbsp;{(new Date(this.state.ms.ms_update)).toLocaleString()}</p>
                            <p className="muted" >{window.LanguageConfig.ModelService.Status}&nbsp;:&nbsp;{status}</p>
                            <p className="muted" >{window.LanguageConfig.ModelService.Permission}&nbsp;:&nbsp;{permission}</p>
                            <p  className="muted" >{window.LanguageConfig.ModelServiceDetail.Description}&nbsp;:&nbsp;{this.state.ms.ms_des}</p>
                            <br />{detail}
                            <br />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerInfo;