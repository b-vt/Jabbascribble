var path = require("path");
var electron = require("electron");
var {PluginMain} = require(path.normalize(path.join(__dirname, "../../src/shared/plugin.js")));
function ProjectPluginMain(app, conf, window) {
	PluginMain.call(this);
	this.pluginName = "projectview";
	this.pluginEventName = "plugin-event-projectview";
	this.app = app;
	this.conf = conf;
	this.window = window;
	// load project file from path
	/*electron.ipcMain.on('renderer-getprojectfile', function(event, data) {
		console.log("received getprojectfile: ", data);
		if (data.uuid == undefined) return console.trace("- renderer-getprojectfile request by unknown window -");
		var pf = [data.path];
		if (data.path == undefined) 
			pf = electron.dialog.showOpenDialogSync( { defaultPath: "./.scribble", properties: ['openFile', 'showHiddenFiles'] }) || [];
		if (!pf[0]) return console.log("- renderer-getprojectfile request canceled -");
		//var mypath = data.path.replace("~", os.homedir());
		//var dir = path.normalize(mypath);
		console.log("project file: %s", pf[0]);
		OpenFile(pf[0], data.encoding, data.uuid, function(file, content, windowId) {
			var web = electron.BrowserWindow.fromId(windowId);
			if (web) web.webContents.send('main-getprojectfile', { path: file, value: content });
		}, function(msg) {
			console.trace(msg);
		});
	});
	// save project file from renderer
	electron.ipcMain.on('renderer-saveprojectfile', function(event, data) {
		console.log("received saveprojectfile console: ", data);
		var web = electron.BrowserWindow.fromId(data.uuid);
		if (data.uuid == undefined || web == null) return console.trace("- renderer-saveprojectfile request by unknown window -");
		var pf = data.path;
		if (data.path == undefined) 
			pf = electron.dialog.showSaveDialogSync( { defaultPath: "./.scribble", properties: ['showHiddenFiles'] });
		if (pf == undefined) return console.log(`- renderer-saveprojectfile request was canceled`);
		console.log(pf);
		SaveFile(pf, undefined, JSON.stringify(data.project), undefined, data.uuid, function(file, tabId, windowId) {
			var web = electron.BrowserWindow.fromId(windowId);
			if (web) web.webContents.send("main-saveprojectfile", {});
		}, function(msg) {
			console.log("save project file error: ", msg);
		});

	});*/
	
}
ProjectPluginMain.prototype = Object.create(PluginMain.prototype);
ProjectPluginMain.prototype.constructor = ProjectPluginMain;

ProjectPluginMain.prototype.onRendererEvent = function(event) {
	var self = this;
	var data = event.request;
	switch(data.type) {
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
				if (web) web.webContents.send("main-plugin", {pluginName: self.pluginName, type: "save",});
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
			//var mypath = data.path.replace("~", os.homedir());
			//var dir = path.normalize(mypath);
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