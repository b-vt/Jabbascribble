var child = require("child_process");
var path = require("path");
var fs = require("fs");

var {PluginMain} = require(path.normalize(path.join(__dirname, "../../src/shared/plugin.js")));
var Common = require(path.normalize(path.join(__dirname, "../../src/shared/common.js")));
var Config = require(path.normalize(path.join(__dirname, "../../src/shared/config.js")));
function TernPluginMain(app, pluginConf, appWindow) {
	PluginMain.call(this);
	var self = this;
	this.window = appWindow;
	this.app = app;
	this.server = null;
	//this.name = "ternjs";
	this.pluginName = "ternjs";
	this.pluginEventName = "plugin-event-ternjs";
	this.pluginConf = pluginConf;
	this.port = 49000;
	this.hasAddedProject = false;
	console.log(`-- TernPluginMain constructor --\nport:%i\n`,this.port,  pluginConf);
};

TernPluginMain.prototype = Object.create(PluginMain.prototype);
TernPluginMain.prototype.constructor = TernPluginMain;
TernPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	/*function fnRequestAddFiles(evt) {
		var post = { files: []};
		if (evt.request.files && evt.request.files.length > 0)
			for(var i = 0; i < evt.request.files.length; i++) {
				var file = evt.request.files[i];
				//file.text = OpenFile();
				var stat = fs.statSync(file);
				var buff = Buffer.alloc(stat.size+1);
				var fd = fs.openSync(file);
				var bytes = fs.readSync(fd, buff);
				post.files.push({name: file.name, text: file.text, type: "full"});
			}
		console.log("am I here?", post);
		return post;
	}*/
	function fnRequestCompletions(evt) {
		var p = {
			query: {
				type: "completions",
				expandWordForward: false,
				lineCharPositions: true,
				file: "#0",
				end: {ch: evt.request.ch, line: evt.request.line}//msg.text.length
			},
			files: [{
				name: evt.request.file,
				text: evt.request.text,
				type: "full"
			}]
		};
		
		if (!self.hasAddedProject && evt.request.files && evt.request.files.length > 1) {
			console.log("doing once..");
			for(var i = 0; i < evt.request.files.length; i++) {
				var file = evt.request.files[i];
				console.log("adding file", file);
				try {
					var stat = fs.statSync(file);
					var buff = Buffer.alloc(stat.size+1);
					var fd = fs.openSync(file);
					var bytes = fs.readSync(fd, buff);
					p.files.push({
						name: file, 
						text: buff.toString('utf8', 0, bytes), 
						type: "full"
					});
				}
				catch(e) {
					console.log("error reading project file:\n", e);
				}
			}
			self.hasAddedProject = true;
			console.log("done things", p);
		}
		return p;
	}
	var post = {};
	switch(event.request.type) {
		case "completes": {
			post = fnRequestCompletions(event);
			break;
		}
		/*case "add": {
			post = fnRequestAddFiles(event);
			break;
		}*/
		default: {
			break;
		}
	}
	Common.PostURL("127.0.0.1", self.port, JSON.stringify(post), function(data, err) {
		if (err) { // server is dead?
			console.log("-- TernPluginMain post error --");
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
	});
};
TernPluginMain.prototype.start = function(inc) {
	console.log(`-- TernPluginMain has started --`);
	var self = this;
	inc = inc || 0;
	this.port = this.port + inc;
	if (this.server != null) this.destroy();
	var nodePath = process.argv[0];
	var ternPath = path.normalize(path.join(__dirname, this.pluginConf.config.bin));//"/ternjs/bin/tern"));
	var cmd = [ternPath, "--port", this.port, "--no-port-file", "--ignore-stdin", "--verbose"];
	try {
		this.server = child.spawn(nodePath, cmd, {cwd: __dirname, env: {"ELECTRON_RUN_AS_NODE": 1}});
		this.server.stdout.on("data", function(data) {
			console.log("-------TernPluginMain stdout-------\n", 
						data.toString() || "", 
						"\n----------------------------");
		});
		this.server.stderr.on("data", function(data) {
			console.log("-------TernPluginMain stderr-------\n", 
						data.toString() || "", 
						"\n----------------------------");
			try {
				var msg = JSON.parse(data);
				switch(msg.code.toLowerCase()) {
					case "eaddrinuse": {
						console.log("EADDRINUSE, restarting server");
						//self.server.kill();
						self.start(1);
						break;
					}
					default: {
						break;
					}
				}
			}
			catch (e) {
				console.log(e);
			}
		});
		this.server.on("close", function(data) {
			console.log("-------TernPluginMain close-------\n", 
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
	}
	return this;
};
TernPluginMain.prototype.destroy = function() {
	console.log("-- TernPluginMain cleanup! --");
	if (this.server.exit)
		this.server.exit('SIGINT');
	else
		this.server.kill();
	this.server = null;
	return;
};
if (typeof module!=="undefined")
	module.exports = TernPluginMain;