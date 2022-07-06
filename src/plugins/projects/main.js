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
	this.aborted = false;
	//this.spawnedProcess = null;//[];
	this.spawnedProcessList = [];
	
	process.on("SIGINT", function(data) {
		console.log("-------ProjectPluginMain process on SIGINT -------\n", 
					data,
					"\n----------------------------");
		process.exit();
	});
	process.on("SIGTERM", function(data) {
		console.log("-------ProjectPluginMain process on SIGTERM -------\n", 
					data,
					"\n----------------------------");
		process.exit();
	});
}
ProjectPluginMain.prototype = Object.create(PluginMain.prototype);
ProjectPluginMain.prototype.constructor = ProjectPluginMain;

ProjectPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	var data = event.request;
	function slapData(data, msg, printSpam) {
		console.log(typeof data);
		data = data || 0;
		if (typeof data != "number")
			data = data.toString('utf8', 0, data.length + 1);
		if (printSpam)
			console.log(`-------ProjectPluginMain ${msg}-------\n`, 
						data,
						"\n----------------------------");
		return data;
	}
	function cleanChildren(aborted) {
		self.aborted = aborted || false;
		for(var i = 0; i < self.spawnedProcessList.length; i++) {
			var sp = self.spawnedProcessList[i];
			if (sp != null) {
				sp.kill('SIGTERM'); // todo which
				sp.kill('SIGINT');
				self.spawnedProcessList[i] = null;
			}
		};
		self.spawnedProcessList = [];
	};
	function runCommand(cmd, printSpam, fnOnExit) {
		try {
			//var proc = child.exec(cmd, {cwd: process.cwd(), detached: true});
			//var env = Object.create(process.env);
			//env.HOST_PROC = process.argv[0];
			var mix = cmd.split(" ");
			var rc = mix[0];
			switch (rc) {
				case "$ELECTRON": {
					rc = process.argv[0];
					break;
				};
				default: 
					break;
			};
			var args = Common.ArrayRemoveIndex(mix, 0);
			var proc = child.spawn(rc, args, {cwd: process.cwd()});//HOST_PROC: process.argv[0]}});
			self.spawnedProcessList[self.spawnedProcessList.length] = proc;
			//self.spawnedProcess = proc;
			var web = self.window;
			if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", cmd: cmd});
			// send some of stdout back to renderer
			//
			proc.on("close", function(data) {
				data = slapData(data, "process on close", true);
				if (fnOnExit != undefined && fnOnExit != null)
					fnOnExit();
				if (web /*&& web.webContents*/) web.webContents.send("main-plugin", {
					pluginName: self.pluginName, 
					type: "output", 
					data: self.aborted == true ? `( ${cmd} forcefully aborted: ${data || 0} )`:`( ${cmd} terminated: ${data} )`
				});
				console.log("OMFGG %i", self.spawnedProcessList.length);
				if (self.spawnedProcessList.length == 0) {
					console.log("RESET");
					self.aborted = false; // reset
				};
			});
			//
			proc.stdout.on("data", function(data) {
				data = slapData(data, "stdout", true);
				if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", data: data});
			});
			//
			proc.stderr.on("data", function(data) {
				data = slapData(data, "stderr", true);
				if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", data: `error: ${data}\nrun command: ${cmd}`});
			});
			//
			proc.stdout.on('err', function(data) {
				data = slapData(data, "stdout error", true);
				if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "output", data: data, cmd: cmd});
			});
		}
		catch(e) {
			console.log(e);
		};
	};
	
	switch(data.type) {
		case "spawn-kill": {
			console.log("we need to kill this thing RITE NIOW");
			cleanChildren(true);
			break;
		}
		case "spawn": {
			
			if (!data.projectFile.runCommands.length) {
				console.log("but the event was WORTHLESS!");
				break;
			}
			var lastIndex = 0;
			function spawnNext() {
				if (lastIndex+1 <= data.projectFile.runCommands.length) {
					runCommand(data.projectFile.runCommands[lastIndex], true, spawnNext);
					lastIndex++;
				}
			};
			spawnNext();
			//}//);
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