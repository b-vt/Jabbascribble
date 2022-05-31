var path = require("path");
var {PluginMain} = require(path.normalize(path.join(__dirname, "../../src/shared/plugin.js")));
function ProjectPluginMain() {
	PluginMain.call(this);
}
ProjectPluginMain.prototype = Object.create(PluginMain.prototype);
ProjectPluginMain.prototype.constructor = ProjectPluginMain;