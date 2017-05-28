var express = require('express');
var crypto = require('crypto');
var flash = require('connect-flash');
var router = express.Router();
User =  require('../models/user');
Post  = require('../models/post');

/* GET home page. */
router.get('/', function(req, res, next) {
  Post.getAll(null,function(err,posts){
    
    if(err){
      posts = [];
    }

    res.render('index', { 
      title: '主頁' ,
      user:req.session.user,
      posts:posts,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
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
    erorr:req.flash('error')
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
        return req.redirect('/login');
      }

      // 檢查密碼是否一致
      if(user.password != password){
        res.flash('error','密碼錯誤');
        return req.redirect('/login');
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
  post =  new Post(currentUser.name,req.body.title,req.body.post);
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

// 查詢該用戶的所有文章
router.get('/u/:name',function(req,res){
  //檢查用戶是否存在
  User.get(req.params.name,function(err,user){
    if(!user){
      req.flash('error','用戶不存在!');
      return res.redirect('/');
    }

    //查詢並傳回該用戶的所有文章
    Post.getAll(user.name,function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }

      res.render('user',{
        title:user.name,
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });
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
