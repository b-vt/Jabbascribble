var fs = require("fs");
var Common = require("../src/shared/common.js");

(() => {

	var filePath = "E:\\Development\\Projects\\NodeJS\\Jabbascribble\\src\\main.js";
	var readLength = 393;
	var completes = { // now complete
		query: {
			type: "completions",
			file: filePath,
			end: 11// 
		},
		files: [{
			name: filePath,
			text: "Common.Quer",
			type: "full"
		}]
	}
	var addFiles = { // add files first
		query: {
			type: "files"
		},
		files: [{
			name: filePath,
			text: fs.readFileSync(filePath).toString('utf8'),
			type: "full"
		}]
	}
	//Common.QueryURL("http://127.0.0.1:49000", addFiles, function(data, error) {
		//if (error)
		Common.GetURL("http://127.0.0.1:49000", {}, function(data) {
			//if (error)
			console.log(data);
		});
	//});
})();