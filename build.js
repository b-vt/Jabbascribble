/*todo: this thing is supposed to do a number of things related to electron setting up this project
	- it can create a copy of the project source files into a usable form for electron but not asar
	- for windows binaries it can change the executable icon to -icon='icon.ico'
	- download electron binaries/packages from https://github.com/electron/electron/releases/
	- setup an exact copy of the development environment

maintenance:
	PLATFORM_BUILD_URL should match a TARGET_PLATFORM, the url was taken from electron build page
	RESOURCE_EDITOR binary path on windows is 

*/

var child = require("child_process");
var proc = require("process");
var fs = require("fs");
var path = require("path");
var https = require("https");
// my stuff
//var Common = require("E:\\Development\\Projects\\NodeJS\\shared\\common.js");

(()=> {
	var VERION = [ 0, 0, 1, 0x12112021].join(".");
	// github downloads for electron distributions
	var PLATFORM_BUILD_URL = {	"win64": "https://github.com/electron/electron/releases/download/v13.6.3/electron-v13.6.3-win32-x64.zip",
								"linux": "https://github.com/electron/electron/releases/download/v13.6.3/electron-v13.6.3-linux-x64.zip",
								// apparently 32 bit is no longer supported?
								"win32": "https://github.com/electron/electron/releases/download/v13.6.3/chromedriver-v13.6.3-win32-ia32.zip",
								"linux-32": "https://github.com/electron/electron/releases/download/v13.6.3/electron-v13.6.3-linux-ia32.zip"};
	// rcedit location for editing icons on windows
	var RESOURCE_EDITOR = {"win32": "E:\\Development\\Tools\\rcedit\\win32\\rcedit.exe",
							"win64": "E:\\Development\\Tools\\rcedit\\win64\\rcedit.exe"};
	// unzip program
	var UNZIP_TOOL		= {"windows": `\"C:\\Program Files\\7-Zip\\7zG.exe\" x ${TEMPORARY_DIR}\\electron.zip -y -r -o`,
							"linux:": ""};
	var PLATFORM_NORMALIZED = "windows"; // windows or linux
	var CURRENT_DIR 	= process.cwd();
	// these can be initialized here or by Configure(cli) and are used when the thing does things
	var BIN_DIR 		= `${CURRENT_DIR}/bin`;
	var TEMPORARY_DIR 	= `${CURRENT_DIR}/tmp`; // all downloads end up here before the folder gets purged
	var ICON_DIR 		= `${CURRENT_DIR}/src/icon-64.ico`; // currently only used by windows
	var SOURCE_LOCATION = `${CURRENT_DIR}/src`; // can be a directory or url, used for creating copies of project
	var PLATFORM = "win64"; // determines electron download
	var TARGET = "debug"; // debug/dev are reserved for script, anything else becomes becomes the folder name in bin
	var BINARY_NAME = "electron"; // electron binary to modify
	var BINARY_RENAME = "MyApplication"; // copy of electron but with a new name
	var USE_PROJECT_JSON = false; // workspace file?
	// flags that should only be set by Configure
	var REPLACE_ICON = false; // tells script to replace binary icon
	var COPY_SOURCE = false; // tells script to copy project source to a new location
	var DOWNLOAD_ELECTRON = false; // tells script to download and extract electron
	var MAKE_ENVIRONMENT = false; // tells script to setup an environment based on ${TARGET}, also overrides several other flags

	
	

	/* returns a string with the current value of this scripts configurable variables */
	function GetConfigString() {
		return	[
					"# Configure option sets:",
					"\n\tCURRENT_DIR\t\t= ", path.normalize(CURRENT_DIR),
					"\n\tBIN_DIR\t\t= ", path.normalize(BIN_DIR),
					"\n\tTEMPORARY_DIR\t= ", path.normalize(TEMPORARY_DIR),
					"\n\tICON_DIR\t\t= ", path.normalize(ICON_DIR),
					"\n\tSOURCE_LOCATION\t\t= ", path.normalize(SOURCE_LOCATION),
					"\n\tPLATFORM\t\t= ", PLATFORM,
					"\n\tTARGET\t\t\t= ", TARGET,
					"\n\tBINARY_NAME\t\t= ", BINARY_NAME,
					"\n\tBINARY_RENAME\t\t= ", BINARY_RENAME,
					"\n\tUSE_PROJECT_JSON\t= ", USE_PROJECT_JSON,
					"\n# Configure flag sets:",
					"\n\tREPLACE_ICON\t\t= ", REPLACE_ICON,
					"\n\tCOPY_SOURCE\t\t= ", COPY_SOURCE,
					"\n\tDOWNLOAD_ELECTRON\t= ", DOWNLOAD_ELECTRON/*,
					"\n\tMAKE_RELEASE\t\t= ", MAKE_RELEASE,
					"\n\tMAKE_DEBUG\t\t= ", MAKE_DEBUG*/
				].join("");
	}

	function ToBoolean(v) {
		return v=v.toString().toLowerCase()===(!![[]]+[])?(!![[]]):v===([+!+[]]+[])?(!![[]]):(![[]]);// HA 
	}
	function Exit(msg) {
		// according to nodejs fd 1 is stdout
		fs.writeSync(1, `- script halted -\n${msg}\n`);
		console.trace();
		process.exit(1);
	}

	function Configure(fnDone) {
		process.argv.forEach((item) => { // cli overwrite and flag set stuff 
			var itemArr = item.split(/=/g);
			var opt = itemArr[0].toLowerCase(); // the option 
			var val = itemArr[1] || true; // using any option should be defaulted to true?
			if (opt.length == 0) return;
			switch(opt) {
				case "-h":
				case "-help": {
					console.log("- build.js Command line options & overwrites - \
						\
						\n\tThis help message \
						\n\t\t-h\texample usage: -h (duh),\n\t\t-help\n \
						\
						\n\tThis help message \
						\n\t\t-h\texample usage: -h (duh),\n\t\t-help\n \
						\
						\n\tTarget platform, used when downloading electron and setting up environments \
						\n\t\t-t,\texample usage: -t='linux'\n\t\t-target,\n\t\t-p,\n\t\t-platform\n \
						\
					");
					break;
				};
				case "-b":
				case "-binary": {
					console.log("# Overwrite: BINARY_NAME to '%s'", val);
					BINARY_NAME = val;
					break;
				};
				case "-d":
				case "-download": {
					console.log("# Overwrite: DOWNLOAD_ELECTRON to '%s'", val);
					DOWNLOAD_ELECTRON = ToBoolean(val);//=="" ? true : false;
					break;
				};
				case "-p":
				case "-platform": {
					console.log("# Overwrite: PLATFORM to '%s'", val);
					PLATFORM = val;
					break;
				};
				case "-r":
				case "-rename": {
					console.log("# Overwrite: BINARY_RENAME to '%s'", val);
					BINARY_RENAME = val;
					break;
				};
				case "-s":
				case "-src":
				case "-source": {
					console.log("# Overwrite: SOURCE_LOCATION to '%s'", val);
					SOURCE_LOCATION = val;
					break;
				}
				case "-t":
				case "-target": {
					console.log("# Overwrite: TARGET to '%s'", val);
					TARGET = val;
					break;
				};
				case "-use-workspace": {
					console.log("# Overwrite: USE_PROJECT_JSON to %i", val);
					USE_PROJECT_JSON = ToBoolean(val);
					break;
				};
				case "-v":
				case "-version": {
					console.log(`Version ${VERSION}`);
					break;
				};
				default: {
					break;
				};
			}
		});

		switch(PLATFORM) {
			case "linux": 
			case "linux-32" : {
				PLATFORM_NORMALIZED = "linux";
				break;
			}
			case "win32":
			case "win64": {
				PLATFORM_NORMALIZED = "windows";
				BINARY_NAME = `${BINARY_NAME}.exe`;
				BINARY_RENAME = `${BINARY_RENAME}.exe`;
				break;
			}
			default: {
				throw `- Configure error -\n\t unsupported TARGET_PLATFORM '${PLATFORM}'`;
				break;
			}
		}

		// paths have to be normalized before they can safely be used
		CURRENT_DIR = path.normalize(CURRENT_DIR);
		BIN_DIR = path.normalize([BIN_DIR, TARGET, PLATFORM].join("/"));
		TEMPORARY_DIR = path.normalize(TEMPORARY_DIR);
		ICON_DIR = path.normalize(ICON_DIR);
		SOURCE_LOCATION = path.normalize(SOURCE_LOCATION);

		console.log(GetConfigString());
		//BIN_PATH = path.normalize(`${CURRENT_DIR}/bin/${TARGET}/${PLATFORM}`);
		//PACKAGE_PATH = path.normalize(`${BIN_PATH}/resources/app/`);

		MakeDirectory(TEMPORARY_DIR, function() {
			MakeDirectory(BIN_DIR, function() {
				if (typeof fnDone === "function")
					fnDone();
			});
		})
		/*fs.access(`${TEMPORARY_FOLDER}`, fs.constants.R_OK, function(err1) {
			if (err1) {
				console.log(`# Configure: creating ${TEMPORARY_FOLDER}`);
				fs.mkdir(TEMPORARY_FOLDER, {recursive: true}, function(err2) {
					if(err2) {
						return new Exit(`- Configure error -\n\t Could not create temporary folder`);
					}
					console.log("# Configure: created tmp folder");
					//return Done();
				});
				return;
			}
			//console.log("# Configure: temporary folder already exists");
			//return Done();
		});*/
	};

	function MakeDirectory(dir, fnNext) {
		fs.access(dir, fs.constants.R_OK, function(err1) {
			if (err1) {
				console.log(`# MakeDirectory: creating ${dir}`);
				fs.mkdir(dir, {recursive: true}, function(err2) {
					if(err2) {
						return new Exit(`- MakeDirectory error -\n\t Could not create directory\n\t${dir}`);
					}
					console.log(`# MakeDirectory: Created directory ${dir}`);
					return fnNext();
				});
				return;
			}
			console.log(`# MakeDirectory: ${dir} already exists ...`);
			return fnNext();
		});
	}
	/* url: https://someproject.github.com/src/release.zip
			fnDone: callback on download complete
			pathName: should be undefined, but can be whatever. mainly used for redirects
			*/
	function DownloadFile(url, fnDone, pathName) {
		try {
			console.log("pathName??", pathName);
			var split = path.normalize(url).split(/[\\\/]/);
			var fileName = split[split.length - 1];
			var filePath = pathName || path.normalize(`${TEMPORARY_DIR}/${fileName}`);
			https.get(url, function(res) {
				switch (res.statusCode) {
					case 200: { // ready steady gooo!?
						//console.log("- DownloadFile URL 200 -");
						var file = fs.createWriteStream(filePath);
						console.log(`- DownloadFile started -\n\t${url}\n`);
						file.on("finish", function() {
							file.close(function(a,b,c) { // cleanup and then callback
								console.log("- DownloadFile finished! -");
								if (typeof fnDone === "function")
									fnDone(filePath);
							});
						});
						res.pipe(file);
						break;
					};
					case 302: { // redirect
						console.log("- DownloadFile URL redirect -");
						DownloadFile(res.headers['location'], fnDone, filePath);
						break;
					};
					case 400: { // bonk
						new Exit("- DownloadFile error -\n\tBad Request");
						break;
					}
					case 404: { // 
						new Exit("- DownloadFile error -\n\tFile Not File");
						break;
					}
					default: {
						new Exit(`- DownloadFile error -\n\tUncaught url status code: ${res.statusCode}`);
						break;
					}
				}
			})
			.on("error", function(err) {
				new Exit(`- DownloadFile error -\n\t${err}`);
			});
		}
		catch(e) {
			new Exit(e);
		}
	}

	function UnpackArchive(filename, directory, fnDone) {
		child.execSync(`${UNZIP_TOOL[PLATFORM_NORMALIZED]}${BIN_DIR}`);
		fs.access(`${path.normalize([BIN_DIR, BINARY_NAME].join("/"))}`, fs.constants.R_OK, function(err1) { // check if electron binary exists
			if (err1) {
				return new Exit(`- UnpackArchive error -\n\t Unpack may have failed, no binary was found!\n\t${path.normalize([BIN_DIR, BINARY_NAME].join("/"))}`);
			}
			if (typeof fnDone === "function")
				return fnDone();
		});
	}
	function CreateEnvironment() {
		if (TARGET.toLowerCase() === "dev" || TARGET.toLowerCase() === "debug") {
			console.log("# Configure: creating debug environment ...");
			DownloadFile(PLATFORM_BUILD_URL[PLATFORM], function(filename) { // download electron
				console.log(filename);
				//console.log(`# Configure: setting up ${TARGET}...`);
				UnpackArchive(filename, BIN_DIR, function() {
					// 
				});
			}, `${path.normalize([TEMPORARY_DIR, "electron.zip"].join("/"))}`);
		}
		else {
			console.log(`# Configure: creating build ${TARGET} environment ...`);
			DownloadFile(PLATFORM_BUILD_URL[PLATFORM], function(filename) { // download electron
				console.log(filename);
				UnpackArchive(filename, BIN_DIR, function() { // delete default_app.asar
					// 
				});
			}, `${path.normalize([TEMPORARY_DIR, "electron.zip"].join("/"))}`);
		}
		
	}

	try {
		Configure(function() {

			/* things that require electron go here */
			if (DOWNLOAD_ELECTRON || MAKE_ENVIRONMENT) {
				CreateEnvironment();
			}
			else if (REPLACE_ICON) {

			}
		});
	}
	catch(e) {
		new Exit(e);
	}

})();
/*
(()=>{
	try {
		Configure(function() {
			if (DOWNLOAD_ELECTRON || MAKE_ENVIRONMENT) {
				console.log("# Configure: downloading copy of electron...");
				DownloadFile(PLATFORM_BUILD_URL[PLATFORM], function(filename) {
					console.log(filename);
					if (MAKE_ENVIRONMENT) {
						console.log(`# Configure: setting up ${TARGET}...`);
						UnpackArchive(filename, dir, function() {

						});
					}
					PrintArt();
				});
			}
		});
	}
	catch(e) {
		new Exit(e);
	}
})();*/