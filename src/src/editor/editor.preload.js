// renderer script
var electron = require("electron");
var {contextBridge} = require("electron");
var dialog = require("electron").dialog;
var proc = require("process");
var fs = require("fs");
var path = require("path");

var {SerializeObject, CloneObjectProperties} = require("../shared/common.js");
var {Config} = require("../shared/config.js");

var API_Blob = { // do not modify, contains persistent data to exchange between main and this renderer
	ready: false, // todo: it should no longer be possible for ApiInit to be called after other preload functions
	uuid: 0 // renderer UUID created by main thread
};

contextBridge.exposeInMainWorld('api', {
	persist:			() => { return API_Blob; },
	save: 					ApiSaveFile,//(data) 		=> ApiSaveFile(data),
	plugin:					ApiPlugin,//(data) 		=> ApiPlugin(data),
	open: 					ApiOpenFile,//(data) 		=> ApiOpenFile(data),
	toggleConsole:			ApiToggleConsole,//() 			=> ApiToggleConsole(),
	openFileLocation: 		ApiOpenFileLocation,//(data) 		=> ApiOpenFileLocation(data),
	getProjectFile:			ApiGetProjectFile,
	saveProjectFile:		ApiSaveProjectFile,
	inheritJavascript:		ApiInheritJavascript,
	gc: 					ApiGC,//()			=> ApiGC(),
	quit:					ApiQuit
});


function IPCSend(msgType, data) {
	var obj = {uuid: API_Blob.uuid}; // uuid needs to be a part of the data or this message will be lost in main thread
	if (data!== undefined && data!== null)
		obj = Object.assign(obj, data);
	electron.ipcRenderer.send(msgType, obj);
};


/* ApiInit must be called before any of the other functions work */
function ApiInit() {
	console.log("preload: ApiInit");
	electron.ipcRenderer.on('main-init', function(event, data) {
		console.log("preload: received main-init with uuid: ", data.uuid);
		API_Blob.uuid = data.uuid;
		API_Blob.ready = 1;
	});
	electron.ipcRenderer.on('main-open', function(event, data) {
		console.log("preload: received main-open: ", data);
		window.dispatchEvent(new CustomEvent("app-open", {detail: {path: data.path, value: data.value}}));
	});
	electron.ipcRenderer.on('main-tab-save', function(event, data) {
		console.log("preload: received main-tab-save: ", data);
		window.dispatchEvent(new CustomEvent("app-tab-save", {detail: data}));
	});
	electron.ipcRenderer.on('main-plugin', function(event, data) {
		console.log("preload: received main-plugin: ", data);
		var eventName = `app-plugin-${data.name}`;
		console.log(eventName);
		window.dispatchEvent(new CustomEvent(eventName, {detail: data}));
	});
	electron.ipcRenderer.on('main-getprojectfile', function(event, data) {
		console.log("preload: received main-getprojectfile: ", data);
		window.dispatchEvent(new CustomEvent("app-getprojectfile", {detail: data}));
	});
	electron.ipcRenderer.on('main-saveprojectfile', function(event, data) {
		console.log("preload: received main-saveprojectfile: ", data);
		window.dispatchEvent(new CustomEvent("app-saveprojectfile", {detail: data}));
	});
	electron.ipcRenderer.on('main-pluginload', function(event, data) {
		console.log("preload: received main-pluginload: ", data);
		setTimeout(function() {
			window.dispatchEvent(new CustomEvent("app-pluginload", {detail: data}));
		}, 1000);
	});
};
function ApiInheritJavascript(data) {
	if (!API_Blob.ready) return;
	IPCSend("renderer-inheritjavascript", {path: data});
};
function ApiSaveProjectFile(data) {
	if (!API_Blob.ready) return;
	IPCSend("renderer-saveprojectfile", data);
};
function ApiGetProjectFile(data) {
	if (!API_Blob.ready) return;
	IPCSend("renderer-getprojectfile", {path: data});
};
function ApiQuit() {
	if (!API_Blob.ready) return;
	IPCSend("renderer-quit", {});
};
function ApiGC() {
	if (!API_Blob.ready) return;
	IPCSend("renderer-gc", {});
};
function ApiOpenFileLocation(data) {
	if (!API_Blob.ready) return;
	IPCSend("renderer-openlocation", data);	
};
function ApiOpenFile(data) {
	if (!API_Blob.ready) return;
	IPCSend("renderer-open", data);	
};
function ApiSaveFile(data) {
	if (!API_Blob.ready) return;
	IPCSend("renderer-save", data);	
};
function ApiToggleConsole(show) {
	if (!API_Blob.ready) return;
	IPCSend("renderer-openconsole", {});
};
function ApiPlugin(data) {
	if (!API_Blob.ready) return;
	IPCSend("renderer-plugin", data);
};

ApiInit(); // init now so that renderer uuid can be set from main-init messages