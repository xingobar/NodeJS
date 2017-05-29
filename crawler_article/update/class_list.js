var request = require('request');
var cheerio = require('cheerio');

console.log('讀取文章列表中.....');

// 讀取網頁
request('http://blog.sina.com.cn/u/1776757314',function(err,res,body){

    if(err){
        return console.log(err);
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

    console.log(classList);
});