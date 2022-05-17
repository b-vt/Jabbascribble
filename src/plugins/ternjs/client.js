var fs = require("fs");
var Common = require("../../src/shared/common.js");
(() => {
	var filePath = "/home/brett/src/jabbascribble/src/plugins/ternjs/complete_test.js";//"/home/brett/src/jabbascribble/src/main.js";
	var lineText = fs.readFileSync(filePath).toString('utf8');//"console.l";
	var end = {line: 3, ch: 5};
	var post = {
		//query: { type: "files"}
		/*,
			types: true,
			depths: true,
			docs: false,
			filter: true,
			caseInsensitive: true,
			guess: true,
			sort: false,
			expandWordForward: true,
			omitObjectPrototype: false,
			includeKeywords: false,
			inLiteral: true,
			lineCharPositions: true
		*/
		query: {
			type: "completions",
			file: "#0",
			end: end//,
			//lineCharPositions: true
			
		},
		files: [
			{
				type: "full",
				name: filePath,
				text: lineText//,fs.readFileSync(filePath).toString('utf8')				
				//offset: end
			}
		]
	};
	
	var post2 = {
		query: {type: "files"},
		files: [{type: "full", name: filePath, text: lineText}]
	}
	//Common.PostURL("http://127.0.0.1:49000", post2, function(data, error) {
		//console.log(data, error);
		Common.PostURL("localhost", 49000, JSON.stringify(post), function(data, error) {
			console.log(data, error);
		});
	//});
})();

/*(() => {

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
})();*/