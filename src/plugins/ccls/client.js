var CHILD = require("child_process");
var PROCESS = require("process");

(() => {
	var proc = CHILD.spawn("ccls", [], {cwd: PROCESS.cwd()});
	proc.stderr.on("data", function(data) {
		console.log("stderr", data.toString('utf8', 0, data.length + 1));
	});
	proc.stdout.on("data", function(data) {
		console.log("stdout", data.toString('utf8', 0, data.length + 1));
	});
	var msg = JSON.stringify({jsonrpc: 2.0, method: "i-am-error", "id": 0});
	proc.stdin.write(`Content-Length: ${msg.length}\r\n\r\n${msg}`);
})();