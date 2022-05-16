(() => {
	
	window.addEventListener('app-plugin-ternjs', function(event) {
		if (window.popups["ternjs"]) window.popups["ternjs"].destroy();
		try {
			var response = JSON.parse(event.detail.data);
			var editor =  window.editor.columns.active().editor;
			var active = editor.tabs.getActive();
			if (active) {
				var datum = editor.tabs.getActive().datum;
				if (datum) {
					var cm = datum.codemirror;
					var x = cm.display.cursorDiv.children[0].offsetLeft + 10;
					var y = cm.display.cursorDiv.children[0].offsetTop + 100;

					x = Clamp(x, 0, window.innerWidth - 425);
					y = Clamp(y, 0, window.innerHeight - 250);
					window.popups["ternjs"] = new ElementPopup(x, y, response.completions);
					window.popups["ternjs"].container.onkeyup = function(event) {
						var dto = new InputEventDto(event);
						if (dto.key == InputEventDto.prototype.KEY_RETURN || dto.key == InputEventDto.prototype.KEY_TAB) {
							var cursor = cm.getCursor();
							cm.replaceRange(this.value, cursor);
							window.popups["ternjs"].destroy();
						}
						else if (dto.key == InputEventDto.prototype.KEY_ESCAPE) {
		 					window.popups["ternjs"].destroy();
						}
					}
					window.popups["ternjs"].container.ondblclick = function(event) {
						var cursor = cm.getCursor();
						cm.replaceRange(this.value, cursor);
						window.popups["ternjs"].destroy();
					}
				}
			}
		}
		catch (e) {
			console.log(e);
		}
		//new ElementPopup(
	});
	
	window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_SPACE], function() {
		var completes = {};
		var editor =  window.editor.columns.active().editor;
		var active = editor.tabs.getActive();
		if (active) {
			var datum = editor.tabs.getActive().datum;
			//if ((editor !== undefined && editor !== null) && (active !== undefined && active !== null) && (datum !== undefined && datum !== null)) {
			if (datum) {
				var cursor = datum.codemirror.getCursor();
				var text = datum.codemirror.getValue();
				window.api.plugin({
					name: "ternjs", event: "render", request: {
						file: datum.path || `new_file_${Math.floor(Math.random() * 10000)}`, ch: cursor.ch, line: cursor.line, text: text
					}
				});
			}
		}
		//}
	});
	
})();