var async = require('async');
var db = require('../config').db;

// 儲存文章分類
exports.classList = function(list,callback){

    console.log('儲存分類中 .... ');
    console.log('總數為  %d ' ,list.length);

    async.eachSeries(list,function(item,next){

        // 查詢分類是否已存在
        db.query('select * from `class_list` where `id` = ? limit 1 ',
                [item.id],
                function(err,data){
                    if(err){
                        return next(err);
                    }
                    if(Array.isArray(data) && data.length >=1 ){
                        // 分類已存在，所以須更新
                        db.query('update `class_list` set `name` = ?, `url` = ?  where `id` = ?',
                                [item.name,item.url,item.id],next);
                    }else{
                        db.query('insert into `class_list`(`id`,`name`,`url`) values (?,?,?)',
                                 [item.id,item.name,item.url],next);
                    }
                });
    },callback);
};

// 儲存文章列表
exports.articleList = function(class_id,list,callback){

    console.log('儲存文章列表中 ...... ');
    console.log('%d %d ' , class_id,list.length);

    async.eachSeries(list,function(item,next){
        // 查詢文章是否已存在
        db.query('select * from `article_list` where `id` = ? and `class_id` = ? limit 1',
                [item.id,class_id],function(err,data){
                    if(err){
                        return next(err);
                    }
                    var created_time = new Date(item.time).getTime() / 1000;

                    if(Array.isArray(data) && data.length >=1){
                        db.query('update `article_list` set `title` = ? , `url` = ? , `class_id`= ? ,`created_time` = ?  where `id` = ? and `class_id` = ? ',
                            [item.title,item.url,class_id,created_time,item.id,class_id],next);
                    }else{
                        db.query('insert into `article_list` (`id`,`title`,`url`,`class_id`,`created_time`) values (?,?,?,?,?)',
                                [item.id,item.title,item.url,class_id,created_time],next);
                    }
                });
    },callback);
};

// 儲存文章分類的文章總數
exports.articleCount = function(class_id,count,callback){

    console.log('儲存文章分類的文章總數 .....');

    db.query('update `class_list` set `count` = ? where `id` = ?',
            [count,class_id],callback);
};

// 儲存文章標籤
exports.articleTags = function(id,tags,callback){

    // 刪除舊的標籤資訊
    db.query('delete from `article_tag` where `id` = ? ',[id],function(err){
        if(err){
            return callback(err);
        }
        if(tags.length > 0){
            var values = tags.map(function(tag){
               return '(' + db.escape(id) + ', ' + db.escape(tag) + ')';  
            }).join(', ');

            db.query('insert into `article_tag` (`id` ,`tag`) values ' + values,callback);
        }else{
            callback(null);
        }
    });
};


exports.articleDetail = function(id,tags,content,callback){
    
    console.log('儲存文章內容中....');

    db.query('select `id` from `article_detail` where `id` = ? ',[id],function(err,data){
        if(err){
            return callback(err);
        }
        tags = tags.join(' ');
        if(Array.isArray(data) && data.length >=1){
            db.query('update `article_detail` set `tags` = ? , `content` = ? where `id` = ?',
                    [tags,content,id],callback);
        }else{
            db.query('insert into `article_detail` (`id`,`tags`,`content`) values (?,?,?)',
            [id,tags,content],callback);
        }
    });
};

// 檢查文章是否已存在
exports.isArticleExists = function(id,callback){
    
    db.query('select `id` from `article_detail` where `id` = ? ',[id],
            function(err,data){
                if(err){
                    return callback(err);
                }
                callback(null,Array.isArray(data) && data.length >=1);
            });
};