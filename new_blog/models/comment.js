var mongodb = require('./db');

function Comment(name,day,title,comment){
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

// 儲存一條留言
Comment.prototype.save =  function(callback){
    var name = this.name;
    var day = this.day;
    var title = this.title;
    var comment =  this.comment;

    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
                name:name,
                "time.day":day,
                title:title,
            },{
                $push:{'comments':comment}
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null);
            })
        })
    });

}
