/* this is all very cursed */

// all vanilla 
function ArrayMoveIndex(arr, index, to, before) {
	var r = [];
	before = before || 0; //
	var swap = arr[index];
	for (var i = 0; i < arr.length; i++) {
		if (i == index) {
			continue;
		};
		if (swap !== null && i == before + to) {
			r[r.length] = swap;
			i--;
			swap = null;
			continue;
		};
		r[r.length] = arr[i];
	};
	return r;
};
function NormalizePath(path) {
	var p = path.replace('\\', '/');
	return p;
};
/* dynamically modifier css per selector with
	for example, InjectCSS(".CodeMirror", "font-size", 25, "px");
*/
function InjectCSS(selector, rule, value, extra, delimiter) {
	var style = document.createElement("style");
	document.head.appendChild(style);
	var d = delimiter ? "\"" : "";
	var rvalue = [d, value, d, extra].join("");
	var rules = [selector, "{", rule, ":", rvalue, "!important;", "}"].join(" ");
	style.sheet.insertRule(rules, 0);//style.sheet.cssRules.length);
	console.log(rules);
	return style.sheet;
};
function Byte2Nibble(byte) {
	return [ byte >> 4, byte & 0xf ];
};
function Bytes2Hex(arr, format) { // god forgive me for i have sinned
	var n = [];
	var c = "0";
	for(var i = 0; i < arr.length; i++) {
		var tests = Byte2Nibble(arr[i]);
		for(var x = 0; x < tests.length; x++) { // there are two nibbles to extract
			switch(tests[x]) {
				case 1: {
					c = "1";
					break;
				}
				case 2: {
					c = "2";
					break;
				}
				case 3: {
					c = "3";
					break;
				}
				case 4: {
					c = "4";
					break;
				}
				case 5: {
					c = "5";
					break;
				}
				case 6: {
					c = "6";
					break;
				}
				case 7: {
					c = "7";
					break;
				}
				case 8: {
					c = "8";
					break;
				}
				case 9: {
					c = "9";
					break;
				}
				case 10: {
					c = "A";
					break;
				}
				case 11: {
					c = "B";
					break;
				}
				case 12: {
					c = "C";
					break;
				}
				case 13: {
					c = "D";
					break;
				}
				case 14: {
					c = "E";
					break;
				}
				case 15: {
					c = "F";
					break;
				}
				case 0:
				default: {
					c = "0";
					break;
				}
			}
			n[n.length] = c;
		}
		if (format) n[n.length] = " ";
	}
	return n.join("");
};
/*function Bytes2Hex(arr) {
	var n = [];
	for(var i = 0; i < arr.length; i++) {
		var s = arr[i].toString(16).toUpperCase();
		n.push(s.length == 1 ? "0" + s : s);
	}
	return n;
};*/
function Bytes2Ascii(arr) {
	var n = [];
	for(var i = 0; i < arr.length; i++) {
		n.push(String.fromCharCode(arr[i]));
	}
	return n;
};
function Hex2Ascii(arr) {
	var n = [];
	for(var i = 0; i < arr.length; i++) {
		n.push(String.fromCharCode(parseInt(arr[i], 16)));
	}
	return n;
};
function Clamp(val, min, max) {
	if (val < min)
		return  min;
	else if (val > max)
		return max;
	return val;
};
/* visitor pattern apparently,
	onElementCallback receives event.target.parentElement...parentElement
	onElementCallback needs to return 1 if the function succeeds
	or 0 to continue through the element path until it reaches document */
function GetTargetElements(event, onElementCallback, next) {
	if (event.target !== undefined) {
		if (next !== undefined && next !== null)
			var item = next.parentElement;
		else
			var item = event.target;//.parentElement;

		if (item !== undefined && item !== null) {
			if (onElementCallback(item) != true) {
				//console.log(item);
				GetTargetElements(event, onElementCallback, item);
			}
		}		
	}
};
/* usage: var new_str = FormatString("%s %o", "object =", {items: [0, "x"], notTrue: true});
	currently only supports %s for standard input and %o for objects */
function FormatString(str, args) {
	var str2 = []; // new string, probably slow because of join abuse 
	var sets = 1; // step arguments forward, ignoring the first which will always be str
	for(var i = 0; i < str.length; i++) {
		if (str[i] === "%" && sets < arguments.length) { // find a % in the string if there are more 
			var format = str[i+1]; // get format identifier following %
			i++;// step loop forward to skip the identifier so it's not added to the new string
			var arg = arguments[sets++];
			switch(format) {
				case "o": {
					str2.push(SerializeObject(arg));
					break;
				}
				case "s":
				default: {
					str2.push(arg);
					break;
				}
			}
		}
		else {
			str2.push(str[i]);
		}
	}
	return str2.join("");
};
/* this is meant to be JSON.stringify but for javascript and not json
	obj: object to be serialized
	format: boolean=true, should the output be contained in a codeblock
	indents: count=0, should output contain tabs
	arr: boolean=false, obj is an array and needs special array format
	 */
function SerializeObject(obj, format, indents, arr) {
	var items = [];
	try {
		for(prop in obj) {
			var propValue = obj[prop];
			var tostr = arr==true?[]:[prop, ":"]; // output as an array instead of object property
			if (Array.isArray(propValue)) {
				var arr = [];
				var collection = propValue;
				arr.push(SerializeObject(collection, format, indents, true));
				tostr.push(["[", arr.join(","), "]" ].join(""));
			}
			else if (propValue === null) {
				tostr.push("null" );
			}
			else if (propValue === undefined) {
				tostr.push("undefined" );
			}
			else if (typeof propValue == "object") {
				tostr.push(SerializeObject(propValue, format, indents+1, false, true) );
			}
			else if (typeof propValue == "symbol") {
				tostr.push(["Symbol('", propValue.description, "')"].join(""));
			}
			else if ((typeof propValue == "number") || (typeof propValue == "boolean")) {
				tostr.push(propValue);
			}
			else if (typeof propValue == "string") {
				var esc = '"';
				tostr.push([esc, propValue, esc].join(""));
			}
			else if (typeof propValue == "function") {
				tostr.push(propValue.toString() );
			}
			else {// TODO: missing types reminder
				throw "FIXME: SerializeObject found unknown type: " + typeof propValue + "\nData: " + prop + " = " + propValue;
				continue;
			}
			items.push(tostr.join(""));
		}
	}
	catch (e) {
		console.trace(e);
	}

	if (format==true && arr!=true) {
		var tabs = new Array(indents);
		if (indents > 0)
			tabs = tabs.fill("\t").join("");
		else
			tabs = "";

		var itemsConcat = items.join(",\n\t"+tabs);
		var inner = "\t" + itemsConcat;
		var open = "{";
		var close = "}";

		var code = [open, inner, close].join("\n"+tabs);
		return code;
	}
	return (arr==true ? [ items.join(",") ].join("") : ["{", items.join(","), "}"].join(""));
};

/* busy waiting to synchronize callbacks 
	eats cpu */
function BlockCallback(fnRoutine) {
	var done = false;
	var init = false;
	var result = {done: false};
	while (result.done !== true)
		if (!init) {
			init = true;
			if (typeof fnRoutine === "function")
				fnRoutine(result);
			else
				return null;
		}
	return result;
};

function GetRandomString() {
	var time = (new Date()).getTime();
	var arr = [];
	while(arr.length < 10) {
		var rng = Math.floor(Math.random() * 1000);
		arr.push((time*rng)%255);
	}
	return Bytes2Hex(arr);
};
// [0xff, 0xfe]
// returns 0 to 65535
function ArrayToUnsignedShort(arr) {
	return (arr[0] * 0x100) + arr[1];//( (arr[0]<<8) | arr[1] ); 
};
// [0xff, 0xff, 0xff, 0xfe]
// returns 0 to 4294967295
function ArrayToUnsignedInt(arr) {
	var value = (arr[0] * 0x100) + arr[1];
	value = (value * 0x100) + arr[2];
	value = (value * 0x100) + arr[3];
	return value;
};
// [0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]
// returns 0 to 18,446744,073709551615 because javascript, so nothing above 0x
// only 
function ArrayToUnsignedLongInt(arr) {
	var value = (arr[0] * 0x100) + arr[1];
	value = (value * 0x100) + arr[2];
	value = (value * 0x100) + arr[3];
	value = (value * 0x100) + arr[4];
	value = (value * 0x100) + arr[5];
	value = (value * 0x100) + arr[6];
	value = (value * 0x100) + arr[7];
	return value;
};
/* src: full file name and path
	fnConstructor: prototype constructor */
function LoadScript(src, data, fnConstructor) {
	var script = document.createElement("script");
	script.type = "application/javascript";
	script.onload = function() {
		if (typeof fnConstructor == "function")
			new fnConstructor(args);
	}
	script.src = src;
	script.loadData = data;
	document.head.appendChild(script);
};

function GetURL(url, data, fnDone) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (typeof fnDone !== "undefined")
				fnDone(req.response.toString());
		}
	};
	req.open("POST", url, true);
	req.send(data);
	
}
// afaik module should only exist in a nodejs environment
if (typeof module!=="undefined") {
	var proc = null;//require("process");
	var fs = null;//require("fs");
	var path = null;//require("path");
	var util = null;//require("util");
	var child = null;//require("child_process");
	var electron = null;
	var web = null;
	var webs = null;
	// processes variables from cli
	function Configure() {
		this.argMap = [];
		var length = process.argv.length;
		console.log(process.argv);
		for(var i = 0; i < length; i++) {
			if (i+1 < length)
				this.argMap[process.argv[i]] = process.argv[i+1];
			else
				this.argMap[process.argv[i]] = true; // default to true because it's there?
		}
	};
	// str can be "-h -help"
	Configure.prototype.add = function(str, fnConfigure) {
		var arr = str.split(/[ ]/g);
		for(var i = 0; i < arr.length; i++) {
			if (this.argMap[arr[i]] !== undefined && typeof fnConfigure == "function") {
				fnConfigure(this.argMap[arr[i]]); // give the callback the cli value from configure
			}
		}
		return this;
	};
	/* url: https://someproject.github.com/src/release.zip
		fnDone: callback on download complete
		pathName: should be undefined, but can be whatever. mainly used for redirects
		*/
	function DownloadFile(url, fnDone, pathName) {
		try {
			if (fs == null)
				fs = require("fs");
			if (path == null)
				path = require("path");
			//var web = null;
			var splits = url.split(/[:]/g);
			var w = null;
			if (splits[0] === "https") {
				if (webs == null)
					webs = require("https");
				w = webs;
			}
			else {
				if (web == null)
					web = require("http");
				w = web;
			}
			var split = path.normalize(url).split(/[\\\/]/);
			var fileName = split[split.length - 1];
			var filePath = pathName || path.normalize(fileName); // redirect is either undefined or the file path name from the previous DownloadFile call
			w.get(url, function(res) {
				switch (res.statusCode) {
					case 200: { // ready steady gooo!?
						var file = fs.createWriteStream(filePath);
						console.log(`- DownloadFile started -\n\t${filePath}`);
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
						console.log("- DownloadFile error -\n\tBad Request");
						break;
					}
					case 404: { // 
						console.log("- DownloadFile error -\n\tFile Not File");
						break;
					}
					default: {
						console.log(`- DownloadFile error -\n\tUncaught statusCode: ${res.statusCode}`);
						break;
					}
				}
			})
			.on("error", function(err) {
				console.log(`- DownloadFile error -\n\t${err}`);
			});
		}
		catch(e) {
			new Exit(e);
		}
	};
	/* url: https://someproject.github.com/src/release.zip
		fnDone: callback on status 200
		pathName: should be undefined, but can be whatever. mainly used for redirects */
	function PostURL(url, port, post, fnDone) {
		try {
			if (fs == null)
				fs = require("fs");
			if (path == null)
				path = require("path");

			var splits = url.split(/[:]/g);
			var w = null;
			if (splits[0] === "https") {
				if (webs == null)
					webs = require("https");
				w = webs;
			}
			else {
				if (web == null)
					web = require("http");
				w = web;
			}
			
			((_url, _port, _post) => {
				try {
					var opt = {
						hostname: _url,
						method: 'POST',
						port: _port,
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': Buffer.byteLength(_post)
						}
					};
					var chunks = [];
					function fnResponse(res) {
						console.log(`request status code ${res.statusCode}`);
						res.on('data', function(data) {
							chunks.push(data.toString());
						});
						res.on('end', function(a, b, c) {
							if (typeof fnDone == "function")
								fnDone(chunks.join(""));
						});
						res.on('error', function(a, b, c) {
							console.log(a, b, c);
						});
					};
					var request = w.request(opt, fnResponse);
					request.on('error', function(err) {
						console.log("?!", err);
						fnDone('', err);
					});
					request.write(_post);
					request.end();
				}
				catch(error) {
					console.trace(error);
				}
			})(url, port, post);
		}
		catch(e) {
			//new Exit(e);
			console.log(e);
		}
	};
	/* url: https://someproject.github.com/src/release.zip
		fnDone: callback on status 200
		pathName: should be undefined, but can be whatever. mainly used for redirects */
	function GetURL(url, fnDone) {
		try {
			if (fs == null)
				fs = require("fs");
			if (path == null)
				path = require("path");
			//var web = null;
			var splits = url.split(/[:]/g);
			var w = null;
			if (splits[0] === "https") {
				if (webs == null)
					webs = require("https");
				w = webs;
			}
			else {
				if (web == null)
					web = require("http");
				w = web;
			}

			//var split = path.normalize(url).split(/[\\\/]/);
			var opt = {
				method: 'GET'
			};
			var request = w.request(url, opt, function(res) {
				console.log(`request status code ${res.statusCode}`);
				var chunks = [];
				res.on('data', function(data) {
					//console.log("QueryURL data: ", data.toString());
					chunks.push(data.toString());
				});
				res.on('end', function(a, b, c) {
					//console.log("QueryURL end");
					if (typeof fnDone == "function")
						fnDone(chunks.join(""));
				});
				
			});
			request.on('error', function(error) {
				//console.log("QueryURL error: ",error);
				if (typeof fnDone == "function")
						fnDone("", error);
			});
			//console.log("headers:", JSON.stringify(post));
			//request.write(JSON.stringify(post));
			request.end();
		}
		catch(e) {
			console.log(e);
		}
	};
	/* syncronous write to stdout that poorly mimics console.log */
	function Log(msg) {
		if (fs == null)
			fs = require("fs");
		var f = "";
		for(var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			f = FormatString("%s %s", f, arg);
		};
		// according to nodejs fd 1 is stdout
		fs.writeSync(1, f);
		fs.writeSync(1, '\n');
	};
	/* closes application after writing to stdout by calling process.exit(1)
		according to nodejs it's not safe to call process.exit(1) after writing to stdout,
		so this uses writeSync */
	function Exit(msg) {
		Log(msg);
		console.trace();
		process.exit(1);
	};
	function Error(msg) {
		if (electron == null)
			electron = require("electron");
		electron.dialog.showErrorBox("Attention Required", msg);
		Log(msg);
	};
	/* serializes a single javascript object and outputs to file as valid javascript, if file exists it is truncated
	src: file name 
	type: var/const/let/etc
	expName: export name / object declaration name
	obj: object to serialize into file */
	function GenerateSrc(src, type, expName, obj, fnDone) {
		if (fs == null)
			fs = require("fs");
		((_src, _expName, _obj) => {
			var file = path.join(process.cwd(), _src);
			console.log("GenerateSrc file: %s", file);
			fs.open(file, 'w+', function(erropen1, fd1) { // open config file
				if (erropen1 !== null) return console.trace("GenerateSrc could not open %s", file);
				//var expName = "MyExport";
				var exp = [';\nif (typeof module!=="undefined")\n\tmodule.exports = { ', _expName,' }'].join("");
				var gen = [type, ' ', _expName, ' = ', SerializeObject(_obj, true, 0), exp].join("");

				fs.write(fd1, gen, function(errWrite1, bytesWritten1, buffer1) {
					if (errWrite1 !== null) console.trace("GenerateSrc could not write %s->\n%s", bytesWritten1, buffer1);
					console.log("wrote %s...", file);
					fs.close(fd1, function(errclose1) {
						if (errclose1 !== null) console.trace("GenerateSrc could not close %s", file);
						if (fnDone !== undefined && 
							typeof fnDone === "function") {
							fnDone();
						}
					});
				});
			});
		})(src, expName, obj);
	};

	module.exports = {

		// no dependencies
		Byte2Nibble,
		Bytes2Hex,
		Bytes2Ascii,
		Hex2Ascii,
		Clamp,
		SerializeObject,
		FormatString,
		BlockCallback,
		GetRandomString,
		ArrayToUnsignedShort,
		ArrayToUnsignedInt,
		ArrayToUnsignedLongInt,
		LoadScript,
		//ArrayRemoveIndex,
		ArrayMoveIndex,

		// nodejs dependencies
		Configure,
		GenerateSrc,
		Exit,
		Error,
		Log,
		DownloadFile,
		PostURL,
		GetURL
	}
}