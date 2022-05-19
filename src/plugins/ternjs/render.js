// auto compete thing
function ElementCompletionsPopup(completions) {
	var self = this;
	this.container = UI.makeUnique("popup", "div", "absolute popup", document.body);
	
	//this.label = UI.make("label", "", this.container);
	//this.label.setAttribute("for", "autocomplete");
	this.select = UI.make("select", "popup", this.container);
	//this.select.setAttribute("name", "autocomplete");
	this.select.setAttribute("multiple", "");
	for(var i = 0; i < completions.length; i++) {
		var opt = UI.make("option", "", this.select, completions[i]);
	}
	this.rect = this.container.getClientRects()[0];
	this.container.focus();
};
ElementCompletionsPopup.prototype.move = function(x, y) {
	this.container.style.left = `${x}px`;
	this.container.style.top = `${y}px`;
};
ElementCompletionsPopup.prototype.destroy = function() {
	this.select.onkeyup = null;
	this.container.remove();
};

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
					if (!cm.hasFocus()) return;
					var popup = new ElementCompletionsPopup(response.completions);
					
					var rect = cm.display.cursorDiv.children[0].getClientRects()[0];
					var x = rect.x;
					var y = rect.y + 20;

					x = Clamp(x, 0, window.innerWidth - (popup.rect.width * 2));
					y = Clamp(y, 0, window.innerHeight - (popup.rect.height));
					
					popup.move(x, y);
					
					popup.container.onkeyup = function(event) {
						var dto = new InputEventDto(event);
						if (dto.key == InputEventDto.prototype.KEY_RETURN || dto.key == InputEventDto.prototype.KEY_TAB) {
							var cursor = cm.getCursor();
							cm.replaceRange(this.value, cursor);
							popup.destroy();
						}
						else if (dto.key == InputEventDto.prototype.KEY_ESCAPE) {
		 					popup.destroy();
						}
					}
					popup.container.ondblclick = function(event) {
						var cursor = cm.getCursor();
						cm.replaceRange(this.value, cursor);
						popup.destroy();
					}
					
					window.popups["ternjs"] = popup;
				}
			}
		}
		catch (e) {
			console.log(e);
		}
	});
	
	
	
	function fnGetCompletions() {
		var editor =  window.editor.columns.active().editor;
		var active = editor.tabs.getActive();
		if (active) {
			var datum = editor.tabs.getActive().datum;
			if (datum && datum.mode == "javascript") {
				var cursor = datum.codemirror.getCursor();
				var text = datum.codemirror.getValue();
				window.api.plugin({
					name: "ternjs", event: "render", request: {
						type: "completes",
						file: datum.path || `new_file_${Math.floor(Math.random() * 10000)}`, 
						ch: cursor.ch, 
						line: cursor.line, 
						text: text
					}
				});
			}
		}
	}
	var lastKeyStrokeTimer = null;
	window.addEventListener('keyup', function(event) {
		//console.log(event);
		var dto = new InputEventDto(event);
		console.log(dto);
		if (!(dto.key <= 90 && dto.key >= 65)) {
			clearTimeout(lastKeyStrokeTimer);
			lastKeyStrokeTimer = null;
			return;
		}
		
		if (lastKeyStrokeTimer == null) 
			lastKeyStrokeTimer = setTimeout(fnGetCompletions, 250);
		else {
			clearTimeout(lastKeyStrokeTimer);
			lastKeyStrokeTimer = setTimeout(fnGetCompletions, 250);
		}
	});
	window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_SPACE], function() {
		fnGetCompletions();
	});
	
})();