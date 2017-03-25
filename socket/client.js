var net = require('net');

// create object
var cmd ={
	command :process.argv[2],
	args : []
};

// 取得所有命令列參數
for(var i = 3 ; i < process.argv.length ; i++){
	cmd.args.push(process.argv[i]);
}

// 建立一個socket 連線
var socket = new net.Socket();

socket.connect(56789,'localhost',function(){
	console.log('Connected....');
	console.log(cmd);
	// 將命令列轉成json
	socket.write(JSON.stringify(cmd));

	// 接收結果
	socket.on('data',function(data){
		console.log(data.toString());
	});

	// 連線中斷
	socket.on('end',function(){
		// 結束程序
		process.exit();
	});
});

