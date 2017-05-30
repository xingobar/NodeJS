var express = require('express');
var router = express.Router();
var read = require('../web/read');

router.get('/:id',function(req,res,next){
    read.article(req.params.id,function(err,article){
        if(err){
            return next(err);
        }
        res.locals.article = article;
        res.render('article');
    });
});

module.exports = router;