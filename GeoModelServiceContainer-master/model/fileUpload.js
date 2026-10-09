/**
 * Created by Franklin on 2016/8/17.
 */

function FileUploadCollection() {
    this.collection = [];
}

module.exports = FileUploadCollection;

//新增
FileUploadCollection.prototype.add = function (item) {
    var res = this.get(item.sessionId);
    if(res == -1)
    {
        this.collection.push(item);
        return 1;
    }
    return -1;
};

//删除
FileUploadCollection.prototype.remove = function(sessionId){
    for(var i = 0; i < this.collection.length; i++)
    {
        if(this.collection[i].sessionId == sessionId)
        {
            this.collection.slice(i, 1);
            return 1;
        }
    }
    return -1;
};

//查询
FileUploadCollection.prototype.get = function (sessionId) {
    for(var i = 0; i < this.collection.length; i++)
    {
        if(sessionId == this.collection[i].sessionId)
        {
            return this.collection[i];
        }
    }
    return -1;
};

//更新
FileUploadCollection.prototype.update =function (item) {
    for(var i = 0; i < this.collection.length; i++)
    {
        if(item.sessionId == this.collection[i].sessionId)
        {
            this.collection[i] = item;
            return 1;
        }
    }
    return -1;
};