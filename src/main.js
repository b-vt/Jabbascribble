//
(() => {
	
	var electron = require("electron");
	var path = require("path");
	var fs = require("fs");
	
	electron.app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
	electron.app.commandLine.appendSwitch('enable-gpu-rasterization');
	electron.app.commandLine.appendSwitch('force_high_performance_gpu');
	/*require("v8").setFlagsFromString("--expose-gc");
	require("v8").setFlagsFromString("--max_old_space_size=0");
	global.gc = require("vm").runInNewContext("gc");*/
	/*electron.app.commandLine.appendSwitch('max_old_space_size', "0");
	electron.app.commandLine.appendSwitch('expose_gc');*/
	//--max_old_space_size=0 --expose-gc
	var runDefault = true;

	function defaultScript() {
		console.log(" launching default script ");
		console.log("cwd:", process.cwd());
		require("./application.js");
		return;
	}
	function loadElectron(file) {
		if (file.match(/(localhost)|(127.0.0.1)/g) != null) {
			//var filename = path.normalize(path.join(process.cwd(), process.argv[1]));
			//console.log(" redirecting to an html page.. opening electron window ");
			var window = new electron.BrowserWindow({width: 800, height: 600});
			window.removeMenu();
			var menu = electron.Menu.buildFromTemplate([{label: "Options", submenu: [{role: "close"}, {role: "forceReload"}, {role: "toggleDevTools"}]}]);
			electron.Menu.setApplicationMenu(menu);
			window.loadURL(file);
			window.on("close", function(a, b, c) {

			});
			
			return;
		}
		fs.open(file, 'r', function(err, fd) {
			if (err) {
				console.log("this is not a file: ", file);
				//defaultScript();
				return;
			}
			switch (path.extname(file).toLowerCase()) {
				case ".htm":
				case ".html": {
					(() => {
						var filename = path.normalize(path.join(process.cwd(), file));
						console.log(" redirecting to an html page.. opening electron window ");
						var window = new electron.BrowserWindow({width: 800, height: 600});
						window.removeMenu();
						var menu = electron.Menu.buildFromTemplate([{label: "Options", submenu: [{role: "close"}, {role: "forceReload"}, {role: "toggleDevTools"}]}]);
						electron.Menu.setApplicationMenu(menu);
						window.loadFile(filename);

						window.on("close", function(a, b, c) {

						});

					})();
					break;
				}
				default: {
					var filename = path.normalize(path.join(process.cwd(), file));
					console.log(" redirecting from default script\n", filename);
					require(filename);
					break;
				}
			};
		});
	}
	electron.app.whenReady().then((e) => {
		process.on("SIGINT", function(data) {
			console.log(`------- process s (${process.pid}) received SIGINT -------\n`, 
							data,
							"\n----------------------------");
			process.kill(process.pid, "SIGINT");
			process.exit();
		});
		process.on("SIGTERM", function(data) {
			console.log(`------- process (${process.pid}) received SIGTERM -------\n`, 
							data,
							"\n----------------------------");
			process.kill(process.pid, "SIGINT");
			process.exit();
		});
		console.log(process.argv);
		if (process.argv.length > 1) {
			for(var i = 1; i < process.argv.length; i++) {
				var arg = process.argv[i];
				if (arg == "-e" || arg == "-electron" && process.argv[i+1]) {
					console.log("spawning new instance of electron with some file");
					console.log("new instance main script: ", process.argv[i+1]);
					runDefault = false;
					loadElectron(process.argv[i+1]);
					return;
				};
			}
		}
		if (runDefault) {
			defaultScript();
		}
	});
})();
