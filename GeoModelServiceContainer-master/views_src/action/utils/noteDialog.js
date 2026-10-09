/**
 * Created by Franklin on 2017/4/25.
 */

var NoteDialog = function(){};

NoteDialog.openNoteDia = function(title, text){
    if(text == undefined){
        text = ' ';
    }
    $.gritter.add({
        // (string | mandatory) the heading of the notification
        title: title,
        // (string | mandatory) the text inside the notification
        text: text
    });
};

module.exports = NoteDialog;