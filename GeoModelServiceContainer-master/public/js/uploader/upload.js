/*jslint unparam: true */
/*global window, $ */
$(function() {
    $("#imageupload").fileupload({ //init
        url:"/upload/image",
        dataType: 'json',
        autoUpload: true,
        //acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: 1000000000, // 1g
        // Enable image resizing, except for Android and Opera,
        // which actually support image resizing, but fail to
        // send Blob objects via XHR requests:
        disableImageResize: /Android(?!.*Chrome)|Opera/
            .test(window.navigator.userAgent),
        previewMaxWidth: 100,
        previewMaxHeight: 100,
        previewCrop: true
    });

    $('#imageupload')
        .bind('fileuploadadd', function (e, data) {
            // console.log(e);
            // console.log(data);
            data.context = $('<div></div>').appendTo('#files');
            $.each(data.files, function (index, file) {//每添加一个文件，在下方显示其文件名
                var node = $('<p></p>').append($('<span/>').text(file.name));
                node.appendTo(data.context);
            });
        })
        .bind('fileuploadprogressall', function (e, data) { //进度条
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progressUpload .progressUpload-bar').css('width', progress + '%');
        })
        .bind('fileuploadprocessalways', function (e, data) {
            var index = data.index,
                file = data.files[index],
                node = $(data.context.children()[index]);
            if (file.preview) {
                node
                    .prepend('<br>')
                    .prepend(file.preview);
            }
            if (file.error) {
                node
                    .append('<br>')
                    .append($('<span class="text-danger"/>').text(file.error));
            }
            if (index + 1 === data.files.length) {
                data.context.find('button')
                    .text('Upload')
                    .prop('disabled', !!data.files.error);
            }
        })
        .bind('fileuploaddone', function (e, data) {
            console.log(e);
            console.log(data);
            $.each(data.result.files, function (index, file) {
                if (file.url) {
                    var link = $('<a>')
                        .attr('target', '_blank')
                        .prop('href', file.url);
                    $(data.context.children()[index])
                        .wrap(link);
                } else if (file.error) {
                    var error = $('<span class="text-danger"/>').text(file.error);
                    $(data.context.children()[index])
                        .append('<br>')
                        .append(error);
                }
            });
        })
        .bind('fileuploadfail', function (e, data) {
            $.each(data.files, function (index, file) {
                var error = $('<span class="text-danger"></span>').text('File upload failed.');
                $(data.context.children()[index])
                    .append('<br>')
                    .append(error);
            });
        })
        .prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
    // console.log($("#imageupload").val().files[0].name);
});

