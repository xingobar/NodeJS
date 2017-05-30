var async =  require('async');
var db = require('../config').db;


exports.classList  = function(callback){
    db.query('select * from `class_list` order by `asc` ' ,callback);
};

exports.isClassExists = function(id,callback){
    db.query('select * from `class_list` where `id` = ? limit 1',
            [id],function(err,data){
                if(err){
                    return next(err);
                }
                callback(null,Array.isArray(data) &&  data.length >=1);
            });
};

exports.class = function(id,callback){
    db.query('select * from `class_list` where `id` = ? limit 1',
            [id],
            function(err,list){
                if(err){
                    return callback(err);
                }
                if(!list.length > 0){
                    return callback(new Error('not found'));
                }
                callback(null,list[0]);
            });
}

exports.article = function(id,callback){
    db.query('select * from `article_list` ' + 
            'left join `article_detail` on `article_list`.`id` = `article_detail`.`id`' + 
            'where `article_list`.`id` = ?',[id],function(err,list){
                if(err){
                    return callback(err);
                }
                if(!list.length > 0){
                    return callback(new Error('not found'));
                }

                callback(null,list[0]);
            });
}

exports.articleListByClassId = function(classId,offset,limit,callback){

    db.query('select * from `article_list` ' +
            'left join `article_detail` on `article_list`.`id` = `article_detail`.`id`'  +
            'where `article_list`.`class_id` = ? ' +
            'order by `created_time` desc limit ?,?',[classId,offset,limit],callback);
}


exports.articleListByTag = function(tag,offset,limit,callback){
    
    db.query('select * from article_list where `id` in ( '+
             'select `id` from `article_tag` where `tags` = ? ) ' +
            'order by `created_time` desc limit ?,? ',[tag,offset,limit],callback );
}

exports.articleCountByTag = function(tag,callback){
    db.query('select count(*) as `total` from `article_tag` where `tag` = ?',[tag],function(err,article_tag){
        if(err){
            return callback(err);
        }
        callback(null,article_tag[0].total)
    });
}