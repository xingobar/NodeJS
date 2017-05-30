var request = require('request');
var cheerio = require('cheerio');

console.log('讀取文章中........');


request('http://blog.sina.com.cn/s/blog_69e72a420101gvec.html',function(err,res,body){

    if(err){
        return console.error(err.stack);
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
    console.log({'tags':tags,'content':content});
});

