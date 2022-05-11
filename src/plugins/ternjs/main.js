var child = require("child_process");
var path = require("path");

var {PluginMain} = require(path.normalize(path.join(__dirname, "../../src/shared/plugin.js")));
var Common = require(path.normalize(path.join(__dirname, "../../src/shared/common.js")));
var Config = require(path.normalize(path.join(__dirname, "../../src/shared/config.js")));
/*
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
		Common.QueryURL("http://127.0.0.1:49000", completes, function(data, error) {
			//if (error)
			console.log(data, error);
		});
	//});
})();
*/
function TernPluginMain(pluginConf, appWindow) {
	PluginMain.call(this);
	console.log(`-- TernPluginMain constructor --\n`, pluginConf);
	var self = this;
	this.window = appWindow;
	this.server = null;
	this.name = "ternjs";
	this.pluginConf = pluginConf;

	//this.onRendererEvent = function()
};
TernPluginMain.prototype = Object.create(PluginMain.prototype);
TernPluginMain.prototype.constructor = TernPluginMain;
TernPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	//console.log("-- TernPluginMain doTask --");
	(() => {
		var post = {
			query: {
				type: "completions",
				file: msg.name,
				end: {line: 3, ch: 3}//msg.text.length
			},
			files: [{
				name: msg.name,
				text: msg.text,
				type: "full"
			}]
		};
		console.log("-- TernPluginMain post --\n", post);
		Common.PostURL(`http://127.0.0.1:${self.pluginConf.port}`, post, function(data, err) {
			if (err) { // server is dead?
				console.log("-- TernPluginMain post error --");
				try {
					if (self.server !== null && self.server.killed == false)
						self.server.kill('SIGINT');
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
				//console.log(data);
				var msg = {
					name: "ternjs",
					data: data
				}
				self.window.webContents.send("plugin-", msg);
			}
		});
	})();
};
TernPluginMain.prototype.start = function() {
	var self = this;
	if (this.server != null) return;
	var nodePath = process.argv[0];
	if (Config.Debug == false) {
		console.log("ASD!@");
		//nodePath = path.normalize(path.join(process.cwd(), "jabbascribble.exe"));
	}
	var ternPath = path.normalize(path.join(__dirname, this.pluginConf.config.bin));//"/ternjs/bin/tern"));
	var cmd = [ternPath, "--port", this.pluginConf.config.port, "--no-port-file", "--ignore-stdin", "--verbose"];
	this.server = child.spawn(nodePath, cmd);
	
	this.server.stdout.on("data", function(data) {
		console.log("-------TernPluginMain stdout-------\n", data.toString(), "\n----------------------------");
	});
	this.server.stderr.on("data", function(data) {
		console.log("-------TernPluginMain stderr-------\n", data.toString(), "\n----------------------------");
	});
	this.server.on("close", function(data) {
		console.log("-------TernPluginMain close-------\n", data.toString(), "\n----------------------------");
		self.server = null;
	});
	return this;
};
TernPluginMain.prototype.destroy = function() {
	console.log("-- TernPluginMain cleanup! --");
	this.server.exit('SIGINT');
	return;
};
if (typeof module!=="undefined")
	module.exports = TernPluginMain;