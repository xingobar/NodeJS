var originalRequest = require('request');
var cheerio  = require('cheerio');

function request(url,callback){
    originalRequest(url,callback);
}

exports.classList = function(url,callback){
    console.log('讀取文章分類列表 %s ', url);

    request(url,function(err,res,body){
        if(err){
            return callback(err);
        }

            var $ = cheerio.load(body.toString());

            // 讀取部落格文章列表
            var classList = [];
            $('.classList li a').each(function(){
                
                var element = $(this);
                var item = {
                    name : $(element).text().trim(),
                    url : $(element).attr('href')
                };

                // 從 url 中取出分類的 id
                var reg = item.url.match(/articlelist_\d+_(\d+)_\d+\.html/);
                if(Array.isArray(reg)){
                    item.id = reg[1];
                    classList.push(item);
                }
            });
        callback(null,classList);
    });
};

exports.articleList = function(url,callback){
    
    console.log('讀取文章分類列表 %s ', url);

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
            exports.articleList(nextUrl,function(err,articleList2){
                if(err){
                    return callback(err);
                }
                callback(null,articleList.concat(articleList2));
            });
        }else{
            callback(null,articleList);
        }
    });
};

exports.articleDetail = function(url,callback){

    console.log('讀取文章分類列表 %s ', url);

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
        return callback(null,{tags:tags,content:content});
    });
};