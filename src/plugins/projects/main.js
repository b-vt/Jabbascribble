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
	this.spawnedProcess = null;
	this.aborted = false;
	process.on("SIGINT", function(data) {
		console.log("-------ProjectPluginMain process on SIGINT -------\n", 
						data,
						"\n----------------------------");
		if (self.spawnedProcess != null) {
			self.spawnedProcess.kill(1);
			self.spawnedProcess = null;
		}
		process.exit();
	});
	process.on("SIGTERM", function(data) {
		console.log("-------ProjectPluginMain process on SIGTERM -------\n", 
						data,
						"\n----------------------------");
		if (self.spawnedProcess != null) {
			self.spawnedProcess.kill(1);
			self.spawnedProcess = null;
		}
		process.exit();
	});
}
ProjectPluginMain.prototype = Object.create(PluginMain.prototype);
ProjectPluginMain.prototype.constructor = ProjectPluginMain;

ProjectPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	var data = event.request;
	switch(data.type) {
		case "spawn-kill": {
			if (this.spawnedProcess != null) {
				console.log("this thing exists!!!");
				this.spawnedProcess.kill(1);
				this.aborted = true;
			}
			else {
				console.log("nothing to kill");
			}
			break;
		}
		case "spawn": {
			function runCommand(cmd, printSpam) {
				try {
					if (self.spawnedProcess != null) {
						console.log("this thing exists!!!");
						self.spawnedProcess.kill(1);
					}
					var proc = child.exec(cmd, {cwd: process.cwd()});
					self.spawnedProcess = proc;
					
					
					
					var web = self.window;
					if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", cmd: cmd});
					// send some of stdout back to renderer
					//
					proc.on("close", function(data) {
						//data = data.toString('utf8', 0, data.length + 1);
						if (self.spawnedProcess == null) return;
						if (printSpam) {
							console.log("-------ProjectPluginMain process on close-------\n", 
										data,
										"\n----------------------------");
						}
						//proc.exit();
						self.spawnedProcess.kill(1);
						self.spawnedProcess = null;
						if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", data: self.aborted ? `( process forcefully aborted: ${data || 0} )`:`( process terminated: ${data} )`});
					});
					//
					proc.stdout.on("data", function(data) {
						if (self.spawnedProcess == null) return;
						data = data.toString('utf8', 0, data.length + 1);
						if (printSpam) {
							console.log("-------ProjectPluginMain stdout-------\n", 
										data,
										"\n----------------------------");
						}
						if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", data: data});
					});
					//
					proc.stderr.on("data", function(data) {
						if (self.spawnedProcess == null) return;
						data = data.toString('utf8', 0, data.length + 1);
						if (printSpam) {
							console.log("-------ProjectPluginMain stderr-------\n", 
										data,
										"\n----------------------------");
						}
						if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", data: `error: ${data}\nrun command: ${cmd}`});
					});
					//
					proc.stdout.on('err', function(data) {
						if (self.spawnedProcess == null) return;
						data = data.toString('utf8', 0, data.length + 1);
						if (printSpam) {
							console.log("-------ProjectPluginMain err-------\n", 
										data,
										"\n----------------------------");
						}
						if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", data: data, cmd: cmd});
					});
				}
				catch(e) {
					console.log(e);
				};
			};
			if (!data.projectFile.runCommands.length) {
				console.log("but the event was WORTHLESS!");
				break;
			}
			data.projectFile.runCommands.push(`export HOST_PROC=${process.argv[0]}`);
			var arr = data.projectFile.runCommands;
			var arr = Common.ArrayMoveIndex(arr, arr.length - 1, 0);
			//runCommand(data.projectFile.runCommands.join(" && "), true);
			runCommand(arr.join(" && "), true);
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