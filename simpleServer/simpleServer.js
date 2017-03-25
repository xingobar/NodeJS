var http = require('http');

// create a server
var server = http.createServer(function(req,res){

	res.writeHead(200,{'Content-Type':'text/plain'});
	res.end('Hello World\n');

});

server.listen(12345);
console.log('Server running ....');









