var mongodb = require('./db');
var crypto = require('crypto');

function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

module.exports = User;

// Reference : 
// https://en.gravatar.com/site/implement/profiles/jsapi/
// 儲存使用者資訊
User.prototype.save = function(callback){

    var md5 = crypto.createHash('md5');
    var email_MD5 = md5.upate(this.email.toLowerCase()).digest('hex');
    var head = "http://www.gravatar.com/avatar/"+email_MD5+"?s=48"; //大頭貼連結

    // 要存入資料庫的使用者檔案
    var user = {
        name:this.name,
        password:this.password,
        email:this.email,
        head:head
    };

    mongodb.open(function(err , db){
        if(err){
            return callback(err); // 回傳err資訊
        }
        // 讀取 users 集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // 將使用者資料插入 user 集合
            collection.insert(user,{
                safe:true
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                // success , err 為 null並回傳儲存後的使用者文件檔
                return callback(null,user); 
            })
        });
    });
};

// 讀取使用者資訊
User.get = function(name,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                name:name
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                //@param1 err : null
                //@param2 user : user
                callback(null,user); // 傳回查詢的使用者資訊
            });
        });
    });
};