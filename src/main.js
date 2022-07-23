(() => {
	
	var electron = require("electron");
	var path = require("path");
	var fs = require("fs");
	
	electron.app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
	electron.app.commandLine.appendSwitch('enable-gpu-rasterization');
	electron.app.commandLine.appendSwitch('force_high_performance_gpu"');
	function defaultScript() {
		console.log(" launching default script ");
		require("./application.js");
		return;
	}
	
	electron.app.whenReady().then((e) => {
		process.on("SIGINT", function(data) {
			console.log(`------- process (${process.pid}) received SIGINT -------\n`, 
							data,
							"\n----------------------------");
			process.exit();
		});
		process.on("SIGTERM", function(data) {
			console.log(`------- process (${process.pid}) received SIGTERM -------\n`, 
							data,
							"\n----------------------------");
			process.exit();
		});
		//console.log(process.argv.length, process.argv);
		if (process.argv.length > 1) {
			var testFile = process.argv[1];
			if (testFile.match(/(localhost)|(127.0.0.1)/g) != null) {
				//var filename = path.normalize(path.join(process.cwd(), process.argv[1]));
				//console.log(" redirecting to an html page.. opening electron window ");
				var window = new electron.BrowserWindow({width: 800, height: 600});
				window.removeMenu();
				var menu = electron.Menu.buildFromTemplate([{label: "Options", submenu: [{role: "close"}, {role: "forceReload"}, {role: "toggleDevTools"}]}]);
				electron.Menu.setApplicationMenu(menu);
				window.loadURL(process.argv[1]);

				window.on("close", function(a, b, c) {
					/*console.log(a, b, c);
					console.log("REE");*/
				});
				return;
			}
			fs.open(testFile, 'r', function(err, fd) {
				if (err) {
					console.log("this is not a file");
					defaultScript();
					return;
				}
				switch (path.extname(process.argv[1]).toLowerCase()) {
					case ".htm":
					case ".html": {
						(() => {
							var filename = path.normalize(path.join(process.cwd(), process.argv[1]));
							console.log(" redirecting to an html page.. opening electron window ");
							var window = new electron.BrowserWindow({width: 800, height: 600});
							window.removeMenu();
							var menu = electron.Menu.buildFromTemplate([{label: "Options", submenu: [{role: "close"}, {role: "forceReload"}, {role: "toggleDevTools"}]}]);
							electron.Menu.setApplicationMenu(menu);
							window.loadFile(filename);

							window.on("close", function(a, b, c) {
								/*console.log(a, b, c);
								console.log("REE");*/
							});

						})();
						break;	
					}
					default: {
						var filename = path.normalize(path.join(process.cwd(), process.argv[1]));
						console.log(" redirecting from default script\n", filename);
						require(filename);
						break;
					}
				};
			});
		}
		else {
			console.log("am I getting here?");
			defaultScript();
			return;
		}
	});
})();