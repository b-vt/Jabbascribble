// auto compete thing
function ElementCompletionsPopup(completions) {
	var self = this;
	this.container = UI.makeUnique("popup", "div", "absolute popup", document.body);
	this.container.isPopup = true;
	
	//this.label = UI.make("label", "", this.container);
	//this.label.setAttribute("for", "autocomplete");
	this.select = UI.make("select", "popup", this.container);
	this.select.isPopup = true;
	//this.select.setAttribute("name", "autocomplete");
	this.select.setAttribute("multiple", "");
	for(var i = 0; i < completions.length; i++) {
		var opt = UI.make("option", "", this.select, completions[i]);
		opt.isPopup = true;
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
	window.popups["ternjs"] = null;
};

(() => {

	//var tools = window.editor.rowTools
	//new ElementIconButton(tools, "ui-icon-open", "").onclick = function() {
	//	console.log("hello plugin world?");
	//};
	var lastKeyStrokeTimer = null;
	var autoRequest = true;
	var menu = window.editor.menu;
	var viewItem = menu.view.add("Tern Requests on Keypress", "ui-icon-plugin-enabled", "Send an autocomplete request to Tern server if available with a 250ms keyup delay").onclick = function() {
		if (autoRequest) {
			autoRequest = false;
			this.container.children[0].classList.remove("ui-icon-plugin-enabled");
			this.container.children[0].classList.add("ui-icon-plugin-disabled");
		}
		else {
			autoRequest = true;
			this.container.children[0].classList.remove("ui-icon-plugin-disabled");
			this.container.children[0].classList.add("ui-icon-plugin-enabled");
		}
			
	}
	window.addEventListener('app-plugin-ternjs', function(event) {
		if (window.popups["ternjs"] && (typeof window.popups["ternjs"].destroy == "function")) 
			window.popups["ternjs"].destroy();
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
					if (popup.select.options.length == 0 || cm.display.cursorDiv.children[0] == undefined || cm.display.cursorDiv.children[0] == null)
						return popup.destroy();

					var rect = cm.display.cursorDiv.children[0].getClientRects()[0];
					var x = rect.x;
					var y = rect.y + 20;

					x = Clamp(x, 0, window.innerWidth - (popup.rect.width * 2));
					y = Clamp(y, 0, window.innerHeight - (popup.rect.height));
					
					popup.move(x, y);
					
					if (!autoRequest) {
						cm.display.input.blur();
						popup.select.focus();
					}
					popup.container.onkeyup = function(event) {
						var dto = new InputEventDto(event);
						if (dto.key == InputEventDto.prototype.KEY_RETURN || dto.key == InputEventDto.prototype.KEY_TAB) {
							var index = popup.select.selectedIndex >=0 ? popup.select.selectedIndex : 0;
							var opt = popup.select.options[index];
							cm.replaceRange(opt.value, response.start, response.end);
							popup.destroy();
						}
						else if (dto.key == InputEventDto.prototype.KEY_ESCAPE) {
		 					popup.destroy();
						}
					}
					popup.container.ondblclick = function(event) {
						var opt = popup.select.options[popup.select.selectedIndex];
						cm.replaceRange(opt.value, response.start, response.end);
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
	
	window.addEventListener('keyup', function(event) {
		//console.log(event);
		var dto = new InputEventDto(event);
		console.log(dto);
		// skip this routine if auto send is disabled or if this press was the hotkey
		if (!autoRequest || dto.key == InputEventDto.prototype.KEY_CTRL || dto.key == InputEventDto.prototype.KEY_SPACE) return; 
		var editor =  window.editor.columns.active().editor;
		var active = editor.tabs.getActive();
		if (active) {
			var datum = editor.tabs.getActive().datum;
			if (datum) {
				var cm = datum.codemirror;
				if (cm.hasFocus()) {
					// if this is not an alphanumeric, underscore or period then cleanup the popup and cancel request
					if (!(dto.key <= InputEventDto.prototype.KEY_Z && dto.key >= InputEventDto.prototype.KEY_0) && 
								dto.key !== InputEventDto.prototype.KEY_UNDERSCORE &&
									dto.key !== InputEventDto.prototype.KEY_PERIOD &&
										dto.key !== InputEventDto.prototype.KEY_NUMPAD_PERIOD) { 
						console.log("!!");
						clearTimeout(lastKeyStrokeTimer);
						lastKeyStrokeTimer = null;
						if (window.popups["ternjs"] && (typeof window.popups["ternjs"].destroy == "function"))
							window.popups["ternjs"].destroy();
						return;
					}
					if (lastKeyStrokeTimer == null) 
						lastKeyStrokeTimer = setTimeout(fnGetCompletions, 250);
					else {
						clearTimeout(lastKeyStrokeTimer);
						lastKeyStrokeTimer = setTimeout(fnGetCompletions, 250);
					}
				}
			}
		}
		
	});
	window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_SPACE], function() {
		if (autoRequest && window.popups["ternjs"])
				window.popups["ternjs"].select.focus();
		else  {
			fnGetCompletions();
			/*console.log("??");
			if (lastKeyStrokeTimer == null) 
				lastKeyStrokeTimer = setTimeout(fnGetCompletions, 250);
			else {
				clearTimeout(lastKeyStrokeTimer);
				lastKeyStrokeTimer = setTimeout(fnGetCompletions, 250);
			}*/
		}
	});
	
})();