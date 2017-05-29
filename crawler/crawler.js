var request = require('request');
var cheerio = require('cheerio');

request('http://www.cwb.gov.tw/V7/forecast/taiwan/Taipei_City.htm',function(err,res,body){
    
    if(err){
        return console.log(err);
    }

    //透過 load 方法把 HTML 轉換成 JQuery 物件
    var $ = cheerio.load(body);
    var weather = [];

    // 搜尋此 table 下的所有 tr
    $('.FcstBoxTable01 tbody tr').each(function(index,element){
        weather.push($(this).text().split('\n'));
    });
   
    var output = [];
    for(var index = 0 ; index <  weather.length; index ++){
        // global search in string
        output.push({
            time:weather[index][1].replace(/\t/g,'').split(' ')[0],
            tempartue: weather[index][2].replace(/\t/g,''),
            rain_probability : isEmptyOrUndefined(weather[index][6])
        });
    }
   console.log(output);
});
function isEmptyOrUndefined(value){
    if(value === '' || typeof value != 'undefined'){
        value = value.replace(/\t/g,'');
        if(value != ''){
            return value;
        }
        return '0 %';
    }
    return '0 %' ;
}