var request = require('request');
var cheerio = require('cheerio');


console.log('讀取部落格文章列表中.....');

function readArticleList(url,callback){

    // 讀取分類頁面
    request(url,function(err,res,body){

        if(err){
            return console.log(err);
        }

        var $ = cheerio.load(body.toString());
        var articleList = [];
        $('.articleList .articleCell').each(function(){

            var curr = $(this);
            var title = $(curr).find('.atc_title a');
            var time = $(curr).find('.atc_tm');

            var item = {
                title: $(title).text().trim(),
                url : $(title).attr('href'),
                time : $(time).text().trim()
            };

            // 從 url 中取出文章 id
            var reg = item.url.match(/blog_([_a-zA-Z0-9]+)\.html/);
            if(Array.isArray(reg)){
                item.id = reg[1];
                articleList.push(item);
            }

        });

        // 檢查是否有下一頁
        var nextUrl = $('.SG_pgnext a').attr('href');
        if(nextUrl){
            readArticleList(nextUrl,function(err,articleList2){
                if(err){
                    return callback(err);
                }
                callback(null,articleList.concat(articleList2));
            });
        }else{
            callback(null,articleList);
        }
    });
}

readArticleList('http://blog.sina.com.cn/s/articlelist_1776757314_0_1.html',function(err,articleList){

    if(err){
        return console.error(err.stack);
    }
    console.log(articleList);
});

