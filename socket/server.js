var net = require('net');
var child_process = require('child_process');

// create server
var server = net.createServer();

// listen 56789 port
server.listen(56789);

// create connection
server.on('connection',function(socket){

	var child = null;
	var cmdStr = '';


	// receive data
	socket.on('data',function(data){
		console.log(data.toString());
		// store command string
		cmdStr += data.toString();

		//檢查是否收到換行字元,代表接收完成
		// if(data.toString().indexOf('\n') == -1){
		// 	// 沒有換行字元,代表命令還沒全部傳送完成
		// 	return ; 
		// }
		// 收到的是json ,我們必須將其轉換成實體物件
		var cmd = JSON.parse(data);

		// 執行命令和帶入參數
		child = child_process.spawn(cmd.command,cmd.args);
		console.log(cmd);
		//接收命令的結果
		child.stdout.on('data',function(output){
			socket.write(output);
		});

		// 命令結束時,也中斷成式的連線
		child.on('end',function(){
			socket.destroy();
			child = null;
		});

	});

	// 連線中斷
	socket.on('end',function(){
		// 中斷外部程式
		if(child){
			child.kill();
		}
	})


});



