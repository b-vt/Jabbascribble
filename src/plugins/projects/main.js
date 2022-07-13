var path = require("path");
var electron = require("electron");
var child = require("child_process");
var {PluginMain} = require(path.normalize(path.join(__dirname, "../../src/shared/plugin.js")));
var Common = require(path.normalize(path.join(__dirname, "../../src/shared/common.js")));
var Config = require(path.normalize(path.join(__dirname, "../../src/shared/config.js")));
function ProjectPluginMain(app, conf, window) {
	PluginMain.call(this);
	var self = this;
	this.pluginName = "projectview";
	this.pluginEventName = "plugin-event-projectview";
	this.app = app;
	this.conf = conf;
	this.window = window;
	this.spawnedProcessList = [];
	this.aborted = false;
	
	process.on("SIGINT", function(data) { // todo cleanup?
		console.log("-------ProjectPluginMain process on SIGINT -------\n", 
					data,
					"\n----------------------------");
		self.killChildren();
		process.exit();
	});
};
ProjectPluginMain.prototype = Object.create(PluginMain.prototype);
ProjectPluginMain.prototype.constructor = ProjectPluginMain;

ProjectPluginMain.prototype.destroy	= function() {
	this.killChildren();
};
ProjectPluginMain.prototype.killChildren = function() {
	this.aborted = true;
	for(var i = 0; i < this.spawnedProcessList.length; i++) {
		var p = this.spawnedProcessList[i];
		p.kill('SIGINT');
		this.spawnedProcessList[i] = null;
	};
	this.spawnedProcessList = [];
	
};
ProjectPluginMain.prototype.runCommands = function(cmds) {
	var self = this;
	function slapData(data, msg, printSpam) {
		if (data == null) return null;
		if (typeof data != "number")
			data = data.toString('utf8', 0, data.length + 1);
		if (printSpam)
			console.log(`-------ProjectPluginMain ${msg}-------\n`, 
						data,
						"\n----------------------------");
		return data;
	}
	
	var env = process.env;
	var cwd = process.cwd();
	if (this.window) this.window.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", cmd: cmds});
	
	// runCmds = ProjectFile.runCommands array, current runCommands index
	function nextCommand(runCmds, i) {
		if (i >= runCmds.length) return;
		var args = runCmds[i].split(" ");
		var cmd = args[0];
		args.splice(0, 1);
		cmd = cmd.replace("electron", process.argv[0]);
		if (cmd == "cd") {
			cwd = path.resolve(args.join(""));
			return nextCommand(runCmds, i+1);
		}
		// set spawn callback scope
		((_cmds, _cmd, _args, _index) => { 
			//console.log("spawned process: %i\n%s\n%o\n%s", _index, _cmd, _args, _cmds);
			try {
				var proc = child.spawn(_cmd, _args, { cwd: cwd});
				if (proc) {
					self.spawnedProcessList[self.spawnedProcessList.length] = proc;
					//var procMap = `${proc.pid}`;
					proc.on("close", function(data) {
						try {
							var dats = slapData(data, "proc on close");
							dats = data != null ? `: ${dats}` : "";
							var terminateMessage = `( ${cmd} terminated )`;
							if (_index == _cmds.length - 1)
								terminateMessage = self.aborted ? `( ${cmd} forcefully aborted${dats} )`:`( ${cmd} terminated${dats} )`;
							if (self.window && !self.window.isDestroyed()) self.window.webContents.send("main-plugin", {
								pluginName: self.pluginName, 
								type: "output", 
								data: terminateMessage
							});
							nextCommand(_cmds, _index+1);
						}
						catch (e) { // the window was closed
							console.log("something bad has happened", e);
						};
					});
					//
					proc.stdout.on("data", function(data) {
						var dats = slapData(data, "stdOUT on data", true);
						if (self.window) self.window.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", data: dats});
					});
					//
					proc.stdout.on('err', function(data) {
						var dats = slapData(data, "stdOUT on error", true);
						if (self.window) self.window.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", isError: true, data: dats});
					});
					//
					proc.stderr.on("data", function(data) {
						var dats = slapData(data, "stdERR on data", true);
						if (self.window) self.window.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", isError: true, data: dats});
					});
					proc.on("spawn", function(data) {
						console.log("tracking new spawned process", data);
						self.spawnedProcessList[_index] = proc;
					});
					// on exit occurs before close, and stdio may still be active
					proc.on("exit", function(data) {
						console.log("exit?");
					});
					proc.on("error", function(data) {
						console.log("spawn process error");
						var dats = slapData(data, "proc error", true);
						if (self.window) 
							self.window.webContents.send("main-plugin", {
								pluginName: self.pluginName, 
								type: "output", 
								isError: true, 
								data: `command ${_cmd} failed: ${data}`
						});
					});
				};
			}
			catch (e) {
				console.log("spawn process error");
				if (self.window) 
					self.window.webContents.send("main-plugin", {
						pluginName: self.pluginName, 
						type: "output", 
						isError: true, 
						data: `command ${_cmd} failed`
					});
			}
		})(cmds, cmd, args, i);
	};
	
	nextCommand(cmds, 0);
};

ProjectPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	var data = event.request;
	
	switch(data.type) {
		case "spawn-kill": {
			console.log("killing all child processes");
			this.killChildren();
			break;
		}
		case "spawn": {
			console.log("spawning a child process");
			this.killChildren();
			this.aborted = false;
			this.runCommands(data.projectFile.runCommands);
			break;
		}
		case "save": {
			console.log("received plugin projectview save: ", event);
			var web = electron.BrowserWindow.fromId(event.uuid);
			if (event.uuid == undefined || web == null) return console.trace("- plugin projectview save request by unknown window -");
			var pf = data.path;
			if (data.path == undefined) 
				pf = electron.dialog.showSaveDialogSync( { defaultPath: "./.scribble", properties: ['showHiddenFiles'] });
			if (pf == undefined) return console.log(`- plugin projectview save request was canceled`);
			console.log(pf);
			this.app.saveFile(pf, undefined, JSON.stringify(data.project), undefined, event.uuid, function(file, tabId, windowId) {
				var web = electron.BrowserWindow.fromId(windowId);
				if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "save"});
			}, function(msg) {
				console.log("save project file error: ", msg);
			});
			break;
		}
		case "open": 
		default: {
			console.log("received plugin projectview open: ", event);
			if (event.uuid == undefined) return console.trace("- plugin projectview open request by unknown window -");
			var pf = [data.path];
			if (data.path == undefined) 
				pf = electron.dialog.showOpenDialogSync( { defaultPath: "./.scribble", properties: ['openFile', 'showHiddenFiles'] }) || [];
			if (!pf[0]) return console.log("- main projectview open request canceled -");
			console.log("project file: %s", pf[0]);
			this.app.openFile(pf[0], data.encoding, event.uuid, function(file, content, windowId) {
				var web = electron.BrowserWindow.fromId(windowId);
				if (web) web.webContents.send("main-plugin", { pluginName: self.pluginName, type: "open",  path: file, value: content });
			}, function(msg) {
				console.trace(msg);
			});
			break;
		}
	};
};
if (typeof module!=="undefined") module.exports = ProjectPluginMain;