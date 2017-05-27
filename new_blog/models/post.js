var mongodb = require('./db');

function Post(name,title,post){
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;


// 儲存一篇文章及其相關資訊
Post.prototype.save = function(callback){
    var date = new Date();

    var time = {
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear() +'-'+(date.getMonth()-1),
        day:date.getFullYear()+'-'+(date.getMonth()-1) + '-'+ date.getDate(),
        minute:date.getFullYear()+'-'+(date.getMonth()-1) + '-'+ date.getDate()
                + " "+ date.getHours() +":"+(date.getMinutes() < 10 ? '0' +
                 date.getMinutes() : date.getMinutes())
    };

    // 要存入資料庫的文件檔
    var post = {
        name:this.name,
        time:time,
        post:this.post,
        title:this.title
    };

    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        // 讀取 posts 集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // 將文件檔插入posts集合
            collection.insert(post,{
                safe:true
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null); // 傳回 err 為 null
            })
        });
    });
};

// 讀取文章及其相關資訊
Post.get = function(name,callback){
    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        // 讀取 posts 集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {}
            if(name){
                query.name = name;
            }
            collection.find(query).sort({
                time:-1  // 遞減排序
            }).toArray(function(err,docs){ // documents :rows
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs); // 成功的話以陣列的形式傳回結果
            });
        });
    });
};