$(document).ready(function () {
    window.noticeFilter = '所有';
    window.noticeType = 'all';
    window.notices = [];
    window.currentPage = 1;
    var sign2read = function (e) {
        var id;
        if(!e)
            id = 'all';
        else
            id = e.currentTarget.id;
        $.ajax({
            url:'/notices',
            type:'POST',
            data:{_id:id},
            success:function (msg) {
                msg = JSON.parse(msg);
                if(msg.status == 1){
                    if(id == 'all'){
                        for(var i=0;i<window.notices.length;i++){
                            window.notices[i].hasRead = true;
                            if($('#'+window.notices[i]._id).length)
                                $('#'+window.notices[i]._id).parent()[0].removeChild($('#'+window.notices[i]._id)[0]);
                        }
                        $.gritter.add({
                            title: window.LanguageConfig.Notice.InfoTitle,
                            text: window.LanguageConfig.Notice.AllMessageMarkedRead,
                            sticky: false,
                            time: 2000
                        });
                        return false;
                    }
                    else{
                        if($('#'+id).length){
                            window.notices[$('#'+id).attr('data-index')].hasRead = true;
                            $('#'+id).parent()[0].removeChild($('#'+id)[0]);
                            $.gritter.add({
                                title: window.LanguageConfig.Notice.InfoTitle,
                                text: window.LanguageConfig.Notice.MessageMarkedRead,
                                sticky: false,
                                time: 2000
                            });
                            window.Polling();
                            return false;
                        }
                    }
                }
                else if(msg.status == 0){
                    $.gritter.add({
                        title: window.LanguageConfig.Notice.WarningTitle,
                        text: window.LanguageConfig.Notice.MessageMarkedReadFailed,
                        sticky: false,
                        time: 2000
                    });
                    window.Polling();
                    return false;
                }
            }
        })
    };
    var refresh = function () {
        var url = '/notices?noticeFilter=' + window.noticeFilter + '&noticeType=' + window.noticeType;
        $.ajax({
            url:url,
            type:'GET',
            success:function (msg) {
                msg = JSON.parse(msg);
                if(msg.status == 1){
                    window.notices = msg.data;
                    var SIZE = 13;
                    var gotoPage = function () {
                        var page = window.currentPage;
                        $('#notices').html('');
                        var start = (page - 1) * SIZE;
                        var end = Math.min(page * SIZE, window.notices.length);
                        for (var i = start, j = end; i < j; i++) {
                            var item = window.notices[i];
                            var news = '';
                            var tmp = $('#template').html();
                            tmp = tmp.replace(/\{(\w+)\}/g, function (source, key) {
                                if(source == "{time}") {
                                    var myDate = new Date(item[key]);
                                    return myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate() + ' ' + myDate.getHours() + ':' + (myDate.getMinutes() < 10 ? '0' + myDate.getMinutes() : myDate.getMinutes()) + ':' + myDate.getSeconds();
                                }
                                if(source == "{detail}"){
                                    var detail = item[key];
                                    if(detail && detail!='')
                                        return item[key];
                                    else
                                        return '';
                                }
                                return item[key];
                            });
                            if (item.hasRead == false) {
                                news = '<button id="{_id}" data-index="{index}" name="{type}" class="label label-sm btn-success notice-tag" style="margin-left: 30px"><small>new</small></button>';
                                news = news.replace(/\{(\w+)\}/g, function (source, key) {
                                    if(source == "{index}")
                                        return i;
                                    return item[key];
                                });
                            }
                            tmp += news + '</a> </li>';
                            $('#notices').append(tmp);

                            $('#' + window.notices[i]._id).click(function (e) {
                                if($('#'+e.currentTarget.id).length){
                                    sign2read(e);
                                }
                            });
                        }
                    };
                    $('#pager').jqPagination({
                        current_page:1,
                        max_page: Math.ceil(window.notices.length/SIZE),
                        page_string: ' {current_page} / {max_page}',
                        paged: function (page) {
                            window.currentPage = page;
                            gotoPage();
                        }
                    });
                    gotoPage(1);
                }
                else if(msg.status == 0){
                    $.gritter.add({
                        title: window.LanguageConfig.Notice.WarningTitle,
                        text: window.LanguageConfig.Notice.GettingNoticeFailed,
                        sticky: false,
                        time: 2000
                    });
                    return false;
                }
            }
        });
    };
    
    refresh();

    setInterval(refresh,600000);

    //改变查询类型
    {

        $('#btn-refresh').click(function () {
            refresh();
        });

        $('#btn-HasReaded').click(function (e) {
            window.currentPage = 1;
            sign2read(null);
            refresh();
        });

        $('#typeUL a').click(function (e) {
            $('#selectedType').text(e.currentTarget.text);
            window.noticeFilter = $('#selectedType').text();
            $('#pager').jqPagination('option','current_page',1);
            refresh();
        });
        $('#getbyclass').click(function () {
            window.noticeType='all';
            $('#pager').jqPagination('option','current_page',1);
            window.currentPage = 1;
            refresh();
        });
        $('#type-start-run').click(function () {
            window.noticeType='start-run';
            $('#pager').jqPagination('option','current_page',1);
            window.currentPage = 1;
            refresh();
        });
        $('#type-stop-run').click(function () {
            window.noticeType='stop-run';
            $('#pager').jqPagination('option','current_page',1);
            window.currentPage = 1;
            refresh();
        });
        $('#type-del-ms').click(function () {
            window.noticeType='del-ms';
            $('#pager').jqPagination('option','current_page',1);
            window.currentPage = 1;
            refresh();
        })
    }
});