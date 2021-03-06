var mongodb = require('./db');
var markdown = require('markdown').markdown;
function Post(name,head,title,tags,post){
    this.name = name;
    this.head = head;
    this.title = title;
    this.tags = tags,
    this.post = post;
}

module.exports = Post;


// 儲存一篇文章及其相關資訊
Post.prototype.save = function(callback){
    var date = new Date();

    var time = {
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear() +'-'+(date.getMonth()-1),
        day:date.getFullYear()+'-'+(date.getMonth()-1) + '-'+ date.getDate(),
        minute:date.getFullYear()+'-'+(date.getMonth()-1) + '-'+ date.getDate()
                + " "+ date.getHours() +":"+(date.getMinutes() < 10 ? '0' +
                 date.getMinutes() : date.getMinutes())
    };

    // 要存入資料庫的文件檔
    var post = {
        name:this.name,
        head:this.head,
        time:time,
        post:this.post,
        title:this.title,
        tags:this.tags,
        comments:[],
        pv:0
    };

    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        // 讀取 posts 集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // 將文件檔插入posts集合
            collection.insert(post,{
                safe:true
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null); // 傳回 err 為 null
            })
        });
    });
};


// 一次取得十篇文章
Post.getTen = function(name,page,callback){
    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        // 讀取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            
            if(name){
                query.name = name;
            }
            
            // 使用 count 傳回特定查詢的文件檔數量 total
            collection.count(query,function(err,total){
                collection.find(query,{
                    skip:(page - 1) * 10,
                    limit:10
                }).sort({
                    time:-1
                }).toArray(function(err,docs){
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
                    docs.forEach(function(doc){
                        doc.post = markdown.toHTML(doc.post);
                    })
                    callback(null,docs,total);
                });
            });
        });
    });
}

// 讀取文章及其相關資訊
Post.getAll = function(name,callback){
    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        // 讀取 posts 集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {}
            if(name){
                query.name = name;
            }
            collection.find(query).sort({
                time:-1  // 遞減排序
            }).toArray(function(err,docs){ // documents :rows
                mongodb.close();
                if(err){
                    return callback(err);
                }
                docs.forEach(function(doc,index){
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null,docs); // 成功的話以陣列的形式傳回結果
            });
        });
    });
};



// 取得一篇文章
// TODO: error
Post.getOne = function(name,day,title,callback){
    //打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // 根據用戶名稱 發表日期及文章名稱查詢
            collection.findOne({
                name:name,
                "time.day":day,
                title:title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                //doc.post = markdown.toHTML(doc.post);
                if(doc){
                    //每瀏覽一次 pv值加一
                    // collection.update({
                    //     name:name,
                    //     "time.day":day,
                    //     title:title
                    // },{
                    //     $inc:{'pv':1}
                    // },function(err){
                    //     mongodb.close();
                    //     if(err){
                    //         return callback(err);
                    //     }
                    // });
                    // 解析 markdown 為 html
                    doc.post = markdown.toHTML(doc.post);
                    if(doc.comments){     
                        // comment structure
                        // @param1 : name
                        // @param2 : email
                        // @param3 : website
                        // @param4 : content
                        // @param5 : time
                        doc.comments.forEach(function(comment,index){
                            comment.content = markdown.toHTML(comment.content);
                        });   
                    }
                }
                return callback(null,doc);
            })
        });
    }); 
}

// 傳回原始發表內容
Post.edit = function(name,day,title,callback){
    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.findOne({
                name:name,
                "time.day":day,
                title:title
            },function(err,doc){
               mongodb.close();
               if(err){
                   callback(err);
               } 
               callback(null,doc); // 傳回查詢的一篇文章
            });
        });
    });
};


// 更新一篇文章及其相關資訊
Post.update = function(name,day,title,post,callback){
    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            // 更新文章內容
            collection.update({
                name:name,
                "time.day":day,
                title:title
            },{
                $set:{post:post}
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};


// 刪除一篇文章
Post.remove = function(name,day,title,callback){
    // 打開資料庫
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.remove({
                name:name,
                "time.day":day,
                title:title
            },{
                w:1
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        });
    });
}

// 傳回所有文章資訊
Post.getArchive = function(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        // 讀取 posts 集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({},{
                name:1,
                time:1,
                title:1
            }).sort({
                time:-1
            }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,docs);
            });
        });
    });
};

// 傳回所有標籤
Post.getTags = function(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // distinct 用來找出指定鍵的所有不同值
            collection.distinct('tags',function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
};


// 傳回特定標籤的所有文章
Post.getTag = function(tag,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // 查詢所有tags陣列包含 tag的文件檔
            collection.find({
                "tags":tag
            },{
                name:1,
                time:1,
                title:1,
            }).sort({
                time:-1
            }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
};

// 傳回以標題為關鍵字查詢的所有文章資訊
Post.search = function(keywork,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // 不分大小寫
            var pattern  =  new RegExp(keywork,"i");
            collection.find({
                title:pattern
            },{
                name:1,
                time:1,
                title:1
            }).sort({
                time:-1
            }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
};