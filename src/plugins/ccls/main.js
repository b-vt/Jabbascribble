var child = require("child_process");
var path = require("path");
var fs = require("fs");
var os = require("os");
var process = require("process");

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
	this.pluginVersion = "1.0"
	this.pluginConf = pluginConf;
	this.sendID = 0;
	console.log(this.pluginConf);
	this.binDirectory =this.pluginConf.config.bin.replace(/({\$HOME})/g, os.homedir());
	this.openFiles = []; // track didOpen uri's
	//this.port = Math.floor(Math.random() * 40000) + 20000;
	//console.log(`-- CCLSPluginMain constructor --\nport:%i\n`,this.port,  pluginConf);
};

CCLSPluginMain.prototype = Object.create(PluginMain.prototype);
CCLSPluginMain.prototype.constructor = CCLSPluginMain;
CCLSPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	
	console.log(`-- CCLSPluginMain has received event --`, event);

	
	function fnCCLSSpawnProcess() {
		
		console.log("spawned server..");
		if (self.server) {
			self.server.kill('SIGINT');
		}
		self.server = child.spawn(self.binDirectory, [], {});
		self.server.stderr.on("data", function(data) {
			console.log("stderr", data.toString('utf8', 0, data.length + 1));
			// send error event to renderer?
			/*self.window.webContents.send("main-plugin", { 
				pluginName: self.pluginName, 
				type: "error", 
				data: data 
			});*/
		});
		self.server.stdout.on("data", function(data) {
			//console.log("stdout", data.toString('utf8', 0, data.length + 1));
			// send request to renderer?
			self.window.webContents.send("main-plugin", { 
				pluginName: self.pluginName, 
				type: "completions", 
				data: data.toString('utf8', 0, data.length + 1)//data 
			});
		});
		event.request.method = "init";
		self.server.stdin.write(fnCCLSMakeRequest(event.request));
	};
	
	function fnCCLSMakeRequest(req) {
		try {
			var request = {jsonrpc: "2.0", method: "", params: {}};
			switch (req.method) {
				case "completes": {
					request.method = "textDocument/completion";
					request.id = `${(self.sendID++)}`;
					request.params = {
						textDocument: {
							uri: `file://${req.uri}`
						},
						position: {
							line: req.line,
							character: req.ch
						}
					};
					break;
				}
				case "init": {
					request.method = "initialize";
					request.params = {
						processID: process.pid,
						locale: Config.Lang,
						rootUri: `file://${req.projectDir}`,
						initializationOptions: {},
						capabilities: {},
						trace: "off",
						workspaceFolders: [],
						clientInfo: {
							name: self.pluginName,
							version: self.pluginVersion
						}

					};
					request.id = `${(self.sendID++)}`;
					break;
				}
				case "open": {
					request.method = "textDocument/didOpen";
					request.params.textDocument = {};
					request.params.textDocument.uri = `file://${req.uri}`;
					request.params.textDocument.version = 1;
					if (self.openFiles[req.uri]) {
						request.params.textDocument.version = self.openFiles[req.uri].version;
					}
					var langID = path.extname(req.uri);
					// get language ID from project file
					if (req.projectLanguage && req.projectLanguage.length > 0)
						langID = req.projectLanguage;
					// otherwise use the filename to determine language ID
					if (langID == ".c" || langID == ".h")
						langID = "c";
					else if (langID == ".C" || langID == ".cc" || langID == ".hh" ||
							langID == ".cpp" || langID == ".hpp")
						langID = "cpp";
					else if (langID == ".M" || langID == ".m" || langID == ".mm")
						langID = "objective-c";
					request.params.textDocument.languageId = langID;
					request.params.textDocument.text = req.text;
					break;
				}
				default: {
					return "\n";
				}
			};
			var msg = JSON.stringify(request);
			var m = `Content-Length: ${msg.length}\r\n\r\n${msg}`;
			console.log("message: ", m);
			return m;
		}
		catch (e) {
			console.warn("JSON stringify failed:", e);
			return "\n";
		}
	};

	if (self.server == null) { // start and initialize ccls process
		fnCCLSSpawnProcess();
	}
	if (!self.openFiles[event.request.uri]) {
		console.log("opening file..");
		event.request.method = "open";
		self.server.stdin.write(fnCCLSMakeRequest(event.request));
	}
	event.request.method = "completes";
	self.server.stdin.write(fnCCLSMakeRequest(event.request));
	
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