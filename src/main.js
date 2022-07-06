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
			console.log(`------- redirected process (${process.pid}) received SIGINT -------\n`, 
							data,
							"\n----------------------------");
			process.exit();
		});
		process.on("SIGTERM", function(data) {
			console.log(`------- redirected process (${process.pid}) received SIGTERM -------\n`, 
							data,
							"\n----------------------------");
			process.exit();
		});
		if (process.argv.length >= 2) {
			var testStr = process.argv[1];
			fs.open(testStr, 'r', function(err, fd) {
				if (err) {
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
								var menu = electron.Menu.buildFromTemplate([{label: "File", submenu: [{role: "close"}]}]);
								electron.Menu.setApplicationMenu(menu);
								window.loadFile(filename);

								window.on("close", function(a, b, c) {
									console.log(a, b, c);
									console.log("REE");
								});

						})();
						break;	
					}
					default: {
						var filename = path.normalize(path.join(process.cwd(), process.argv[1]));
						console.log(" redirecting from default script ");
						require(filename);
						break;
					}
				};
			});
			return;
		}
		defaultScript();
	});
})();