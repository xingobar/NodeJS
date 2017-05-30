var mysql =  require('mysql');

exports.db = mysql.createConnection({
    host : '127.0.0.1',
    port : 8889,
    database:'article',
    user:'root',
    password:'root'
});

exports.blog = {
    url : 'http://blog.sina.com.cn/u/1776757314'
};