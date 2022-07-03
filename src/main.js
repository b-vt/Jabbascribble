(() => {
	
	var electron = require("electron");
	var path = require("path");
	
	electron.app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
	electron.app.commandLine.appendSwitch('enable-gpu-rasterization');
	electron.app.commandLine.appendSwitch('force_high_performance_gpu"');
	
	// configure
	/*for(var argc = 0; argc < process.argv.length; argc++) {
		var line = process.argv[argc];
		var val = process.argv[argc+1] || "";
		switch(line) {
			case "-r":
			case "-redirect": {
				if (val.length > 0) {
					var filename = path.normalize(path.join(process.cwd(), val));
					console.log(" redirecting from default script ");
					require(filename);
				}
				//process.exit(1);
				return;
			}
			default: {
				break;
			}
		};
	};*/
	if (process.argv.length == 2) {
		console.log(path.extname(process.argv[1]).toLowerCase());
		switch (path.extname(process.argv[1]).toLowerCase()) {
			case ".htm":
			case ".html": {
				(() => {
					var filename = path.normalize(path.join(process.cwd(), process.argv[1]));
					console.log(" redirecting to an html page.. opening electron window ");
					electron.app.whenReady().then((e) => {
						var window = new electron.BrowserWindow({width: 800, height: 600});
						window.loadFile(filename);
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
/*(() => {
	
	var electron = require("electron");
	var path = require("path");
	
	electron.app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
	electron.app.commandLine.appendSwitch('enable-gpu-rasterization');
	electron.app.commandLine.appendSwitch('force_high_performance_gpu"');
	
	// configure
	for(var argc = 0; argc < process.argv.length; argc++) {
		var line = process.argv[argc];
		var val = process.argv[argc+1] || "";
		switch(line) {
			case "-r":
			case "-redirect": { // 
				if (val.length > 0) {
					var filename = path.normalize(path.join(process.cwd(), val));
					console.log(" redirecting from default script ");
					require(filename);
				}
				return;
			}
			default: {
				break;
			}
		};
	};
	require("./application.js");	
})();*/