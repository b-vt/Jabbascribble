// things that all PluginMains should have i guess
function PluginMain(conf) {
	// inheritance
	//PluginMain.call(this);
	console.log("PluginMain constructor");
	this.name = typeof GetRandomString === "function" ? GetRandomString() : "";
};
// inheritance  
//MyPluginMain.prototype = Object.create(PluginMain.prototype);
//MyPluginMain.prototype.constructor = MyPluginMain;
//
PluginMain.prototype.name = ""; // required by Plugins, used as map key
PluginMain.prototype.versionString = "";
/* some code to inject into context menus */
PluginMain.prototype.injectEditorContextMenu = function() {
	return null;
};
/* some code to inject into renderer */
PluginMain.prototype.injectRenderer = function() {
	return null;
};
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
// things that all PluginRenders should have i guess
function PluginRender() {

}

if (typeof module!=="undefined")
	module.exports = { 
		PluginMain,
		PluginRender
	}