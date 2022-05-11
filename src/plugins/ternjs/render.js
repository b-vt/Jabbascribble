(() => {
	
	window.addEventListener('app-plugin-ternjs', function(event) {
		console.log("received a ternjs event");
	});
	
	window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_SPACE], function() {
		console.log("shit cock");
		var completes = {};
		var editor =  window.editor.columns.active().editor;
		var datum = editor.tabs.getActive().datum;
		if ((editor !== undefined && editor !== null) && (datum !== undefined && datum !== null))
			window.api.plugin({name: "ternjs", event: "render", });
	});
	
})();