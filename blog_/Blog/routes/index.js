require('../lib/db')
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Blog = mongoose.model('Blog');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.locals.username = req.session.name;
  res.locals.authenticated = req.session.logined;
  Blog.find(function(err,blogs,count){
  	for(var index in blogs){
  		var cat = blogs[index];
  		console.log(cat.Article);
  	}
    console.log(blogs.length);
  	res.render('index',{
	title:'Blog System',
	blog:blogs
  	});
  });
 // res.render('index', { title: 'Blog System' ,blogs : blogs});
});

module.exports = router;
