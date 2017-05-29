var async = require('async');

async.waterfall([
	function(callback){
		callback(null,'one','two');
	},
	function(args1,args2,callback){
		console.log('args1 = > ' + args1);
		console.log('args2 = > ' + args2);
		callback(null,'three');
	},
	function(args3,callback){
		console.log('args3 = > ' + args3);
		callback(null,'done');
	}
],function(err,results){
	console.log('err => ' + err);
	console.log('results => ' + results);
});