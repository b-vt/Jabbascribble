var UI = undefined; // WindowBuilder global
document.addEventListener("DOMContentLoaded", function() {
	
	// a language needs to be set before the editor can start
	var script = document.createElement("script");
	script.src = "../../data/local/" + Config.Lang + "/lang.js"; 
	console.log(script.src)
	document.head.appendChild(script);

	/* document logic entry point */
	script.onload = function() {
		UI = new WindowBuilder("table");
		var win = new EditorWindow();
	};

});