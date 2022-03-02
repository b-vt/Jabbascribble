function TernPluginRender(plugins, pluginConf) {
	Plugin.call(this);
	console.log(`-- TernPluginRender constructor --\n`, pluginConf);
	var self = this;
	this.pluginConf = pluginConf;
	this.server = null;
	this.name = "ternjs";

	//this.onRendererEvent = function()
};
TernPluginRender.prototype = Object.create(Plugin.prototype);
TernPluginRender.prototype.constructor = TernPluginRender;
TernPluginRender.prototype.onRendererEvent = function(renderer, msg) {
	var self = this;
	//console.log("-- TernPluginRender doTask --");
	(() => {
		var post = {
			query: {
				type: "completions",
				file: msg.name,
				end: {line: 3, ch: 3}//msg.text.length
			},
			files: [{
				name: msg.name,
				text: msg.text,
				type: "full"
			}]
		};
		console.log("-- TernPluginRender post --\n", post);
		Common.PostURL(`http://127.0.0.1:${self.pluginConf.port}`, post, function(data, err) {
			if (err) { // server is dead?
				console.log("-- TernPluginRender post error --");
				try {
					if (self.server !== null && self.server.killed == false)
						self.server.kill('SIGINT');
					else {
						self.server = null;
						self.start(); // try restarting it
					}
				}
				catch (e) {
					console.trace(err, e);
				}
			}
			else {
				//console.log(data);
				var msg = {
					name: "ternjs",
					data: data
				}
				renderer.webContents.send("plugin-", msg);
			}
		});
	})();
};
TernPluginRender.prototype.start = function() {
	var self = this;
	if (this.server != null) return;
	var nodePath = path.normalize(path.join(process.cwd(), "jabbascribble.exe"));
	if (this.pluginConf.Debug == true)
		nodePath = "node";
	var ternPath = path.normalize(path.join(__dirname, "/ternjs/bin/tern"));
	var cmd = [ternPath, "--port", this.pluginConf.port, "--no-port-file", "--ignore-stdixn", "--verbose"];

	this.server = child.spawn(nodePath, cmd);
	this.server.stdout.on("data", function(data) {
		console.log("-------TernPluginRender stdout-------\n", data.toString(), "\n----------------------------");
	});
	this.server.stderr.on("data", function(data) {
		console.log("-------TernPluginRender stderr-------\n", data.toString(), "\n----------------------------");
	});
	this.server.on("close", function(data) {
		console.log("-------TernPluginRender close-------\n", data.toString(), "\n----------------------------");
		self.server = null;
	});
	return this;
};
TernPluginRender.prototype.destroy = function() {
	console.log("-- TernPluginRender cleanup! --");
	this.server.exit('SIGINT');
	return;
};
if (typeof module!=="undefined")
	module.exports = TernPluginRender;