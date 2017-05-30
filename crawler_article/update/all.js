var async = require('async');
var config = require('../config');
var read = require('./read');
var save = require('./save');

var classList ;
var articleList = {};

async.series([

    // 讀取文章分類
    function(done){
        read.classList(config.blog.url,function(err,list){
            classList = list;
            done(err);
        });
    },

    function(done){
        save.classList(classList,done);
    },

    // 讀取文章列表
    function(done){
        async.eachSeries(classList,function(class_list,next){
            read.articleList(class_list.url,function(err,list){
                articleList[class_list.id] = list;
                next(err);
            });
        },done);
    },

    function(done){
        async.eachSeries(Object.keys(articleList),function(classId,next){
            save.articleList(classId,articleList[classId],next);
        },done);
    },

    function(done){
        async.eachSeries(Object.keys(articleList),function(classId,next){
            save.articleCount(classId,articleList[classId].length,next);
        },done);
    },

    function(done){
        var articles = {};
        Object.keys(articleList).forEach(function(classId){
            articleList[classId].forEach(function(item){
                articles[item.id] = item;
            });
        });

        articleList = [];
        Object.keys(articles).forEach(function(id){
            articleList.push(articles[id]);
        });
        done();
    },

    function(done){
        async.eachSeries(articleList,function(item,next){
            save.isArticleExists(item.id,function(err,exists){
                if(err){
                    return next(err);
                }
                if(exists){
                    console.log('文章已存在');
                    return next();
                }
                read.articleDetail(item.url,function(err,detail){
                    if(err){
                        return next(err);
                    }
                    save.articleDetail(item.id,detail.tags,detail.content,function(err){
                        if(err){
                            return next(err);
                        }
                        save.articleTags(item.id,detail.tags,next);
                    });
                });
            });
        },done);
    }


],function(err){
    if(err){
        console.error(err.stack);
    }
    console.log('done');
    process.exit(0);
});
