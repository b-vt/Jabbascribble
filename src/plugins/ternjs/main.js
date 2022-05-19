var child = require("child_process");
var path = require("path");

var {PluginMain} = require(path.normalize(path.join(__dirname, "../../src/shared/plugin.js")));
var Common = require(path.normalize(path.join(__dirname, "../../src/shared/common.js")));
var Config = require(path.normalize(path.join(__dirname, "../../src/shared/config.js")));
function TernPluginMain(pluginConf, appWindow) {
	PluginMain.call(this);
	var self = this;
	this.window = appWindow;
	this.server = null;
	this.name = "ternjs";
	this.pluginConf = pluginConf;

	console.log(`-- TernPluginMain constructor --\n`, pluginConf);

};
TernPluginMain.prototype = Object.create(PluginMain.prototype);
TernPluginMain.prototype.constructor = TernPluginMain;
TernPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	function fnRequestAddFiles(evt) {
		var post = { files: []};
		for(var i = 0; i < evt.request.files.length; i++) {
			var file = evt.request.files[i];
			post.files.push({name: file.name, text: file.text, type: "full"});
		}
		return post;
	}
	function fnRequestCompletions(evt) {
		return {
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
	}
	var post = {};
	switch(event.request.type) {
		case "completes": {
			post = fnRequestCompletions(event);
			break;
		}
		case "add": {
			post = fnRequestAddFiles(evt);
			break;
		}
		default: {
			break;
		}
	}
	Common.PostURL("127.0.0.1", self.pluginConf.config.port, JSON.stringify(post), function(data, err) {
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
			self.window.webContents.send("main-plugin", { name: self.name,  data: data });
		}
	});
	//console.log("-- TernPluginMain doTask --\n", event);
	/*((_event) => {
		var post = {
			query: {
				type: "completions",
				file: "#0",
				end: {ch: _event.request.ch, line: _event.request.line}//msg.text.length
			},
			files: [{
				name: _event.request.file,
				text: _event.request.text,
				type: "full"
			}]
		};
		console.log("-- TernPluginMain post --\n", post);
		Common.PostURL("127.0.0.1", self.pluginConf.config.port, JSON.stringify(post), function(data, err) {
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
				self.window.webContents.send("main-plugin", { name: self.name,  data: data });
			}
		});
	})(event);*/
};
TernPluginMain.prototype.start = function() {
	console.log(`-- TernPluginMain has started --`);
	var self = this;
	if (this.server != null) this.destroy();
	var nodePath = process.argv[0];
	var ternPath = path.normalize(path.join(__dirname, this.pluginConf.config.bin));//"/ternjs/bin/tern"));
	console.log(ternPath);
	var cmd = [ternPath, "--port", this.pluginConf.config.port, "--no-port-file", "--ignore-stdin", "--verbose"];
	var env = process.env;
	env.ELECTRON_RUN_AS_NODE = 1;
	this.server = child.spawn(nodePath, cmd, {cwd: __dirname, env: env});
	this.server.stdout.on("data", function(data) {
		console.log("-------TernPluginMain stdout-------\n", data.toString() || "", "\n----------------------------");
	});
	this.server.stderr.on("data", function(data) {
		console.log("-------TernPluginMain stderr-------\n", data.toString() || "", "\n----------------------------");
	});
	this.server.on("close", function(data) {
		console.log("-------TernPluginMain close-------\n", data, "\n----------------------------");
		self.server = null;
	});
	return this;
};
TernPluginMain.prototype.destroy = function() {
	console.log("-- TernPluginMain cleanup! --");
	this.server.exit('SIGINT');
	this.server = null;
	return;
};
if (typeof module!=="undefined")
	module.exports = TernPluginMain;