

(() => {
	
	// auto compete thing
	function ElementCCLSCompletionsPopup(completions) {
		var self = this;
		console.log("am i here", completions);
		if (completions.length > 0) {
			this.container = UI.makeUnique("popup", "div", "absolute popup", document.body);
			this.container.isPopup = true;

			//this.label = UI.make("label", "", this.container);
			//this.label.setAttribute("for", "autocomplete");
			//this.select = UI.make("select", "popup", this.container);
			this.select = UI.make("div", "", this.container);
			this.select.hiddenField = UI.make("button", "hiddenfield", this.select); // this hidden field is used to focus the autocomplete popup for keyboard events
			this.select.options = [];
			this.select.selectedIndex = -1;
			this.select.isPopup = true;
			this.select.prev = null;
			//this.select.setAttribute("name", "autocomplete");
			//this.select.setAttribute("multiple", "");

			function scroll(event) {
				var dto = new InputEventDto(event);
				var redraw = false;
				if (dto.key == InputEventDto.prototype.KEY_UP || dto.key == InputEventDto.prototype.KEY_DOWN) {
					var prv = self.select.options[self.select.selectedIndex];
					prv.setAttribute("data-selected", "0");
					if (prv.docs != null) 
							prv.docs.setAttribute("data-show", "0");
					if (dto.key == InputEventDto.prototype.KEY_UP) {
						self.select.selectedIndex = (self.select.selectedIndex-1+self.select.options.length) % self.select.options.length;
					}
					else {
						self.select.selectedIndex = (self.select.selectedIndex+1) % self.select.options.length;
					}
					var item = self.select.options[self.select.selectedIndex];
					var h = item.scrollHeight;
					console.log(h, item, item.scrollHeight);
					item.setAttribute("data-selected", "1");
					if (item.docs != null) {
						item.docs.setAttribute("data-show", "1");
					}
					console.log(self.container, item);
					self.container.scrollTo(0, h * self.select.selectedIndex);
					self.select.hiddenField.focus();
					event.stopPropagation();
					event.preventDefault();

				}
			}
			function matchText(text, match) {
				for(var i = 0; i < match.length; i++) {
					if (text[i] != match[i]) 
						return false;
				}
				return true;
			}
			this.select.hiddenField.onkeydown = scroll;
			this.select.focus = function() {
				self.select.hiddenField.focus();
			}

			var offset = 0;
			var hasListItem = false;
			for(var i = 0; i < completions.length; i++) {
				((_item, _i) => {
					//console.log("i spy: ", _item);
					/*if (_item.depth == 0) {
						offset+=1;
						return;
					}*/
					
					hasListItem = true;
					var index = _i;// - offset;
					var opt = UI.make("div", "popup-option popup-option-autocomplete", self.select, _item.textEdit.newText);
					opt.completeRange = {
						start: {
							line: _item.textEdit.range.start.line, 
							ch: _item.textEdit.range.start.character
						},
						end: {
							line: _item.textEdit.range.end.line, 
							ch: _item.textEdit.range.end.character
						}
					};
					var optLabel = new UI.make("div", "right autocomplete-descriptor", opt, `\t\t${_item.label}`);
					optLabel.style.paddingLeft = "10px";
					/*if (_item.type) {
						if (matchText(_item.type, "fn(")) {
							new UI.make("div", "right autocomplete-descriptor", opt, `\t\t${_item.label}`)
							//UI.make("div", "", opt, "blargle");
						}
					}
					if (_item.doc) {
						opt.docs = new UI.make("div", "autocomplete-docs", opt, _item.documentation);
						opt.docs.setAttribute("data-show", "0");
					};*/
					if (_item.documentation) {
						opt.docs = new UI.make("div", "autocomplete-docs", opt, _item.documentation);
						opt.docs.setAttribute("data-show", "0");
					}
					function fnActivate() {
						self.select.options[self.select.selectedIndex].setAttribute("data-selected", "0");
						if (self.select.options[self.select.selectedIndex].docs != null) {
							self.select.options[self.select.selectedIndex].docs.setAttribute("data-show", "0");//classList.add("hidden");
						}
						var h = opt.scrollHeight;
						if (opt.docs != null) {
							opt.docs.setAttribute("data-show", "1");
							//h = opt.docs.scrollHeight;
						}
						self.select.selectedIndex = index;
						opt.setAttribute("data-selected", "1");
						//if (opt.docs != null) opt.docs.remove(); 
						
						console.log(h, opt, opt.scrollHeight);
						self.select.focus();
						self.container.scrollTo(0, h * self.select.selectedIndex);
					}
					opt.onkeydown = function(e) {
						scroll(e);
					}
					opt.onclick = fnActivate;
					opt.name = _item.textEdit.newText;
					opt.isPopup = true;
					self.select.options[index] = opt;
				})(completions[i], i);
			}
			if (!hasListItem)
				this.destroy();
			this.select.selectedIndex = 0;
			this.select.options[0].setAttribute("data-selected", "1");
			this.rect = this.container.getClientRects()[0];
			this.container.focus();
		}
	};

	ElementCCLSCompletionsPopup.prototype.move = function(x, y) {
		this.container.style.left = `${x}px`;
		this.container.style.top = `${y}px`;
	};
	ElementCCLSCompletionsPopup.prototype.destroy = function() {
		this.select.onkeyup = null;
		this.container.remove();
		window.popups["ccls_client"] = null;
	};

	//var tools = window.editor.rowTools
	//new ElementIconButton(tools, "ui-icon-open", "").onclick = function() {
	//	console.log("hello plugin world?");
	//};
	var lastKeyStrokeTimer = null;
	var autoRequest = true;
	
	function CCLSRender() { // todo: refactor
		//this.name = "ternjs";
		var self = this;
		this.pluginName = "ccls_client";
		//this.pluginEventName = "plugin-event-ternjs";
		
		//var menu = window.editor.menu;
		window.editor.plugins[this.pluginName] = this; 
		var pluginsMenu = window.editor.menu.plugins;//add("Plugins");
		var viewItem = pluginsMenu.add("CCLS Request on Keypress", "ui-icon-plugin-enabled", "Send an autocomplete request to CCLS if available with a 250ms keyup delay").onclick = function() {
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
		window.addEventListener('app-plugin-ccls_client-completions', function(event) {
			//console.log(event);
			if (window.popups[self.pluginName] && (typeof window.popups[self.pluginName].destroy == "function")) 
				window.popups[self.pluginName].destroy();
			try {
				var response = JSON.parse(event.detail.data);//event.detail.data);
				console.log("?!!? response!!?L:!", response.result.items);
				var editor =  window.editor.columns.active().editor;
				var active = editor.tabs.getActive();
				if (active) {
					var datum = editor.tabs.getActive().datum;
					if (datum) {
						var cm = datum.codemirror;
						//console.log(cm);
						if (!cm.hasFocus() || !response.result.items) return;
						var popup = new ElementCCLSCompletionsPopup(response.result.items);
						if (popup) {
							if (popup.select.options.length == 0 || cm.display.cursorDiv.children[0] == undefined || cm.display.cursorDiv.children[0] == null)
								return popup.destroy();

							var rect = cm.display.cursorDiv.children[0].getClientRects()[0];
							var x = rect.x;
							var y = rect.y + 20;

							x = Clamp(x, 0, window.innerWidth - (popup.rect.width))
							y = Clamp(y, 0, window.innerHeight - (popup.rect.height));

							popup.move(x, y);

							if (!autoRequest) {
								cm.display.input.blur();
								popup.select.focus();
							}
							popup.container.onkeyup = function(event, prevent) {
								var dto = new InputEventDto(event);
								//console.log(cm);
								event.preventDefault();
								event.stopPropagation();
								if (dto.key == InputEventDto.prototype.KEY_RETURN || dto.key == InputEventDto.prototype.KEY_TAB) {
									var index = popup.select.selectedIndex >=0 ? popup.select.selectedIndex : 0;
									var opt = popup.select.options[index];
									prevent = prevent || 0;
									popup.destroy();
									cm.focus();
									if (prevent) opt.completeRange.end.ch += 1; // handle the inserted tab
									console.log(opt.name, opt.completeRange.start, opt.completeRange.end);
									cm.replaceRange(opt.name, opt.completeRange.start, opt.completeRange.end);

								}
								else if (dto.key == InputEventDto.prototype.KEY_ESCAPE) {
									popup.destroy();
									cm.focus();
								}
							}
							popup.container.ondblclick = function(event) {
								var opt = popup.select.options[popup.select.selectedIndex];
								cm.replaceRange(opt.name, opt.completeRange.start, opt.completeRange.end);
								popup.destroy();
								cm.focus();
							}

							window.popups[self.pluginName] = popup;
							console.log("hello world?", window.popups[self.pluginName]);
						}
					}
				}
			}
			catch (e) {
				console.log(e);
			}
		});
		
		// client protocol
		function fnGetCompletions() {
			var editor =  window.editor.columns.active().editor;
			var active = editor.tabs.getActive();
			if (active) {
				var datum = editor.tabs.getActive().datum;
				if (datum && datum.mode == "text/x-c++src" ) {
					var cursor = datum.codemirror.getCursor();
					var text = datum.codemirror.getValue();
					var prj = window.editor.plugins["projectview"];
					/*var files = [];
					console.log(prj.projectFile);
					if (prj && prj.projectFile)
						files = prj.projectFile.files;*/
						/*window.api.plugin({
							pluginName: self.pluginName, event: "render", 
							request: {
								type: "add",
								files: prj.projectFile.files,
							}
						});*/
					var req = {
						method: "completes",
						projectDir: prj.projectFile.projectDirectory,
						uri: datum.path, 
						ch: cursor.ch, 
						line: cursor.line, 
						text: text/*,
						files: files*/
					}
					// todo: there is no way to set this
					if (prj.projectFile.projectLanguage && prj.projectFile.projectLanguage.length > 0)
						req.projectLanguage = prj.projectFile.projectLanguage;
					window.api.plugin({
						pluginName: self.pluginName, event: "render", request: req
					});
				}
			}
		}
		
		window.editor.plugins[this.pluginName].fnGetCompletions = fnGetCompletions;

		window.addEventListener('keyup', function(event) { // todo: refactor
			var dto = new InputEventDto(event);
			console.log(dto);
			// skip this routine if auto send is disabled or if this press was the hotkey
			var bf = (new Bitfield(dto.modifiers)).compare(InputEventDto.prototype.CTRL) || (new Bitfield(dto.modifiers)).compare(InputEventDto.prototype.SHIFT);
			if (!autoRequest || bf==true) return console.log("x returned because no autorequest or ctrl key was held", autoRequest, bf, (!autoRequest || bf==true)); 
			var editor =  window.editor.columns.active().editor;
			var active = editor.tabs.getActive();
			if (active) {
				var datum = editor.tabs.getActive().datum;
				if (datum) {
					var cm = datum.codemirror;
					if (cm.hasFocus()) {
						if (dto.key == InputEventDto.prototype.KEY_TAB) { // if
							if (window.popups[self.pluginName]) {
								window.popups[self.pluginName].container.onkeyup(event, true);
							}
							return;
						}
						// if this is not an alphanumeric, underscore or period then cleanup the popup and cancel request
						if (!(dto.key <= InputEventDto.prototype.KEY_Z && dto.key >= InputEventDto.prototype.KEY_0) && 
									dto.key !== InputEventDto.prototype.KEY_UNDERSCORE &&
										dto.key !== InputEventDto.prototype.KEY_PERIOD &&
											dto.key !== InputEventDto.prototype.KEY_NUMPAD_PERIOD) { 
							console.log("!!");
							clearTimeout(lastKeyStrokeTimer);
							lastKeyStrokeTimer = null;
							if (window.popups[self.pluginName] && (typeof window.popups[self.pluginName].destroy == "function"))
								window.popups[self.pluginName].destroy();
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
		// todo: ugly copy paste gross
		function fnGetNavigations() {
			var editor =  window.editor.columns.active().editor;
			var active = editor.tabs.getActive();
			if (active) {
				var datum = editor.tabs.getActive().datum;
				if (datum && datum.mode == "text/x-c++src" ) {
					var cursor = datum.codemirror.getCursor();
					var text = datum.codemirror.getValue();
					var prj = window.editor.plugins["projectview"];

					var lineCount = datum.codemirror.lineCount();
					var lineContent = datum.codemirror.getLine(lineCount-1);
					var selects = null;
					//if (datum.codemirror.
					var req = {
						method: "codenav",
						projectDir: prj.projectFile.projectDirectory,
						uri: datum.path, 
						ch: cursor.ch,
						line: cursor.line,
						text: text,
						/*ch: 1,
						line: 7,
						ech: 4, 
						eline: 7, */
						/*text: text,
						files: files*/
					};
					// todo: there is no way to set this
					if (prj.projectFile.projectLanguage && prj.projectFile.projectLanguage.length > 0)
						req.projectLanguage = prj.projectFile.projectLanguage;
					window.api.plugin({
						pluginName: self.pluginName, event: "render", request: req
					});
				};
			};
		};
		window.editor.plugins[self.pluginName].fnGetNavigations = fnGetNavigations;
		window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_D], function() {
			console.warn("there");
			window.editor.plugins[self.pluginName].fnGetNavigations();
		});
		window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_SPACE], function() {
			console.warn("here");
			if (autoRequest && window.popups[self.pluginName])
					window.popups[self.pluginName].select.focus();
			else  {
				console.log("ccls hot key");
				window.editor.plugins[self.pluginName].fnGetCompletions();
			};
		});
		
		
		window.addEventListener('app-plugin-ccls_client-debug', function(event) {
			if (window.popups[self.pluginName] && (typeof window.popups[self.pluginName].destroy == "function")) 
				window.popups[self.pluginName].destroy();
			try {
				var response = JSON.parse(event.detail.data);
				console.warn("ccls_client-debug event: ", event.detail, response);
				var editor =  window.editor.columns.active().editor;
				var active = editor.tabs.getActive();
				if (active) {
					var datum = editor.tabs.getActive().datum;
					if (datum) {
						var cm = datum.codemirror;
						if (!cm.hasFocus() || !response.result.method === "textDocument/completion") return;
						
					}
				}
			}
			catch (e) {
				console.log(e);
			}
		});
		
	};
	/*TernRender.prototype.onContextMenu = function(context, item) {
		context.add("blah", "", "").onclick = function() {
			console.log("");
		};
	};*/
		
	new CCLSRender();
	
})();