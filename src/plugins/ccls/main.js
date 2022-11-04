var child = require("child_process");
var path = require("path");
var fs = require("fs");

var {PluginMain} = require(path.normalize(path.join(__dirname, "../../src/shared/plugin.js")));
var Common = require(path.normalize(path.join(__dirname, "../../src/shared/common.js")));
var Config = require(path.normalize(path.join(__dirname, "../../src/shared/config.js")));
function CCLSPluginMain(app, pluginConf, appWindow) {
	PluginMain.call(this);
	var self = this;
	this.window = appWindow;
	this.app = app;
	this.server = null;
	this.pluginName = "ccls_client";
	this.pluginConf = pluginConf;
	this.sendID = 0;
	//this.port = Math.floor(Math.random() * 40000) + 20000;
	//console.log(`-- CCLSPluginMain constructor --\nport:%i\n`,this.port,  pluginConf);
	
};

CCLSPluginMain.prototype = Object.create(PluginMain.prototype);
CCLSPluginMain.prototype.constructor = CCLSPluginMain;
CCLSPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	
	console.log(`-- CCLSPluginMain has received event --`, event);
	/*uri: event.uri, 
	ch: event.ch, 
	line: event.line, 
	text: event.text*/
	function fnCCLSGetMethod(event) {
		switch (event.type) {
			case "completes": {
				sendID = parseInt(sendID++);
				return "textDocument/completion";
			}
			
			default: {
				return "";
			}
		};
	};
	function fnCCLSMakeRequest(event) {
		
		switch (event.type) {
			case "completes": {
				sendID = parseInt(sendID++);
				return "textDocument/completion";
			}
			
			default: {
				return "";
			}
		};
		
		var req = {
			jsonrpc: "2.0",
			method: fnCCLSGetMethod(event),
			params: {}
		}
		if (!noId) req.id = parseInt(sendID++);
		
		
		if (self.server == null) {
			
		};
	};
	
	
	
	/*switch(event.request.type) {
		case "completes": {
			post = fnRequestCompletions(event);
			break;
		}
		case "init": {
			post = fnRequestAddFiles(event);
			break;
		}
		default: {
			break;
		}
	}
	Common.PostURL("127.0.0.1", self.port, JSON.stringify(post), function(data, err) {
		if (err) { // server is dead?
			console.log("-- CCLSPluginMain post error --");
			try {
				if (self.server !== null && self.server.killed == false) {
					self.server.kill('SIGINT');
				}
				else {
					self.server = null;
					self.start(); // try restarting it
				}
			}
			catch (e) {
				console.trace(err, e);
			}
		}
		else {
			self.window.webContents.send("main-plugin", { pluginName: self.pluginName, type: "completions", data: data });
		}
	});*/
};
CCLSPluginMain.prototype.start = function(inc) {
	console.log(`-- CCLSPluginMain has started --`);
	
	
	/*var self = this;
	inc = inc || 0;
	this.port = Math.floor(Math.random() * 40000) + 20000;
	if (this.server != null) this.destroy();
	var nodePath = process.argv[0];
	var ternPath = path.normalize(path.join(__dirname, this.pluginConf.config.bin));//"/ternjs/bin/tern"));
	var cmd = [ternPath, "--port", this.port, "--no-port-file", "--ignore-stdin", "--verbose"];
	
	function parseData(data) {
		// todo
		//data = "todo parseData to stdout...";
		data = data.toString('utf8', 0, data.length + 1);
		if (data.length > 100) 
			data = data.slice(0, 300);
		return data;
	}
	try {
		this.server = child.spawn(nodePath, cmd, {cwd: __dirname});
		this.server.stdout.on("data", function(data) {
			console.log("-------CCLSPluginMain stdout-------\n", 
						parseData(data), 
						"\n----------------------------");
		});
		this.server.stderr.on("data", function(data) {
			console.log("-------CCLSPluginMain stderr-------\n", 
						parseData(data), 
						"\n----------------------------");
		});
		this.server.on("close", function(data) {
			console.log("-------CCLSPluginMain close-------\n", 
						data,
						"\n----------------------------");
			self.server = null;
		});
		this.server.stdout.on('err', function(err) {
			console.log(err);
		});
	}
	catch(e) {
		console.log(e);
	}*/
	return this;
};
CCLSPluginMain.prototype.destroy = function() {
	console.log("-- CCLSPluginMain cleanup! --");
	/*if (this.server.exit)
		this.server.exit('SIGINT');
	else
		this.server.kill();
	this.server = null;*/
	return;
};
if (typeof module!=="undefined")
	module.exports = CCLSPluginMain;