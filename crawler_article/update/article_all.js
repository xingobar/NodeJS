var request = require('request');
var cheerio = require('cheerio');
var async = require('async');


function readArticleList(url,callback){

    console.log('讀取部落格文章列表 %s 中..... ' , url);

    request(url,function(err,res,body){

        if(err){
            return callback(err);
        }

        var $ = cheerio.load(body.toString());
        var articleList = [];
        
        $('.articleList .articleCell').each(function(){
            var current = $(this);
            var title = $(current).find('.atc_title a');
            var time = $(current).find('.atc_tm');

            var item = {
                title: $(title).text().trim(),
                url:$(title).attr('href'),
                time:$(time).text().trim()
            };

            // 從 url 中取出文章 id
            var reg = item.url.match(/blog_([_a-zA-Z0-9]+)\.html/);
            if(Array.isArray(reg)){
                item.id = reg[1];
                articleList.push(item);
            }
        });
        callback(null,articleList);
    });
}


function readArticleDetail(url,callback){

    console.log('讀取部落格文章內容 %s 中 ....', url);

    request(url,function(err,res,body){
        
        if(err){
            return callback(err);
        }

        var $ = cheerio.load(body.toString());
        
        // 文章標籤
        var tags = [];
        $('.blog_tag h3 a').each(function(){
            var tag = $(this).text().trim();
            if(tag){
                tags.push(tag);
            }
        });

        // 取得文章內容
        var content = $('.articalContent').html().trim();
        callback(null,{tags:tags,content:content});
    });
}

readArticleList('http://blog.sina.com.cn/s/articlelist_1776757314_0_1.html',
    function(err,articleList){

        if(err){
            return console.error(err);
        }
        // 依序取出articleList陣列元素的元素
        async.eachSeries(articleList,function(article,next){
            readArticleDetail(article.url,function(err,detail){
                if(err){
                    console.error(err);
                }
                // 顯示文章內容
                console.log(detail);
                next();
            });
        },function(err){
            if(err){
                return console.error(err);
            }
            console.log('done');
        });
    });