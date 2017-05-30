var request = require('request');
var cheerio = require('cheerio');
var mysql = require('mysql');


var db = mysql.createConnection({
    host : '127.0.0.1',
    port : 8889,
    database:'article',
    user:'root',
    password:'root'
});

db.query('show tables',function(err,tables){
    
    db.end();

    if(err){
        return console.error(err);
    }
    return console.log(tables);
});

