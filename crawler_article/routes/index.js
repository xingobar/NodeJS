var express = require('express');
var router = express.Router();
var read = require('../web/read');
/* GET home page. */
router.get('/', function(req, res, next) {

  read.articleListByClassId(0,0,20,function(err,list){
    if(err){
      return next(err);
    }
    res.locals.articleList = list;
    res.render('index');
  });
});

module.exports = router;
