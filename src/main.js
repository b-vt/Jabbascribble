var electron = require("electron");
var fs = require("fs");
var path = require("path");
var os = require("os");

var {Config} = require("./src/shared/config.js");
var Common = require("./src/shared/common.js");
var {Plugins} = require("./src/shared/plugins.js");

(() => {

	var APP_VERSION_MAJOR = 0;
	var APP_VERSION_MINOR = 0;
	var APP_VERSION_PATCH = 0x03182022; // the date of modification
	var DEBUG = false;
	
	electron.app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
	electron.app.commandLine.appendSwitch('enable-gpu-rasterization');
	electron.app.commandLine.appendSwitch('force_high_performance_gpu"');
	
	electron.app.whenReady().then((e) => { // entry point
		console.log(__dirname, process.cwd());
		try {
			new Common.Configure().add("-d -debug", function(v) {
				Config.Debug = true;
				console.log(`overwrite debug=${Config.Debug}`);

			}).add("-v -version", function() {
				console.log("Jabbascribble version:", [APP_VERSION_MAJOR, APP_VERSION_MINOR, APP_VERSION_PATCH].join("."));
			}).add("-f -file", function(arg) {
				var filename = path.normalize(path.join(process.cwd(), arg));
				console.log("opening with file: %s", filename);
				setTimeout(() => {
					OpenFile(filename, undefined, 1, function(file, content, windowId) {
						var web = electron.BrowserWindow.fromId(windowId);
						if (web) web.webContents.send('main-open', { path: file, value: content });
					}, function(msg) {
						console.trace(msg);
					});
				}, 1000);
			});
			var app = new ApplicationClass().init();
		}
		catch(e) {
			console.error(e);
		}
	});

	function ApplicationClass() {
		var self = this;

		//this.plugins = new Plugins(this);

		electron.ipcMain.on('main-close', function(event, data) {
			console.log("received close", data);
		});
		// plugin event from renderer to all plugins
		electron.ipcMain.on('renderer-plugin', function(event, data) {

			(() => {
				//console.log("received plugin: ", data);
				var web = electron.BrowserWindow.fromId(data.uuid);
				if (data.uuid == undefined || web == null) return console.trace("- renderer-plugin request by unknown window -");
				//self.plugins.pushPluginEvent(web, data);
				//console.log(data.name, data.msg);
				/*if (self.plugins == null) return;javascript:void(0)
				var p = self.plugins.get(data.name);
				if (p != null) {
					p.doTask(data.msg, web);
				}*/
			})();

		});
		// get explorer directory from path
		electron.ipcMain.on('renderer-getprojectfile', function(event, data) {
			console.log("received getprojectfile: ", data);
			if (data.uuid == undefined) return console.trace("- renderer-getprojectfile request by unknown window -");
			var mypath = data.path.replace("~", os.homedir());
			var dir = path.normalize(mypath);
			console.log("project file: %s", dir);			
			OpenFile(dir, data.encoding, data.uuid, function(file, content, windowId) {
				var web = electron.BrowserWindow.fromId(windowId);
				if (web) web.webContents.send('main-getprojectfile', { path: file, value: content });
			}, function(msg) {
				console.trace(msg);
			});
		});
		// close a window
		electron.ipcMain.on('renderer-quit', function(event, data) {
			console.log("received open console: ", data);
			var web = electron.BrowserWindow.fromId(data.uuid);
			if (data.uuid == undefined || web == null) return console.trace("- renderer-quit request by unknown window -");
			web.close();
		});
		// open shell to file location
		electron.ipcMain.on('renderer-openlocation', function(event, data) {
			console.log("received open file location: ", data.uuid);
			var web = electron.BrowserWindow.fromId(data.uuid);
			if (data.uuid == undefined || web == null) return console.trace("- renderer-openconsole request by unknown window -");
			electron.shell.openPath(data.path);
		});
		// open the renderers dev console
		electron.ipcMain.on('renderer-openconsole', function(event, data) {
			console.log("received open console: ", data);
			var web = electron.BrowserWindow.fromId(data.uuid);
			if (data.uuid == undefined || web == null) return console.trace("- renderer-openconsole request by unknown window -");
			web.webContents.openDevTools();
		});
		// force gc from renderer
		electron.ipcMain.on('renderer-gc', function(event, data) {
			console.log("received gc: ", data);
			if (typeof global.gc == "function" )
				global.gc();
		});
		
		// save files
		electron.ipcMain.on('renderer-save', function(event, data) {
			if (data.uuid == undefined/* || web == null*/) return console.trace("- renderer-save request by unknown window -");
			var file = data.path;
			if (file == undefined) 
				file = electron.dialog.showSaveDialogSync( { properties: ['showHiddenFiles'] });
			if (file == undefined)
				return console.log(`- renderer-save request was canceled`);
			console.log("saving file:", file);
			SaveFile(file, data.encoding, data.value, data.id, data.uuid, function(file, tabId, windowId) {
				var web = electron.BrowserWindow.fromId(windowId);
				if (web) web.webContents.send("main-tab-save", {name: file, id: tabId});
			}, function(msg) {
				console.log("save error: ", msg);
			});
		});

		// open files
		electron.ipcMain.on('renderer-open', function(event, data) {
			if (data.uuid == undefined/* || web == null*/) return console.trace("- renderer-open request by unknown window -");
			console.log("received open", data);
			var files = [data.path];
			if (data.path == undefined) 
				files = electron.dialog.showOpenDialogSync( { properties: ['openFile', 'multiSelections', 'showHiddenFiles'] }) || [];
			console.log("opening files:", files);
			for(var i = 0; i < files.length; i++) {
				OpenFile(files[i], data.encoding, data.uuid, function(file, content, windowId) {
					var web = electron.BrowserWindow.fromId(windowId);
					if (web) web.webContents.send('main-open', { path: file, value: content });
				}, function(msg) {
					console.log("open error: ", msg);
				});
			}
		});
	};
	
	ApplicationClass.prototype.init = function() {
		// create the default/previous environment here I guess
		var appWindow = CreateWindow(this, "./src/editor/editor.html", {
			preload: './src/editor/editor.preload.js',
			icon: "./data/icon-32.ico",
			width: Config.window.Width,
			height: Config.window.Height,
			openTools: Config.EnableDevTools
		});
		appWindow.webContents.send('main-init', { uuid: appWindow.id });
		appWindow.show();

		// plugins are last in case one needs to interact with the window maybe?
		//this.plugins = new Plugins(this);
	};

	function CreateWindow(instance, src, opt) {
		var appWindow = new electron.BrowserWindow({
			title: opt.title || ["jabbascribble", (Config.Debug==true?"(debug)":"")].join(" "),
			width: opt.width || 350, 
			height: opt.height || 200, 
			minWidth: 350,
			minHeight: 200,
			transparent: false, 
			webPreferences: {
				nodeIntegration: false, 
				worldSafeExecuteJavaScript: true,
				contextIsolation: true,
				preload: (opt.preload!==undefined ? path.normalize(path.join(__dirname, opt.preload)) : undefined)
			}, 
			icon: (opt.icon!==undefined ? path.normalize(path.join(__dirname, opt.icon)) : undefined),
			show: false
		});
		appWindow.removeMenu();

		if (opt.openTools!==undefined && opt.openTools==true) {
			appWindow.webContents.openDevTools();
		};
		appWindow.loadFile(src);

		// window event processing
		appWindow.webContents.on("did-finish-load", function(event, data) { // tell the newly created window its id
			appWindow.webContents.send('main-init', { uuid: appWindow.id });
		});
		appWindow.webContents.on("will-navigate", function(event, data) { // prevent navigating to a website for security reasons
			event.preventDefault();
			Common.Log(`- prevented navigation to website -\n\t${data}`);
		});
		appWindow.webContents.on("open-url", function(event, data) { // prevent navigating to a website for security reasons
			event.preventDefault();
			Common.Log(`- prevented navigation to website -\n\t${data}`);
		});
		appWindow.on("close", function(event, data) { // todo: dont remember if this comes before or after the window has closed
			console.log("bye");
		});
		return appWindow;
	}
	/* callback hell wrapper for more callbacks
		file: full file path and name,
		encoding: defaults to utf8
		uuid: window id, proably doesn't need to be part of this at all 
		fnDone: callback when file contents are in buffer
		fnError: something bad happen
	*/
	function OpenFile(file, encoding, uuid, fnDone, fnError) {
		((_file, _encoding, _uuid) => {
			fnDone = fnDone || (() => {});
			fnError = fnError || (() => {});
			var encoding = _encoding || 'utf8'; 
			//var web = electron.BrowserWindow.fromId(_uuid);
			fs.open(_file, 'r', function(err, fd) {
				if(err !== null) return fnError(`- OpenFile request failed to open file -\n\t${_file}\n`);
				fs.fstat(fd, function(err, stats) {
					if (err !== null) return fnError(`- OpenFile fstat failed -\n\t${_file}`);
					var fileSize = stats.size + 1;
					fs.read(fd, {buffer: Buffer.alloc(fileSize)}, function(err, bytes, buffer) {
						if(err !== null) return fnError(`- OpenFile request failed to read file -\n\t${_file}\n`);
						var content = buffer.toString(encoding, 0, bytes);
						//if (web) web.webContents.send('main-open', { path: _file, value: content });
						fnDone(_file, content, _uuid);
						fs.close(fd, function(err) {
							if (err !== null) return fnError(`- OpenFile request failed to close file -\n\t${_file}\n`);
						});
					});
				});
			});
		})(file, encoding ,uuid);
	};
	function SaveFile(file, encoding, data, id, uuid, fnDone, fnError) {
		((_file, _encoding, _data, _id, _uuid) => {
			fnDone = fnDone || (() => {});
			fnError = fnError || (() => {});
			//var web = electron.BrowserWindow.fromId(_uuid);
			var encoding = _encoding || 'utf8'; 
			var pathSplit = _file.split(/[\\\/]/g);
			var fileName = pathSplit[pathSplit.length - 1];
			var tempDir = path.normalize(path.join(__dirname, Config.TempDir));
			//var tempFile = [fileName, "_tmp.sav"].join("");
			fs.mkdir(tempDir, {recursive: true}, function(err) { // make a temporary directory
				if (err!==null) return fnError("- SaveFile could not create temp folder -\n\t" + tempDir);
				//var tempFilePath = path.normalize(path.join(tempDir, tempFile));
				var backupFilePath = path.normalize(path.join(tempDir, [fileName, ".0"].join("")));
				fs.copyFile(_file, backupFilePath, function(err) { // make a backup of the original file
					if (err!==null) console.trace(`- SaveFile could not copy original file to backup -\n\t${_file} to ${backupFilePath}`);
					fs.open(_file, 'w+', function(err, fd) { // truncate/create file
						if (err!==null) return fnError(`- SaveFile could not open file -\n\t${_file}`);	
						fs.write(fd, _data, function(err, bytesWritten, buffer) { // write data to final file
							if (err!==null) return fnError(`- SaveFile could not write file -\n\t${_file}`);
							fs.close(fd, function(err) { // done
								if (err!==null) return fnError(`- SaveFile could not close file -\n\t${_file}`);
								fnDone( _file, _id, _uuid);
								//if (web) web.webContents.send("main-tab-save", {name: _file, id: _id});
							});
						});
					});
				});
			});
		})(file, encoding, data, id, uuid);
	}
})();