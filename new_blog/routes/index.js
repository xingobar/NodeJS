var express = require('express');
var crypto = require('crypto');
var flash = require('connect-flash');
var router = express.Router();
User =  require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '主頁' });
});

router.get('/register',function(req,res){
  res.render('register',{title:'註冊'});
});

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
    email : req.body.email
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

router.get('/login',function(req,res){
  res.render('login',{title:'登入'});
});

router.post('/login',function(req,res){

});

router.get('/post',function(req,res){
  res.render('post',{'title':'發表'});
});

router.post('/post',function(req,res){

});

router.get('/logout',function(req,res){

});

module.exports = router;
