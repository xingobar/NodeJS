var express = require('express');
var crypto = require('crypto');
var flash = require('connect-flash');
var router = express.Router();
User =  require('../models/user');
Post  = require('../models/post');
Comment = require('../models/comment');
/* GET home page. */
router.get('/', function(req, res, next) {
  
  // 判斷是否是第一頁，並把請求頁數轉換成 int 
  var page = req.query.p ? parseInt(req.query.p) : 1;
  
  Post.getTen(null,page,function(err,posts,total){
    if(err){
      posts = [];
    }

    return res.render('index',{
      title:'主頁',
      posts:posts,
      page:page,
      isFirstPage : (page - 1) == 0,
      isLastPage : ((page - 1) * 10 + posts.length ) == total,
      user:req.session.user,
      success:req.flash('success'),
      error:req.flash('error')
    });
  });
});


router.get('/register',checkNotLogin);
router.get('/register',function(req,res){
  res.render('register',{
    title:'註冊',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});

router.post('/register',checkNotLogin);
router.post('/register',function(req,res){
  var name = req.body.name;
  var password = req.body.password;
  var password_re = req.body['password-repeat'];

  if(password != password_re){
    req.flash('error','兩次輸入的密碼不一致');
    return res.redirect('/register');
  }

  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
    name : name,
    password : password,
    email : req.body.email,
  });

  User.get(newUser.name,function(err,user){
    if(user){
      req.flash('error','用戶已存在!!');
      return res.redirect('/register');
    }
    
    // 如果不存在則新增用戶
    newUser.save(function(err,user){
      if(err){
        req.flash('error',err);
        return res.redirect('/register');
      }
      
      req.session.user = user;
      req.flash('succes','註冊成功!');
      res.redirect('/'); 
    });
  });
});

router.get('/login',checkNotLogin);
router.get('/login',function(req,res){
  res.render('login',{
    title:'登入',
    user:req.session.user,
    success:req.flash('success'),
    error:req.flash('error')
  });
});

router.post('/login',checkNotLogin);
router.post('/login',function(req,res){
   var md5 = crypto.createHash('md5');
   var password = md5.update(req.body.password).digest('hex');

   // 檢查用戶是否存在
   User.get(req.body.name,function(err,user){
      if(!user){
        req.flash('error','用戶不存在');
        return res.redirect('/login');
      }

      // 檢查密碼是否一致
      if(user.password != password){
        res.flash('error','密碼錯誤');
        return res.redirect('/login');
      }

      req.session.user = user;
      req.flash('success','登入成功！');
      return res.redirect('/');

   });
});

router.get('/post',checkLogin);
router.get('/post',function(req,res){
  res.render('post',{
    title:'發表',
    user:req.session.user,
    success:req.flash('success'),
    error:req.flash('error')
  });
});

router.post('/post',checkLogin);
router.post('/post',function(req,res){
  var currentUser = req.session.user;
  var tags = [req.body.tag1,req.body.tag2,req.body.tag3];

  post =  new Post(currentUser.name,currentUser.head,req.body.title,tags,req.body.post);
  post.save(function(err){
    if(err){
      res.flash('error',err);
      return res.redirect('/');
    }
    req.flash('success','發布成功！');
    res.redirect('/');
  });
});

router.get('/logout',checkLogin);
router.get('/logout',function(req,res){
  req.session.user = null;
  req.flash('success','登出成功');
  return res.redirect('/');
});


router.get('/upload',checkLogin);
router.get('/upload',function(req,res){
  res.render('upload',{
    title:'檔案上傳',
    user:req.session.user,
    success:req.flash('success'),
    error:req.flash('error')
  });
});

router.post('/upload',checkLogin);
router.post('/upload',function(req,res){
  req.flash('success','檔案上傳成功');
  res.redirect('/upload');
});


router.get('/archive',function(req,res){
  Post.getArchive(function(err,posts){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    return res.render('archive',{
      title:'存檔',
      posts:posts,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});

// 所有標籤
router.get('/tags',function(req,res){
  Post.getTags(function(err,posts){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    return res.render('tags',{
      title:'標籤',
      posts:posts,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});

// 特定標籤
router.get('/tags/:tag',function(req,res){
  Post.getTag(req.params.tag,function(err,posts){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    return res.render('tag',{
      title:'TAG:' + req.params.tag,
      posts:posts,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});

// 友善連結
router.get('/links',function(req,res){
  return res.render('links',{
    title:'友善連結',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});



// 搜尋文章
router.get('/search',function(req,res){
  Post.search(req.query.keywork,function(err,posts){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    return res.render('search',{
      title:'SEARCH : ' + req.query.keywork,
      posts:posts,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});



// 查詢該用戶的所有文章
router.get('/u/:name',function(req,res){
  var page  = req.query.p ? parseInt(req.query.p) : 1;
  //檢查用戶是否存在
  User.get(req.params.name,function(err,user){
    if(!user){
      req.flash('error','用戶不存在!');
      return res.redirect('/');
    }

    // 查詢並傳回該用戶第page頁的10篇文章
    Post.getTen(user.name,page,function(err,posts,total){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      return res.render('user',{
        title:user.name,
        posts:posts,
        page:page,
        isFirstPage:(page - 1) ==0,
        isLastPage: ((page - 1) * 10 + posts.length) == total,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });

    //查詢並傳回該用戶的所有文章
    // Post.getAll(user.name,function(err,posts){
    //   if(err){
    //     req.flash('error',err);
    //     return res.redirect('/');
    //   }

    //   res.render('user',{
    //     title:user.name,
    //     posts:posts,
    //     user:req.session.user,
    //     success:req.flash('success').toString(),
    //     error:req.flash('error').toString()
    //   });
    // });
  })
});

// 進入到該文章
router.get('/u/:name/:day/:title',function(req,res){
  
  Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }

    return res.render('article',{
      title:req.params.title,
      post:post,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});

// 留言
router.post('/u/:name/:day/:title',function(req,res){
  var date = new Date();
  var time = date.getFullYear() +'-'+ (date.getMonth() - 1) +'-'
        + date.getDate() + " " + date.getHours() + ":"+
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());


  var md5 = crypto.createHash('md5');
  var email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex');
  var head = "http://www.gravatar.com/avatar/"+email_MD5 +"?s=48";

  var comment = {
    name : req.body.name,
    head:head,
    email : req.body.email,
    website : req.body.website,
    time : time,
    content : req.body.content
  };

  var newComment = new Comment(req.params.name,req.params.day,
                              req.params.title,comment);
  newComment.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('back');
    }
    req.flash('success','留言成功!');
    return res.redirect('back');
  })

});


// 編輯功能
router.get('/edit/:name/:day/:title',checkLogin);
router.get('/edit/:name/:day/:title',function(req,res){
  var currentUser = req.session.user;
  Post.edit(currentUser.name,req.params.day,req.params.title,function(err,post){
    if(err){
      req.flash('error',err);
      return res.redirect('back');
    }

    return res.render('edit',{
      title:'編輯',
      post:post,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});

router.post('/edit/:name/:day/:title',checkLogin);
router.post('/edit/:name/:day/:title',function(req,res){
  
  var currentUser = req.session.user;
  Post.update(currentUser.name,req.params.day,
              req.params.title,req.body.post,function(err){

    var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
    
    if(err){
      req.flash('error',err);
      return res.redirect(url); // 錯誤的話傳回文章頁面
    }

    req.flash('success','修改成功');
    return res.redirect(url);
  });
});



router.get('/remove/:name/:day/:title',checkLogin);
router.get('/remove/:name/:day/:title',function(req,res){
  var currentUser = req.session.user;
  Post.remove(currentUser.name,req.params.day,req.params.title,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('back');
    }

    req.flash('success','刪除成功!');
    return res.redirect('/');
  });
});

// 404 頁面
router.use(function(req,res){
  return res.render('404');
});

// 頁面權限控管
function checkLogin(req,res,next){
  if(!req.session.user){
    req.flash('error','未登入');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','已登入');
    res.redirect('back'); // 傳回之前的頁面
  }
  next();
}


module.exports = router;
