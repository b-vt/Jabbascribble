var child = require("child_process");
var path = require("path");
var fs = require("fs");
var os = require("os");
var process = require("process");

var {PluginMain} = require(path.normalize(path.join(__dirname, "../../src/shared/plugin.js")));
var Common = require(path.normalize(path.join(__dirname, "../../src/shared/common.js")));
var Config = require(path.normalize(path.join(__dirname, "../../src/shared/config.js")));

function ServerProcessManager(client, server) {
	var self = this;
	this.server = server;
	this.client = client;
	this.files = new Map();
	server.manager = this;

	if (server.manager && server.manager.process) // if server process is already active
		server.manager.process.kill("SIGINT"); // kill and restart process
	this.process = child.spawn(server.runtime.bin, server.runtime.args, {});
	
	if (!this.process) return console.warn("unable to spawn %s language server process", server.name);
	this.write(client.makeServerRequest(client.makeInitializeRequest()));
	server.initialized = true; // server process has started
	console.warn("spawned process for %s language server", server.name);
	
	this.process.stdout.on("data", function(data) {
		var response = client.processServerResponse(data.toString('utf8', 0, data.length));
		if (!response) return console.warn("%s server did not respond", server.name);
		client.send(null, response);
	});
	this.process.stderr.on("data", function(data) {
		console.log("*** received stderr data:\n", data.toString('utf8', 0, data.length));
	});
	this.process.on("error", function(a, b, c) {
		console.warn("ServerProcessManager: %s process error: %s", server.name, a, b, c);
	});
	this.process.on("close", function(code, signal) {
		self.destroy();
		console.warn("ServerProcessManager: %s process has closed: \"%s\" (%s)", server.name, code, signal);
	});
	this.process.on("exit", function(code, signal) {
		self.destroy();
		console.warn("ServerProcessManager: %s process has exited: \"%s\" (%s)", server.name, code, signal);
	});
};
ServerProcessManager.prototype.destroy = function() {
	this.server.initialized = false;
	this.server.manager.process = null;
	if (this.files)
		this.files.clear();
	this.files = null;
};
ServerProcessManager.prototype.write = function(request) {
	if (this.process.exitCode) 
		return console.warn("tried to write to dead process");
	//	return ClientReplyError(request, "%s process has exited");
	try {
		console.log("writing: \n", request);
		if (typeof request !== "string")
			request = JSON.stringify(request);
		this.process.stdin.write(request);//MakeClientRequest(request));
	}
	catch(e) {
		return console.warn("ServerProcessManager.write failed:\n", e, request);
	}
};

function LSPClientPluginMain(app, pluginConf, appWindow) {
	PluginMain.call(this);
	var self = this;
	this.window = appWindow;
	this.app = app;
	this.pluginName = "lsp_client";
	this.pluginVersion = "1.0";
	this.pluginConf = pluginConf;
	//
	this.servers = new Map(); // "ccls"
	this.idsList = new Map(); // ["c", "cpp"] => "ccls"
	this.pluginConf.config.servers.forEach(function(item) {
		var args = Common.StringToArgs(path.normalize(item.bin.replace(/({\$HOME})/g, os.homedir()).replace(/({\$DIRNAME})/g, __dirname)));
		var bin = args.shift(1);
		item.config.languages.forEach(function(langId) { 
			self.idsList.set(langId, item.name);
		});
		self.servers.set(item.name, {
			initialized: false,
			name: item.name,
			runtime: {
				bin: bin,
				args: args
			},
			//init: {}
			manager: null
		});
	});
};
LSPClientPluginMain.prototype = Object.create(PluginMain.prototype);
LSPClientPluginMain.prototype.constructor = LSPClientPluginMain;
//
/* creates a valid LSP string from client request
*/
LSPClientPluginMain.prototype.makeServerRequest = function(lsp) {
	try {
		//lsp.jsonrpc = "2.0";
		// 
		data = JSON.stringify(lsp);
		return `Content-Length: ${data.length}\r\n\r\n${data}`;
	}
	catch(e) {
		console.warn("MakeClientRequest failed\n", lsp, e);
	}
	return null;
};
LSPClientPluginMain.prototype.processServerResponse = function(response) {
	try {
		/* server will reply with LSP format of:
			Content-Length: #\r\n\r\n{"jsonrpc":"2.0", ... }
		*/
		var split = response.split("\r\n\r\n");
		if (split.length > 0) {			
			var length = split[0];
			var body = split[1];
			var req = JSON.parse(body);
			return req;
		}
	}
	catch(e) {
		console.warn("ProcessServerResponse failed\n", response, e);
	}
	return null;
};
/* send plugin event to client with data object 
*/
LSPClientPluginMain.prototype.send = function(type, data) {
	this.window.webContents.send("main-plugin", {
		pluginName: this.pluginName,
		data: data,
		type: type // append string to event name, "plugin" becomes "plugin-all"
	});
	//console.warn("sent:\n", data);
};
LSPClientPluginMain.prototype.makeDocumentDidChangeRequest = function(request) {
	var textDocument = request.params.textDocument;
	var open = {
		jsonrpc: "2.0",
		method: "textDocument/didChange",
		params: {
			textDocument: {
				uri: textDocument.uri,
				text: textDocument.text,
				//languageId: textDocument.languageId, // todo: LSPClient should determine languageId from file uri
				version: 1
			}
			
		}
	};
	return open;
};
LSPClientPluginMain.prototype.makeDocumentDidOpenRequest = function(request) {
	var textDocument = request.params.textDocument;
	var open = {
		jsonrpc: "2.0",
		method: "textDocument/didOpen",
		params: {
			textDocument: {
				uri: textDocument.uri,
				text: textDocument.text,
				languageId: textDocument.languageId, // todo: LSPClient should determine languageId from file uri
				version: 1
			}
			
		}
	};
	return open;
};
LSPClientPluginMain.prototype.makeInitializeRequest = function(request) {
	var init = {
		jsonrpc: "2.0",
		method: "initialize",
		id: 0,
		params: {
			processID: process.pid,
			locale: Config.Lang,
			rootUri: `file:///`,
			//rootPath: `file:///${req.projectDir}`,
			initializationOptions: {},
			capabilities: {},
			trace: "off",
			//workspaceFolders: null,//[],//`file:///${req.projectDir}`],
			clientInfo: {
				name: this.pluginName,
				version: this.pluginVersion
			}
		}
	}
	return init;
};
LSPClientPluginMain.prototype.processClientRequest = function(event) {
	var self = this;
	//var req = event.request;
	var lsp = event.request;
	
	//console.log(event.request);
	
	//var server = this.servers.get();
	if (lsp && lsp.languageId) {
		var server = this.servers.get(this.idsList.get(lsp.languageId));
		if (!server) return console.warn("no language server available for '%s'", lsp.languageId);
		// renderer should always contain a languageId

		if (!server.initialized) { // the language server process needs to be started
			new ServerProcessManager(this, server); // do initialize things
			return;//return this.onRendererEvent(event);
		};
		// check if text document has been opened by server
		if (lsp.params && lsp.params.textDocument) {
			var textDocument = lsp.params.textDocument;
			var knownFile = server.manager.files.get(textDocument.uri);
			if (!knownFile) { // do document/didOpen request
				console.warn("%s client request made for unknown file", server.name);
				server.manager.files.set(textDocument.uri, textDocument);
				//console.log("making didOpen request to server\n", RequestDidOpen(lsp));
				server.manager.write(this.makeServerRequest(this.makeDocumentDidOpenRequest(lsp))); // do textDocument/didOpen request
				setTimeout(function() { // resend previous request
					server.manager.write(self.makeServerRequest(lsp));
				}, 500);
				return;
			}
			else if (knownFile.text != textDocument.text) { // do document/didChange request
				server.manager.files.set(textDocument.uri, textDocument);
				console.warn("updating opened file");
				server.manager.write(this.makeServerRequest(this.makeDocumentDidChangeRequest(lsp))); // hack because i'm not sending this request every save
				server.manager.write(this.makeServerRequest(this.makeDocumentDidOpenRequest(lsp)));//this.makeDocumentDidChangeRequest(lsp)));
				setTimeout(function() { // resend previous request
					server.manager.write(self.makeServerRequest(lsp));
				}, 500);
				return;
			};
		};
		server.manager.write(this.makeServerRequest(lsp)); // request doesn't need to be changed
		return;	
	}
	return console.warn("%s requested an unknown language server", event.pluginName, event.request);
};

// inherited
LSPClientPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	console.log(`-- LSPClientPluginMain has received event --\n`, event);
	this.processClientRequest(event);
	return;
};
LSPClientPluginMain.prototype.start = function(obj) {
	console.log(`-- LSPClientPluginMain has started --`);
	return this;
};
LSPClientPluginMain.prototype.destroy = function() {
	console.log("-- LSPClientPluginMain cleanup! --");
	return;
};

if (typeof module!=="undefined")
	module.exports = LSPClientPluginMain;