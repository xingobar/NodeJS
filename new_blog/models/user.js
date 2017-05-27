var mongodb = require('./db');

function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

module.exports = User;

// 儲存使用者資訊
User.prototype.save = function(callback){
    // 要存入資料庫的使用者檔案
    var user = {
        name:this.name,
        password:this.password,
        email:this.email
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