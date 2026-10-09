//用于生成软硬件环境的table tree的模板类
//表操作：添加行、编辑行、删除行等，在后台进行更新
//表列：key、value、type、operate
//表的初始化：
//      数据源url：props.source
//      表id：props.tableID
//      tabletree:tabletree配置选项

var React = require('react');
var Axios = require('axios');

var EnviroTableTree = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            tabletreeJSON : null,
            tabletree : null,
            buttonstatus: 0
        };
    },

    componentDidMount : function () {
        Axios.get(this.props.source).then(
            data => {
                this.setState({ loading : false, err : null, tabletreeJSON : data.data.enviro});
            },
            err => {
                this.setState({ loading : false, err : err, tabletreeJSON : null});
            }
        );
    },

    componentDidUpdate:function (){
        var tabletreeJSON = this.state.tabletreeJSON;
        var self = this;
        var type = (self.props.source.indexOf('software') == -1) ? 'software' : 'hardware';
        if(tabletreeJSON){
            webix.ready(function (){
                var pagerID = "pager_"+self.props.tableID;
                var myjson = webix.DataDriver.myjson = webix.copy(webix.DataDriver.json);
                myjson.child = function (obj) {
                    return obj.children;
                };

                webix.locale.pager = {
                    first: "<<",
                    last: ">>",
                    next: ">",
                    prev: "<"
                };
                var template = '';
                if(self.props.tabletree.checkbox){
                    template = "{common.space()}{common.treecheckbox()}{common.icon()}#title#";
                }
                else{
                    template = '{common.space()}{common.icon()}#title#';
                }

                //将tabletree结构的json转换位正常的json
                var ttItem2JOSN = function (itemID) {
                    var json = {};
                    var tabletree = self.state.tabletree;
                    var item = tabletree.getItem(itemID);
                    var convertKey = function (child) {
                        var type = child.type;
                        if(type == 'Array'){
                            var rst = [];
                            var children = child.children;
                            for(var i=0;i<children.length;i++){
                                rst.push(convertKey(children[i]));
                            }
                            return rst;
                        }
                        else if(type == 'Object'){
                            var rst = {};
                            var children = child.children;
                            for(var i=0;i<children.length;i++){
                                rst[children[i].title] = convertKey(children[i]);
                            }
                            return rst;
                        }
                        else{
                            return child.Value;
                        }
                    };

                    var children = item.children;
                    for(var i=0;i<children.length;i++){
                        var key = item.children[i].title;
                        var child = item.children[i];
                        if(key)
                            json[key] = convertKey(child);
                    }
                    return json;
                };

                //region 自定义筛选函数，要求能够显示出一个文档的所有字段
                var ttTitleFilter = function (value,filter,obj){
                    var tabletree = self.state.tabletree;
                    if(tabletree.getItem(obj.id).$parent == 0){
                        value = value.replace(/\s+/g,' ').toLowerCase();
                        value = value.trim();
                        filter = filter.replace(/\s+/g,' ').toLowerCase();
                        filter = filter.trim();
                        return value.indexOf(filter)!=-1;
                    }
                    else{
                        return false;
                    }
                };
                var ttValueFilter = function (value, filter, obj) {
                    var tabletree = self.state.tabletree;
                    var rootID = obj.id;
                    while(tabletree.getItem(rootID).$parent!=0){
                        rootID = tabletree.getItem(rootID).$parent;
                    }
                    filter = filter.replace(/\s+/g,' ').toLowerCase();
                    filter = filter.trim();

                    var strJSON = JSON.stringify(ttItem2JOSN(rootID)).toLowerCase();
                    strJSON = strJSON.replace(/\s+/g,' ');
                    strJSON = strJSON.trim();
                    return strJSON.indexOf(filter)!=-1
                };
                //endregion

                var columns = [
                    {id:'title',header:['Key',{content:'textFilter',placeholder:'Filter',compare:ttTitleFilter}],template:template,width:self.props.tabletree.css.width.title},
                    {id:'Value',header:['Value',{content:'textFilter',placeholder:'Filter',compare:ttValueFilter}],editor:'text',width:self.props.tabletree.css.width.value}
                ];
                if(self.props.tabletree.operate){
                    columns.push({id:'type',header:'Type',width:70});
                    columns.push({
                        id:"operate",
                        header:'Operate',
                        template:function (obj) {
                            var tableRowId = obj.id;
                            if(obj.type == 'Object'){
                                return "<button class='tabletree-delbtn delbtn tabletree-btn btn btn-info btn-xs' data-tableRowId="+ tableRowId +" type='button'><i class='fa fa-trash-o'></i></button>";
                            }
                            else if(obj.type == 'Array'){
                                return "<button class='tabletree-addbtn addbtn tabletree-btn btn btn-info btn-xs' data-tableRowId="+ tableRowId +" type='button'><i class='fa fa-plus'></i></button>";
                            }
                            else{
                                var parentNode = obj.$parent;
                                if(parentNode){
                                    if(self.state.tabletree.getItem(parentNode).type == 'Array'){
                                        return "<button class='tabletree-editbtn editbtn tabletree-btn btn btn-info btn-xs' data-tableRowId="+ tableRowId +" type='button'><i class='fa fa-pencil'></i></button>"
                                            + "<button class='tabletree-delbtn delbtn tabletree-btn btn btn-info btn-xs' data-tableRowId="+ tableRowId +" type='button'><i class='fa fa-trash-o'></i></button>";
                                    }
                                    else{
                                        return "<button class='tabletree-editbtn editbtn tabletree-btn btn btn-info btn-xs' data-tableRowId="+ tableRowId +" type='button'><i class='fa fa-pencil'></i></button>";
                                    }
                                }
                            }
                        },
                        css:"tabletree-operate",
                        width:70
                    });
                }
                var tabletree = webix.ui({
                    container:self.props.tableID,
                    view:'treetable',
                    columns:columns,
                    pager:{
                        template:"{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                        container:pagerID,
                        size:10,
                        group:5,
                        level:1,
                        width:500
                    },
                    editable:self.props.tabletree.editable,
                    editaction:'custom',
                    autoheight:true,
                    autowidth:self.props.tabletree.autowidth,
                    width:self.props.tabletree.css.width.tabletree,
                    select:'row',
                    resizeColumn:true,
                    datatype:'myjson',
                    data:tabletreeJSON
                });
                self.state.tabletree = tabletree;

                var selectAllID = "select_" + self.props.tableID;
                var tabletreebutton = null;
                if(!self.props.tabletree.operate){
                    var tabletreebutton = webix.ui({
                        container: selectAllID,
                        type: 'clean',
                        id:'selectAll',
                        width:self.props.tabletree.css.width.tabletree,
                        rows:[{
                            type:'form',
                            view: 'button',
                            value: 'Select-All',
                            width:100,
                            align:'right',
                            click:function(){
                                //choose all and deploy TO DO!!!
                                tabletree.checkAll();
                            }
                        }]
                    });
                }
                

                //不允许编辑的字段直接跳过
                tabletree.attachEvent('onBeforeEditStart',function (cell) {
                    if(this.getItem(cell.row).title == 'New Enviroment'){
                        return;
                    }
                    {
                        var rootID = cell.row;
                        while(this.getItem(rootID).$parent!=0){
                            rootID = this.getItem(rootID).$parent;
                        }
                        var rootName = this.getItem(rootID).title;
                    }

                    if(rootName == 'New Enviroment')
                        return true;
                    if(cell.column == 'Operate')
                        return true;
                    var record = this.getItem(cell.row);

                    //当是复杂节点时，不允许编辑
                    if(record.type == 'Object' || record.type == 'Array')
                        return false;
                    else
                        return true;
                });

                //校验edit后的值是否合理，不合适时恢复原始值
                tabletree.attachEvent('onBeforeEditStop',function (state, editor, trg) {
                    {
                        var rootID = editor.row;
                        while(this.getItem(rootID).$parent!=0){
                            rootID = this.getItem(rootID).$parent;
                        }
                        var rootName = this.getItem(rootID).title;
                    }

                    if(window.delFlag == 0)
                        return true;
                    if(state.Value == ''){
                        var title = this.getItem(editor.row).title;
                        //这三个字段必填
                        if(title == 'name' || title == 'version'|| title == 'Value'){
                            if(rootName == 'New Enviroment'){
                                return window.delFlag == 0;
                            }
                            //必填字段的提示与重置
                            alert('该字段必填！');
                            var oldValue;
                            if(state.old)
                                oldValue = state.old;
                            else
                                oldValue = '';
                            editor.setValue(oldValue);
                            return false;
                        }
                        else if(rootName=='New Enviroment'){
                            var closeFlag = 0;
                            var childID = this.getFirstChildId(rootID);
                            while(childID){
                                if(this.getItem(childID).title == 'name' || this.getItem(childID).title == 'version' || this.getItem(childID).title == 'Value'){
                                    var value = this.getItem(childID).Value;
                                    if(value) {
                                        value = value.replace(/\s+/g,' ');
                                        value = value.trim();
                                    }
                                    if(value == '' || value == undefined)
                                        return false;
                                    else
                                        closeFlag ++;
                                }
                                childID = this.getNextSiblingId(childID);
                            }
                            if(closeFlag == 2)
                                return true;
                            else
                                return false;
                        }
                    }
                });

                tabletree.editNode = function (id) {
                    var childID = this.getFirstChildId(id);
                    while(childID){
                        if(this.getItem(childID).title != 'alias')
                            this.editCell(childID,'Value');
                        childID = this.getNextSiblingId(childID);
                    }
                };

                //更新逻辑：向后台数据库请求更新
                tabletree.attachEvent('onAfterEditStop',function (state,editor,ignoreUpdate){
                    var ptabletree = this;
                    var keys = [];
                    var rootID = editor.row;
                    while(this.getItem(rootID).$parent!=0){
                        keys.push(this.getItem(rootID).title);
                        rootID = this.getItem(rootID).$parent;
                    }
                    var rootName = this.getItem(rootID).title;
                    var url = self.props.source + '&ac=new';

                    var postNewItem = function (rootID) {
                        var openNum = 0;
                        //所有字段编辑都关闭后，将节点组织为json 并post到后台保存
                        var childID = ptabletree.getFirstChildId(rootID);
                        var newItem = {};
                        var mastKey = 0;
                        while(childID){
                            if(ptabletree.getItem(childID).title == 'name' || ptabletree.getItem(childID).title == 'version' || ptabletree.getItem(childID).title == 'Value'){
                                if(ptabletree.getItem(childID).Value != undefined && ptabletree.getItem(childID).Value != ''){
                                    mastKey ++;
                                }
                            }
                            if(ptabletree.getItem(childID).Value == undefined){
                                openNum ++;
                            }
                            if(ptabletree.getItem(childID).title == 'alias'){
                                newItem[ptabletree.getItem(childID).title] = [];
                            }
                            else{
                                newItem[ptabletree.getItem(childID).title] = ptabletree.getItem(childID).Value==undefined?'':ptabletree.getItem(childID).Value;
                            }
                            childID = ptabletree.getNextSiblingId(childID);
                        }
                        if(mastKey == 2 && (openNum == 0 || openNum == 1)){
                            if((url.indexOf('software') != -1 && newItem.name && newItem.version) ||
                                (url.indexOf('software') == -1 && newItem.name && newItem.Value)){
                                Axios.post(url,newItem).then(
                                    data => {
                                        var status = data.data.status;
                                        if(status == 0){
                                            $.gritter.add({
                                                title: 'Warning: ',
                                                text: 'Failed to add '+type+' environment, please try again later',
                                                sticky: false,
                                                time: 2000
                                            });
                                        }
                                        else if(status == 1){
                                            var newTitle;
                                            var childID = ptabletree.getFirstChildId(rootID);
                                            while(childID){
                                                if(ptabletree.getItem(childID).title == 'name'){
                                                    newTitle = ptabletree.getItem(childID).Value;
                                                    break;
                                                }
                                            }
                                            var rootNode = ptabletree.getItem(rootID);
                                            rootNode.title = newTitle;
                                            if(data.data._id)
                                                rootNode.id = data.data._id;
                                            ptabletree.refresh();
                                            ptabletree.updateItem(rootID,rootNode);

                                            $.gritter.add({
                                                title: 'Attention:',
                                                text: 'Adding'+type+'environment successfully!',
                                                sticky: false,
                                                time: 2000
                                            });
                                        }
                                        else if(status == 2){
                                            ptabletree.remove(rootID);
                                            var id = data.data._id;
                                            var item = ptabletree.getItem(id);
                                            ptabletree.open(id);
                                            ptabletree.editNode(id);

                                            $.gritter.add({
                                                title: 'Attention:',
                                                text: 'Failed to add ' + type + ' environment has been added,  please try again later!',
                                                sticky: false,
                                                time: 2000
                                            });
                                        }
                                    },
                                    err => {
                                        $.gritter.add({
                                            title: 'Warning: ',
                                            text: 'Adding'+type+' environment, please try again later!',
                                            sticky: false,
                                            time: 2000
                                        });
                                    }
                                )
                            }
                        }
                    };

                    if(rootName == 'New Enviroment'){
                        // if((url.indexOf('software') != -1 && (this.getItem(editor.row).title == 'name' || this.getItem(editor.row).title == 'version'))
                        // ||(url.indexOf('software') == -1 && (this.getItem(editor.row).title == 'name' || this.getItem(editor.row).title == 'value'))){
                        if(this.getItem(editor.row).title == 'name' || this.getItem(editor.row).title == 'version' || this.getItem(editor.row).title == 'Value'){
                            if(this.getItem(editor.row).Value == '' || this.getItem(editor.row).Value == undefined){
                                return false;
                            }
                            else{
                                postNewItem(rootID);
                                return true;
                            }
                        }
                        else{
                            //其他字段只有在 必选字段 关闭后才能关闭
                            var nullFlag = false;
                            var childID = this.getFirstChildId(rootID);
                            while(childID){
                                if(this.getItem(childID).title == 'name' || this.getItem(childID).title == 'version' || this.getItem(childID).title == 'Value'){
                                    if(this.getItem(childID).Value == '' || this.getItem(childID).Value == undefined){
                                        nullFlag = true;
                                        break;
                                    }
                                }
                                childID = this.getNextSiblingId(childID);
                            }
                            postNewItem(rootID);
                            return !nullFlag;
                        }
                    }

                    //当新添加节点是array的子节点时，如果为空，直接移除
                    if(state.Value == state.old){
                        if(state.Value == ''){
                            var aliasID = this.getItem(editor.row).$parent;
                            if(aliasID == 0 )
                                return;
                            var title = this.getItem(aliasID).title;
                            if(title == 'alias')
                                this.remove(editor.row);
                        }
                        return false;
                    }
                    //更新键值对
                    var url = self.props.source + '&ac=update';
                    var msg = {
                        _id:this.getItem(rootID).id,
                        keys:keys.reverse(),
                        value:state.value,
                        type:'field'
                    };
                    // var type = (url.indexOf('software') == -1) ? '硬件' : '软件';
                    Axios.post(url,msg).then(
                        data => {
                            var status = data.data.status;
                            if(status == 0){
                                $.gritter.add({
                                    title: 'Warning: ',
                                    text: 'Failed to update '+type+' environment, please try again later!',
                                    sticky: false,
                                    time: 2000
                                });
                            }
                            else if(status == 1){
                                //更新tabletree上的显示：包括name
                                var newTitle;
                                var childID = ptabletree.getFirstChildId(rootID);
                                while(childID){
                                    if(ptabletree.getItem(childID).title == 'name'){
                                        newTitle = ptabletree.getItem(childID).Value;
                                        break;
                                    }
                                }
                                var rootNode = ptabletree.getItem(rootID);
                                rootNode.title = newTitle;
                                if(data.data._id)
                                    rootNode.id = data.data._id;
                                ptabletree.refresh();
                                ptabletree.updateItem(rootID,rootNode);

                                $.gritter.add({
                                    title: 'Attention: ',
                                    text: 'update '+type+' environment successfully!',
                                    sticky: false,
                                    time: 2000
                                });
                            }
                        },
                        err => {
                            $.gritter.add({
                                title: 'Warning: ',
                                text: 'Failed to update '+type+' environment, please try again later!',
                                sticky: false,
                                time: 2000
                            });
                        }
                    )
                });

                //删除逻辑：分为两种，删除item、删除array中的一项
                tabletree.on_click.delbtn = function (e,obj,trg){
                    var ptabletree = this;
                    var rootID = obj.row;
                    while(this.getItem(rootID).$parent!=0){
                        rootID = this.getItem(rootID).$parent;
                    }
                    var rootName = this.getItem(rootID).title;

                    if(!confirm('confirm delete?')){
                        return ;
                    }
                    var rowId = obj.row;
                    if(self.state.tabletree.getItem(rowId).$parent!=0){
                        //删除array中的一项
                        var rootID = rowId;
                        while(this.getItem(rootID).$parent!=0){
                            rootID = this.getItem(rootID).$parent;
                        }
                        var aliasId = self.state.tabletree.getBranchIndex(self.state.tabletree.getItem(rowId).id);
                        var url = self.props.source + '&ac=update';
                        var msg = {
                            _id:rootID,
                            aliasId:aliasId,
                            type:'array'
                        };
                        // var type = (url.indexOf('software') == -1) ? '硬件' : '软件';
                        Axios.post(url,msg).then(
                            data => {
                                var status = data.data.status;
                                if(status == 0){
                                    $.gritter.add({
                                        title: 'Warning: ',
                                        text: 'Failed to update '+type+' environment, please try again later!',
                                        sticky: false,
                                        time: 2000
                                    });
                                }
                                else if(status == 1){
                                    this.remove(rowId);
                                    $.gritter.add({
                                        title: 'Attention: ',
                                        text: 'update '+type+' environment successfully!',
                                        sticky: false,
                                        time: 2000
                                    });
                                }
                            },
                            err => {
                                $.gritter.add({
                                    title: 'Warning: ',
                                    text: 'Failed to update '+type+' environment, please try again later!',
                                    sticky: false,
                                    time: 2000
                                });
                            }
                        )
                    }
                    else{
                        if(rootName == 'New Enviroment'){
                            window.delFlag = 0;
                            ptabletree.editCancel();
                            ptabletree.remove(rootID);
                            return ;
                        }
                        //删除整个item
                        var url = self.props.source + '&ac=del';
                        var msg = {
                            _id:self.state.tabletree.getItem(rowId).id
                        };
                        Axios.post(url,msg).then(
                            data => {
                                var status = data.data.status;
                                if(status == 0){
                                    $.gritter.add({
                                        title: 'Warning: ',
                                        text: 'Failed to delete '+type+' environment, please try again later!',
                                        sticky: false,
                                        time: 2000
                                    });
                                }
                                else if(status == 1){
                                    this.remove(rowId);
                                    $.gritter.add({
                                        title: 'Attention: ',
                                        text: 'Delete '+type+' environment successfully!',
                                        sticky: false,
                                        time: 2000
                                    });
                                }
                            },
                            err => {
                                $.gritter.add({
                                    title: 'Warning: ',
                                    text: 'Failed to delete '+type+' environment, please try again later!',
                                    sticky: false,
                                    time: 2000
                                });
                            }
                        )
                    }
                };

                tabletree.on_click.editbtn = function (e, obj, trg) {
                    this.editCell(obj.row,'Value',true,false);
                };

                tabletree.on_click.addbtn = function (e, obj, trg) {
                    var parentID = obj.row;
                    var childCount = this.getItem(parentID).$count;
                    var nodeID = this.add({title:childCount,Value:'',type:'string'},-1,parentID);
                    this.open(parentID);
                    this.editCell(this.getItem(nodeID).id,'Value',true,false);
                };

                tabletree.newItem = function () {
                    window.delFlag = 1;
                    var rootID = this.add({title: 'New Enviroment', type: 'Object'},0);
                    for(var i=0;i<self.props.fields.length;i++){
                        var newItem = {
                            title:self.props.fields[i].title,
                            type:self.props.fields[i].type
                        };
                        var field = this.add(newItem,-1,rootID);
                        if(self.props.fields[i].type != 'Array'){
                            //bug
                            this.open(rootID);
                            this.editCell(this.getItem(field).id,'Value');
                        }
                    }
                };

                tabletree.addItems = function (items) {
                    var addByRecursion = function (items,fatherID,ptabletree) {
                        for(var i=0;i<items.length;i++){
                            var newKey = {};
                            for(var key in items[i]){
                                if(key != 'children'){
                                    newKey[key] = items[i][key];
                                }
                            }
                            var id;
                            if(fatherID == null){
                                id = ptabletree.add(newKey,0);
                            }
                            else
                                id = ptabletree.add(newKey,0,fatherID);
                            if(items[i]['children'] != null)
                                addByRecursion(items[i]['children'],id,ptabletree);
                            if(fatherID == null)
                                ptabletree.open(id);
                        }
                        if(fatherID == null)
                            $.gritter.add({
                                title: 'Attention: ',
                                text: 'add the selected '+type+' environment successfully, please edit it in time!',
                                sticky: false,
                                time: 2000
                            });
                    };
                    addByRecursion(items,null,this);
                };

                tabletree.openItems = function (itemsID) {
                    for(var i=0;i<itemsID.length;i++){
                        this.open(itemsID[i]);
                    }
                }
            })
        }
    },

    getTableTree:function () {
        return this.state.tabletree;
    },

    getChecked:function () {
        return this.state.tabletree.getChecked();
    },
    
    addItems:function (items) {
        this.state.tabletree.addItems(items);
    },
    
    openItems:function (itemsID) {
        this.state.tabletree.openItems(itemsID);
    },

    render : function()
    {
        {
            if(this.state.loading)
            {
                return (<span><i className="fa fa-spinner fa-spin fa-3x fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Loading...</span>);
            }
            if(this.state.err)
            {
                return (<span>Server err: {JSON.stringify(this.state.err)}</span>);
            }
        }
        
        return (
            <div>
                <div id={'pager_'+this.props.tableID}></div>
                <div id={this.props.tableID}></div>
                <div id={'select_' + this.props.tableID} style={{paddingTop:10}}></div>
            </div>
        );
    }
});

module.exports = EnviroTableTree;