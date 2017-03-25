var fs = require('fs');
var url = require('url');
var path = require('path');
var http = require('http');

// create a server
server = http.createServer(function(req,res){

	// get req取得客戶端要求的檔案名稱
	var filename = url.parse(req.url).pathname;

	// 找尋該檔案
	var filepath = path.join(__dirname,filename);

	//檢查檔案是否存在
	fs.exists(filepath,function(exists){

		if(!exists){
			res.writeHead(404,{'Content-Type':'text/plain'});
			res.end('Not Found\n');
			return;
		}
		// 讀取檔案內容
		fs.readFile(filepath,function(err,content){
			//回傳檔案內容
			res.writeHead(200,{'Content-Type':'text/plain'});
			res.end(content);
		});
	});

}).listen(12345);

console.log('Server running....');




