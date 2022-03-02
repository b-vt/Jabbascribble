var fs = require("fs");
var path = require("path");

var {Config} = require("../../src/shared/config.js");
var {Plugin} = require("../../src/shared/plugin.js");
/* manages "plugins" */
function Plugins(appClass) {
	var self = this;
	this.activePlugins = [];
	/*this.listeners = [
		"render": [],
		"main": [],
		"save": [],
		"open": []
	];*/ 
	for(var i = 0; i < Config.plugins.length; i++) {
		try {
			console.log(Config.plugins, Config.plugins.length);
			((_i) => {
				var conf = Config.plugins[_i];
				var main = path.normalize(path.join(__dirname, `../../plugins/${conf.main}`));
				var renderer = path.normalize(path.join(__dirname, `../../plugins/${conf.renderer}`));
				fs.access(main, fs.constants.F_OK, function(err) {
					if (err) return console.log(`- Plugins.js error could not find plugin:\n\t${main} ${err}`);	
					var MyPlugin = require(main);
					// todo: tell renderer about conf.renderer
					var plugin = new MyPlugin(conf).start();
					self.activePlugins[plugin.name] = plugin;
				});
			})(i);
		}
		catch (e) {
			console.log(`- Plugins.js has failed to load a plugin -\n\t${conf.main}\n${e}`);
		}
	}
};
Plugins.prototype.on = function(eventName, fnCallback) {
	var listenerType = this.listeners[eventName];
	if (listenerType) {
		this.listeners[eventName].push(fnCallback);
	};
};
/* all plugins must inherit from plugin.js and overload methods accordingly otherwise they return null */
Plugins.prototype.pushPluginEvent = function(eventName, msg) {
	for(var i = 0; i < this.activePlugins.length; i++) {
		var item = this.activePlugins[i];
		eventName = eventName.toLowerCase();
		var reply = null;
		if (eventName == "render") {
			reply = item.onRendererEvent();
		}
		if (eventName == "main") {
			reply = item.onMainEvent();
		}
		if (eventName == "save") {
			reply = item.onSaveEvent();
		}
		if (eventName == "open") {
			reply = item.onOpenEvent();
		}
		if (eventName == "start") {
			reply = item.onStartEvent();
		}
		if (eventName == "stop") {
			reply = item.onStopEvent();
		}
		if (eventName == "hotkey") {
			reply = item.onHotkeyEvent();
		}
		if (reply) {
			// todo
		}
	}
};
	/*try {*/
		/*var p = this.plugs[msg.name] || null;
		if (p != null) {
			var reply = p.doTask();
			renderer.webContents.send("plugins-event", msg);
		}*/
	/*}
	catch(e) {
		console.trace(e);
	}*/

Plugins.prototype.destroy = function() {

};

if (typeof module!=="undefined")
	module.exports = { Plugins }