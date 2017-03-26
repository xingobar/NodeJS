require('../lib/db');
var express = require('express');
var router = express.Router();
var  mongoose = require('mongoose');
var Blog = mongoose.model('Blog');
var Comment = mongoose.model('Comment');
router.get('/delete/:id',function(req,res,next){
	Blog.remove({_id : req.params.id},function(err){
		if(err){
			console.log("Fail to delete article");
		}else{
			console.log('Done');
		}
	});
	res.redirect('/users/profile');
});

router.post('/login',function(req,res,next){
	if((!req.body.user) || (!req.body.passwd)){
		res.redirect('/users/register');
		return;
	}
	req.session.name = req.body.user;
	req.session.passwd = req.body.passwd;
	req.session.logined = true;
	res.redirect('/');
});

router.post('/add',function(req,res,next){
	if(!req.session.name){
		res.redirect('/');
		return;
	}
	new Blog({
		Username : req.session.name,
		Article : req.body.Content,
		CreateDate: Date.now()
	}).save(function(err){
		if(err){
			console.log('Fail to save to DB.')
			console.log('[Error ] ' + err);
			return;
		}
	});
	console.log('Save to DB');
	res.redirect('/');
});

router.post('/update/:id',function(req,res,next){
	res.send('This is the update function');
});

router.post('/comment/:id',function(req,res,next){
	res.send('This is the comment function');
});

module.exports = router;



