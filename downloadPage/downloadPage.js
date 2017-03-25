var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');

// 取得帶入的網址
var targetURL = process.argv[2] || null;

if(!targetURL){
	//沒有代入參數
	console.log('請輸入網址!');
	process.ext();
}

// 解析 url
var urlObj = url.parse(targetURL);

// 建立連線
var req = http.request({
	hostname:urlObj.hostname,
	path :urlObj.path,
	method:'GET'
},function(res){
	// 解析網址路徑並取得檔案名稱
	var filename = path.basename(urlObj.path);

	// 檢查檔案是否在本機端
	fs.exists(filename,function(exists){
		if(exists){
			//如果已經存在,刪除並重新下載
			fs.unlink(filename,function(err){
				saveFile();
			})
			return;
		}

		// 儲存下載檔案
		saveFile();
	});
	function saveFile(){
		//收到資料
		res.on('data',function(chunck){
			fs.appendFileSync(filename,chunck);
		})

		// 完成並結束程式
		res.on('end',function(chunck){
			process.exit();
		})
	}
});
req.end();





