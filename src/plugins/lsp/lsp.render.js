(() => {
	
	// id for 
	//var events = Object.create(null);
	var listeners = null; //new FileOpenListener();
	var navList = null; //
	// events.set(0, EVENT_AUTOCOMPLETE);
	// events.get(0) == EVENT_NAVIGATION ? null : doThing()
	function GetEditorState() {
		var editor = window.editor.columns.active().editor;
		var active = editor.tabs.getActive();
		if (active)
			return { editor: editor, tab: active, datum: active.datum };
		return null;
	};
	function PathFromURI(uri) {
		return uri.replace("file://", "");
	};
	function GetLanguageIdentifierFromFilename(filename) {
		var ext = filename.split(".");
		ext.shift(1);
		ext = ext.join(".");
		switch(ext) {
			// c
			case "c":
			case "h": {
				return "c";
			}
			// c++
			case "C":
			case "cc":
			case "hh":
			case "cpp":
			case "hpp": {
				return "cpp";
			}
			// objective-c
			case "M":
			case "m":
			case "mm":	{
				return "objective-c";
			}
			// java
			case "java": {
				return "java";
			}
			default: {
				console.warn("unsupported LSP language for: %s", ext);
				// todo
				/* language identifiers:
					https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocumentItem
				*/
				return null;
			}
		};
	};
	
	function LSPClientPopupElement(x, y) {
		var self = this;
		this.name = "lsp_client"; // popup name
		if (window.popups[this.name] && (typeof window.popups[this.name].destroy == "function"))
			window.popups[this.name].destroy();
		window.popups[this.name] = this;
		function fnOnItemGet(event) {
			console.log("?!?");
			var dto = new InputEventDto(event);
			event.preventDefault();
			event.stopPropagation();
			console.log("am triggering callback", dto.key, dto.type);
			// listen for get hotkeys and callback to fnOnGetItem
			if (dto.key == InputEventDto.prototype.KEY_RETURN || 
				dto.key == InputEventDto.prototype.KEY_TAB ||
				dto.type == "dblclick") {
				console.log(popup, popup.select);
				var index = self.select.selectedIndex >=0 ? self.select.selectedIndex : 0;
				var opt = self.select.options[index];
				//prevent = prevent || 0;
				self.destroy();
				//state.datum.codemirror.focus();
				return opt.fnOnGet(opt);
				//if (prevent) opt.completeRange.end.ch += 1; // handle the inserted tab
				//console.log(opt.name, opt.completeRange.start, opt.completeRange.end);
				//datum.codemirror.replaceRange(opt.name, opt.completeRange.start, opt.completeRange.end);

			}
		};
		function fnActivateItem() {
			//console.log("am i here at fnActivateItem");
			//console.log(this);
			self.select.options[self.select.selectedIndex].setAttribute("data-selected", "0");
			if (self.select.options[self.select.selectedIndex].expand != null) {
				self.select.options[self.select.selectedIndex].expand.setAttribute("data-show", "0");//classList.add("hidden");
			}
			if (this.expand != null) 
				this.expand.setAttribute("data-show", "1");
			self.select.selectedIndex = this.index;
			this.setAttribute("data-selected", "1");

			self.select.focus();
			self.container.scrollTo(0, this.scrollHeight * self.select.selectedIndex);
			self.container.onkeydown = fnOnItemGet;//function(e) { console.log(e); };
			
			//self.select.options[self.select.selectedIndex].onkeydown = fnGetActiveItem;
			//self.select.options[self.select.selectedIndex].
			
		};
		function fnAddItem(text, label, expand, fnOnGetCallback) {
			if (typeof fnOnGetCallback !== "function")
				fnOnGetCallback = function() { return null; };
			// opt.onkeydown listener
			
			
			var opt = UI.make("div", "popup-option popup-option-doc", self.select, text);
			var optLabel = new UI.make("div", "right autocomplete-descriptor", opt, `\t\t${label}`);
			optLabel.style.paddingLeft = "10px";
			if (expand) { // hidden text that will be expanded when item is activated
				opt.expand = new UI.make("div", "autocomplete-docs", opt, expand);
				opt.expand.setAttribute("data-show", "0");
			}
			opt.fnOnGet = fnOnGetCallback;
			opt.index = self.select.options.length;
			opt.onclick = fnActivateItem;
			opt.name = text;
			opt.isPopup = true;
			//opt.fnOnGet = fnOnGetCallback;
			//opt.onInput = fnOnItemGet;
			opt.ondblclick = fnOnItemGet;
			self.select.options[self.select.options.length] = opt;
			
			
			if (opt.index == 0)
				opt.onclick();
			return opt;
		};
		function fnPopupScroll(event) {
			var dto = new InputEventDto(event);
			if (dto.key == InputEventDto.prototype.KEY_UP || dto.key == InputEventDto.prototype.KEY_DOWN) {
				var prev = self.select.options[self.select.selectedIndex];
				prev.setAttribute("data-selected", "0");
				if (prev.expand != null) 
						prev.expand.setAttribute("data-show", "0");
				if (dto.key == InputEventDto.prototype.KEY_UP)
					self.select.selectedIndex = (self.select.selectedIndex-1+self.select.options.length) % self.select.options.length;
				else 
					self.select.selectedIndex = (self.select.selectedIndex+1) % self.select.options.length;
				var item = self.select.options[self.select.selectedIndex];

				item.setAttribute("data-selected", "1");
				if (item.expand != null) item.expand.setAttribute("data-show", "1");
				self.container.scrollTo(0, item.scrollHeight * self.select.selectedIndex);
				self.select.hiddenField.focus();
				event.stopPropagation();
				event.preventDefault();
			}
		};
		function fnDestroy() {
			self.select.onkeyup = null;
			self.container.remove();
			window.popups[self.name] = null;
			var state = GetEditorState()
			if (state) state.datum.codemirror.focus();
		};
		function fnMove(x, y) {
			self.container.style.left = `${x}px`;
			self.container.style.top = `${y}px`;
		};
		// create popup elements
		this.container = UI.makeUnique("popup", "div", "absolute popup", document.body);
		this.container.isPopup = true;
		this.select = UI.make("div", "", this.container);
		this.select.hiddenField = UI.make("button", "hiddenfield", this.select); // this hidden field is used to focus the autocomplete popup for keyboard events
		this.select.options = [];
		this.select.selectedIndex = 0;
		this.select.isPopup = true;
		this.rect = this.container.getClientRects()[0];
		// 
		this.select.hiddenField.onkeydown = fnPopupScroll;
		this.select.focus = function() { self.select.hiddenField.focus(); }
		// 
		this.destroy = fnDestroy;
		this.add = fnAddItem;
		this.move = fnMove;
		this.container.focus();
		//this.select.focus();
	};
	
	function fnCreateCompletes(state, response) {
		var popup = fnMakePopup(state, response);
		if (response.result && response.result.items) {
			response.result.items.forEach(function(item) {
				popup.add(item.textEdit.newText, item.label, item.documentation, function(m) {
					var start = {
						line: item.textEdit.range.start.line, 
						ch: item.textEdit.range.start.character
					}
					var end = {
						line: item.textEdit.range.end.line, 
						ch: item.textEdit.range.end.character
					}
					state.datum.codemirror.replaceRange(item.textEdit.newText, 
														start, 
														end);
				});
			});
		}
	};

	function fnDoNavigationOpen(item) {
		console.log("uri: ", item.location);
		var tab = null;
		var columns = window.editor.columns.get();
		for(var i = 0; i < columns.length; i++) {
			var tabs = columns[i].editor.tabs.get();
			for(var x = 0; x < tabs.length; x++) {
				var target = tabs[i];
				if (target.datum.path == PathFromURI(item.location.uri)) {
					tab = target;
					break;
				}
			}
		}
		
		function fnTabStuff() {
			var start = {
				line: item.location.range.start.line, 
				ch: item.location.range.start.character
			}
			var end = {
				line: item.location.range.end.line, 
				ch: item.location.range.end.character
			}
			var cm = window.editor.getActiveTabEditor().datum.codemirror;
			cm.markText(start, end, {className: "cm-highlight"});
			cm.scrollIntoView(start, 10);
		};
		if (!tab) {
			var data = {path: PathFromURI(item.location.uri)};
			window.api.open(data);
			listeners.add(data.path, function(event) {
				console.log("something terrible has happened\n", event, item);
				fnTabStuff();
			});
		}
		else {
			console.log("but the file is already open");
			fnTabStuff();
		}

	};
	function fnCreateNavigations(state, response) {
		var popup = fnMakePopup(state, response);
		if (response.result) {
			fnClearNavigation(navList);
			//response.result.forEach(function(item) {
			for(var i = 0; i < response.result.length; i++) {
				var item = response.result[i];
				//console.log(item);
				popup.add(item.name, item.kind).fnOnGet = function(m) {
					//window.api.open({path: PathFromURI(item.location.uri)});
					fnDoNavigationOpen(item);
				};
				fnAddNavigation(item);
			}
		}
	};
	
	function fnMakePopup(state, response) {

		var popup = new LSPClientPopupElement();
		// set popup position relative to cursor
		var cursorDiv = state.datum.codemirror.display.cursorDiv.children[0];
		if (!cursorDiv) return;// doing weird things so ignore i guess
		var rect = cursorDiv.getClientRects()[0];
		var x = rect.x;
		var y = rect.y + 20;
		x = Clamp(x, 0, window.innerWidth - (popup.rect.width));
		y = Clamp(y, 0, window.innerHeight - (popup.rect.height));
		popup.move(x, y);

		if (response.error && response.error.message)
			popup.add(response.error.message, "error").ondblclick = popup.destroy;

		return popup;
	};

	function fnAddNavigation(item) {
		console.log(item);
		var opt = UI.make("option", "", navList, item.name);
		opt.navItem = item;
	};
	function fnClearNavigation() {
		if (navList)
			navList.remove();
		navList = UI.make("select", "relative ui-dropdownlist", window.editor.rowTools);
		navList.onchange = function(e) {
			var item = this.selectedOptions[0];
			if (item.navItem) fnDoNavigationOpen(item.navItem);
		};
		fnAddNavigation({name: "- select symbol -"});
		
		//UI.make("option", "", list, "-- uninitialized --");
	};
	
	
	function LSPClientRender() {
		var self = this;
		listeners = new FileOpenListener();
		this.events = new Map();
		this.eventId = 0;
		this.pluginName = "lsp_client";
		
		var toolbar = window.editor.rowTools;
		fnClearNavigation();
		//navList = UI.make("select", "relative ui-dropdownlist", toolbar);
		//fnAddNavigation({name: "- select symbol -"});
			
		window.addEventListener(`app-plugin-${this.pluginName}`, function(event) {
			//if (
			console.log(`${self.pluginName} received event: `, event);
			var state = GetEditorState();		
			if (state) {
				var {editor, tab, datum} = state;
				var response = event.detail.data;
				//console.log(response);
				var id = self.events.get(response.id);
				self.events.delete(response.id); // delete entry to 'consume' event sp any new requests to id will fail
				if (id == "textDocument/completion") {
					fnCreateCompletes(state, response);
				}
				else if (id == "textDocument/documentSymbol") {
					fnCreateNavigations(state, response);
				}
				else {
					console.warn("unhandled lsp response for '%s' and event id '%i' (map id = %s)", response.method, response.id, id);
				}
			}
		});
		// todo: missing LSP interfaces
		function Position(state) {
			var cursor = state.datum.codemirror.getCursor();
			this.line = cursor.line;
			this.character = cursor.ch;
		};
		function TextDocument(state) {
			this.uri = `file://${state.datum.path}`;
			this.text = state.datum.codemirror.getValue();
			this.version = self.eventId;
		};
		// create a valid LSP request string that main script will send to language server
		function MakeLSPRequest(method, state) {
			var id = self.eventId++;
			var lsp = {
				jsonrpc: "2.0",
				method: method,
				id: id, // main script ignores ID on didOpen/didChange requests
				languageId: GetLanguageIdentifierFromFilename(state.datum.path), // not LSP, tell main script which language server
				params: {}
			}

			if (lsp.method == "textDocument/completion") {
				lsp.params.textDocument = new TextDocument(state);
				lsp.params.position = new Position(state);
			}
			else if (lsp.method == "textDocument/documentSymbol") {
				lsp.params.textDocument = new TextDocument(state);
			}

			self.events.set(id, method);

			window.api.plugin({
				pluginName: self.pluginName, 
				event: "render", 
				request: lsp
			});
		};
		// ^^^
		window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_D], function() {
			var state = GetEditorState();		
			if (state) new MakeLSPRequest("textDocument/documentSymbol", state);
			
		});
		window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_SPACE], function() {
			var state = GetEditorState();		
			if (state) new MakeLSPRequest("textDocument/completion", state);
		});
	};
	new LSPClientRender();
})();