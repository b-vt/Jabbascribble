// things that all PluginMains should have i guess
function PluginMain(app, conf, appWindow) {
	// inheritance
	//PluginMain.call(this);
	console.log("PluginMain constructor");
	this.pluginName = typeof GetRandomString === "function" ? GetRandomString() : "*";
	this.pluginEventName = `main-plugin-${this.pluginName}`;
};
// inheritance  
//MyPluginMain.prototype = Object.create(PluginMain.prototype);
//MyPluginMain.prototype.constructor = MyPluginMain;
//
PluginMain.prototype.pluginName = ""; // required by Plugins, used as map key and event owner
PluginRender.prototype.pluginEventName = ""; // required for sorting events to and from renderer
PluginMain.prototype.versionString = ""; // todo: unused, for debug stuff

/* any event from renderer thread */
PluginMain.prototype.onRendererEvent = function(message) {
	return null;
};
/* any event from main thread */
PluginMain.prototype.onMainEvent = function(message) {
	return null;
};
/* when file is written to */
PluginMain.prototype.onSaveEvent = function(message) {
	return null;
};
/* when file is read */
PluginMain.prototype.onOpenEvent = function(message) {
	return null;
};
/* when ApplicationClass is ready */
PluginMain.prototype.onStartEvent = function(message) {
	return null;
};
/* before application has halted */
PluginMain.prototype.onStopEvent = function(message) {
	return null;
};
/* after PluginMain instantiation */
PluginMain.prototype.start = function() {
	return this;
};
/* cleanup */
PluginMain.prototype.destroy = function(exitCode) {
	return;
};

// things all PluginRender should have
function PluginRender() {
	// todo?
};
PluginRender.prototype.onContextMenu = function(context, id, item) {
};
if (typeof module!=="undefined")
	module.exports = { 
		PluginMain,
		PluginRender
	}