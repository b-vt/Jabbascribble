(() => {
	
	var electron = require("electron");
	var path = require("path");
	
	electron.app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
	electron.app.commandLine.appendSwitch('enable-gpu-rasterization');
	electron.app.commandLine.appendSwitch('force_high_performance_gpu"');

	if (process.argv.length == 2) {
		switch (path.extname(process.argv[1]).toLowerCase()) {
			case ".htm":
			case ".html": {
				(() => {
					var filename = path.normalize(path.join(process.cwd(), process.argv[1]));
					console.log(" redirecting to an html page.. opening electron window ");
					electron.app.whenReady().then((e) => {
						console.log("REEE");
						
						process.on("SIGINT", function(data) {
							console.log("------- redirected process on SIGINT -------\n", 
											data,
											"\n----------------------------");
							process.exit();
						});
						process.on("SIGTERM", function(data) {
							console.log("------- redirected process on SIGTERM -------\n", 
											data,
											"\n----------------------------");
							process.exit();
						});
						
						var template = [{label: "File", submenu: [{role: "close"}]}];
						
						var window = new electron.BrowserWindow({width: 800, height: 600});
						console.log("FUCK");
						window.removeMenu();
						var menu = electron.Menu.buildFromTemplate(template);
						electron.Menu.setApplicationMenu(menu);
						window.loadFile(filename);
						
						window.on("close", function(a, b, c) {
							console.log(a, b, c);
							console.log("REE");
						});
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
		
		return;
	}
	console.log(" launching default script ");
	require("./application.js");
	//process.exit(1);
	
})();