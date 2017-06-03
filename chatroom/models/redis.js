var redis = require('redis');

// 建立一個 redis 用戶端
// default port : 6379
var client = redis.createClient();

exports.throw = function(bottle,callback){
    bottle.time = bottle.time || Date.now();
    var bottleId = Math.random().toString(16);
    var type = {male:0,female:1};
    
    client.SELECT(type[bottle.type],function(){ 
        client.HMSET(bottleId,bottle,function(err,result){
            if(err){
                return callback({code:0,msg:'try again later'});
            }
            callback({code:1,msg:result});
            client.EXPIRE(bottleId,86400); // 存活期限為一天
        });
    });
};

exports.pick = function(information,callback){
    var type = {all:Math.round(Math.random()),male:0,female:1};
    information.type = information.type || 'all';

    client.SELECT(type[information.type],function(){
        client.RANDOMKEY(function(err,bottleId){
            if(!bottleId){
                return callback({code:0,msg:'empty'});
            }

            client.HGETALL(bottleId,function(err,result){
                if(err){
                    return callback({code:0,msg:'pick the chat room id failed '});
                }
                callback({code:1,msg:result});
                client.DEL(bottleId); // 刪除該聊天室
            });
        });
    });
};