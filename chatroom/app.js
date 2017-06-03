var express = require('express');
var app = express();
var redis = require('./models/redis.js');

app.use(express.bodyParser());

app.post('/',function(req,res){
    if(!(req.body.owner && req.body.type && req.body.content)){
        if(req.body.type && (['male','female'].indexOf(req.body.type) === -1)){
            return res.json({code:0,msg:'type error'});
        }
        return res.json({code:0,msg:'資訊不完整'});
    }
    redis.throw(req.body,function(result){
        res.json(result);
    });
});

app.get('/',function(req,res){
    if(!req.body.user){
        return res.json({code:0,msg:'資訊不完整'});
    }
    if(req.query.type && ((['male','female']).indexOf(req.query.type) === -1)){
        return res.json({code:0,msg:'type error'});
    }
    redis.pick(res.query,function(result){
        res.json(result);
    });
});

app.listen(3000);

