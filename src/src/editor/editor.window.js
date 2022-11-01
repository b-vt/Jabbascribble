/* todo: idk, things i guess
	the idea behind this class was that window elements will be created here 

	unfortunately there is some spaghetti related to columns and the editor class column */

/* generates window elements, callback hell and general laziness, etc */
function EditorWindow(opts) {
	opts = (opts === undefined || opts === null) ? {} : opts;
	window.editor = this; // exposed for lazy 
	window.popups = [];
	var self = this;
	this.plugins = []; // map of active plugins

	var find = new Finder();
	find.fnOnFind = function(f, item) { // fnOnFind callback, used on new searches only
		var edit = GetActiveTabEditor();
		if (edit) {	
			var cm = edit.datum.codemirror;
			var className = "cm-highlight";
			if (item.id == 0) {
				className = "cm-highlight-focused";
				//cm.scrollIntoView({line: item.startLine, ch: 0});
			}
			cm.doc.markText({line: item.startLine, ch: item.startCh},
											{line: item.endLine, ch: item.endCh},
											{className: className});
		}
	};
	find.fnOnRepeat = function(f, next, prev) { // fnNext callback, used on duplicate search
		console.log("onRepeat");
		var edit = GetActiveTabEditor();
		if (edit) {	
			var cm = edit.datum.codemirror;
			cm.scrollIntoView({line: next.startLine, ch: 0}, 10);//0, item.startLine * 15);
			var mark1 = cm.doc.findMarksAt({line: next.startLine, ch: next.startCh})[0];
			var mark2 = cm.doc.findMarksAt({line: prev.startLine, ch: prev.startCh})[0];
			if (mark1) mark1.clear();
			if (mark2) mark2.clear();

			cm.doc.markText({line: prev.startLine, ch: prev.startCh},
											{line: prev.endLine, ch: prev.endCh},
											{className: "cm-highlight"});
			cm.doc.markText({line: next.startLine, ch: next.startCh},
											{line: next.endLine, ch: next.endCh},
											{className: "cm-highlight-focused"});
		}
	};
	find.fnOnReset = function(f) { // fnReset
		var edit = GetActiveTabEditor();
		if (edit) {	
			var cm = edit.datum.codemirror;
			cm.doc.getAllMarks().forEach(function(mark) {
				mark.clear();
			});
		}
	};
	
	function fnClearPopups() {
		for(var popup in window.popups) {
			if (window.popups[popup] && (typeof window.popups[popup].destroy === "function"))
				window.popups[popup].destroy();
		}
	}
	function fnCreateEditorColumns(count) {
		console.log(count, "?!?!");
		var columns = self.columns.get();
		while (columns.length > 0) {
			var column = columns.pop();
			column.editor.destroy();
			column.editor = null;
			column = null;
			tabs = null;
			column = null;
		}
		for(var i = 0; i < count; i ++) {
			var col = self.columns.add();
			col.editor = new ElementEditorColumn(col).init(Config.editor.Columns-1>i?1:0, fnEditorTabActivate);
		};
		// remove or add a resizer to the first column
		var tmpGetColumn = self.columns.get(0);
		if (self.columns.get().length == 1) {
			tmpGetColumn.editor.destroyResizer();
		}
		else if (tmpGetColumn !== undefined && tmpGetColumn !== null && tmpGetColumn.editor.resizer == null) {
			tmpGetColumn.editor.appendResizer();
		}
		columnsSlider.value = count;
	};
	
	this.fnCreateEditorColumns = fnCreateEditorColumns;
	
	function fnToggleLineWrap() {
		Config.editor.LineWrapping = !Config.editor.LineWrapping;
		var edit = GetActiveTabEditor();
		if (edit) {
			var cm = edit.datum.codemirror;
			cm.setOption("lineWrapping", Config.editor.LineWrapping);
		}
	};
	
	function fnTabContextMenus(context, details) {
		var edit = GetActiveTabEditor();
		if (edit) {
			var cm = edit.datum.codemirror;
			if (!details.isTab) {
				var selections = cm.doc.getSelection();
				if (selections.length > 0) {
					var tmpSel = selections.substring(10, 0);
					context.add("Copy selection to clipboard", "", "", true).onclick = function() {
						navigator.clipboard.writeText(selections);
					};
					context.add(`highlight selection \"${tmpSel}...\"`, "", "", true).onclick = function() {
						console.log("selected junko: %s", selections);
						find.search(cm.doc.getValue(), selections, true);
					};
				}
				context.add(Lang.Menu.ToggleLineWrap, Config.editor.LineWrapping ? "ui-icon-check" : "" , Lang.Menu.ToggleLineWrapHint).onclick = fnToggleLineWrap;
				context.add(Lang.Menu.OpenFileLocation, "ui-icon-folder-explore", Lang.Menu.OpenFileLocationHint).onclick = function() {
					console.log(edit.datum);
					if (edit.datum.path == undefined) return;
					var splits = edit.datum.path.split(/[\\/]/g);
					console.log(splits);
					splits.pop();
					window.api.openFileLocation({path: splits.join("/")});
				};
			}
			for(var p in self.plugins) {
				var plug = self.plugins[p];
				if (typeof plug.onContextMenu === "function")
					plug.onContextMenu(context, {data: edit.datum, details: details});
			};
			
		};
	};
	function fnSetIdentationMode() {
		var activeEditor = self.columns.active().editor;
		if (activeEditor !== null && activeEditor.tabs.getActive() !== null) {
			var tab = activeEditor.tabs.getActive();
			Config.editor.IndentWithTabs = !Config.editor.IndentWithTabs;
			if (Config.editor.IndentWithTabs) {
				self.indentation.classList.replace("ui-icon-unhappy", "ui-icon-happy");
				tab.datum.codemirror.setOption("indentWithTabs", true);
			}
			else {
				self.indentation.classList.replace("ui-icon-happy", "ui-icon-unhappy");
				tab.datum.codemirror.setOption("indentWithTabs", false);
			}
		}
	};
	function fnEditorTabMode(event) {
		var activeEditor = self.columns.active().editor;
		if (activeEditor !== null && activeEditor.tabs.getActive() !== null) {
			var tab = activeEditor.tabs.getActive();
			tab.datum.mode = this.selectedOptions[0].id;
			//console.log(this.selectedOptions);
			var mode = tab.datum.mode;
			console.log("mode is: ", mode);
			/*if (mode == "java"){// || mode == "php") {
				mode = "text/x-c++src";
			}*/
			tab.datum.codemirror.setOption("mode", {name: mode});//tab.datum.mode});
		}
	};
	function fnEditorTabActivate(activator) {
		var editor = self.columns.active().editor;
		if (editor) {
			var tab = editor.tabs.getActive();
			if (tab && tab.datum !== undefined && tab.datum !== null) { // todo: column resize doesn't activate mode */
				//console.log(tab.datum.codemirror.getOption("mode"));
				if (tab.datum.mode == null)
					tab.datum.mode = tab.datum.codemirror.getOption("mode").name;
				setEditorModeSelector(activeFileExtension, tab.datum.mode);
				//find.reset();
			}
		}
	};
	// just set the select box thingabop to match the active tabs codemirror mode or whatever
	function setEditorModeSelector(selectorElement, mode) {
		for(var i = 0; i < selectorElement.options.length; i++) {
			var optName = selectorElement.options[i].id;
			if (optName === mode) {
				selectorElement.selectedIndex = i;
				break;
			}
		}
	};
	function fnSaveCurrent() {
		var column = self.columns.active();
		if (column !== null) {
			var tab = column.editor.tabs.getActive();
			if (tab !== null) {
				window.api.save({path: tab.datum.path, value: tab.datum.codemirror.getValue(), id: tab.datum.id});
			}
		}
	};
	function fnNewFile() {
		var column = self.columns.active();
		if (column !== null)
			column.editor.addTab(Lang.NewTab, "", fnTabContextMenus);
	};
	function fnOpenFile() {
		window.api.open();
	};
	// todo: this is garbage
	function resizeEditorColumns(evt, num) {
		var newValue = num || parseInt(this.value);
		Config.editor.Columns = newValue;
		console.log(Config.editor.Columns);
		var columns = self.columns.get();
		var tmpTabs = [];

		while (columns.length > 1) { // remove old columns, except column 0
			var column = columns.pop();
			var tabs = column.editor.tabs.get();
			while(tabs.length > 0) { // shuffle tabs into column 0
				var tab = tabs.pop();
				if (tab !== undefined && tab !== null) {
					tab.refresh();
					var cmPath = tab.datum.path;
					var cmValue = tab.datum.codemirror.getValue().toString();
					tab.destroy();
					self.columns.get()[0].editor.addTab(cmPath!==undefined?cmPath: Lang.NewTab, cmValue, fnTabContextMenus);					
				}
			};
			column.editor.destroy();
			column.editor = null;
			column = null;
			tabs = null;
			column = null;
		}
		// add columns
		for(var x = 1; x < newValue; x++) {
			var newColumn = self.columns.add();
			newColumn.editor = new ElementEditorColumn(newColumn);//
			newColumn.editor.init(self.columns.get().length < Config.editor.Columns ? true : false, fnEditorTabActivate);
			newColumn = null;
		}
		// remove or add a resizer to the first column
		var tmpGetColumn = self.columns.get(0);
		if (self.columns.get().length == 1) {
			tmpGetColumn.editor.destroyResizer();
		}
		else if (tmpGetColumn !== undefined && tmpGetColumn !== null && tmpGetColumn.editor.resizer == null) {
			tmpGetColumn.editor.appendResizer();
		}
	};	
	this.fnResizeEditorColumns = resizeEditorColumns;
	
	function GetActiveTabEditor() {
		if (self.columns !== undefined || self.columns !== null) {
			var column = self.columns.active();
			if ((column !== undefined || column !== null) && 
					(column.editor !== undefined || column.editor !== null)) {
						return column.editor.tabs.getActive();
			}
		}
		return null;
	};
	this.getActiveTabEditor = GetActiveTabEditor;

	function ScrollActiveTab(v) {
		var edit = GetActiveTabEditor();
		if (edit) {
			var cm = edit.datum.codemirror;
			//var v = parseInt(this.value);
			if (isNaN(v)) v = 0;
			cm.scrollIntoView({line: Clamp(v - 1, 0, cm.lineCount() - 1), ch: 0}, 10);
		}
	};
	
	this.scrollActiveTab = ScrollActiveTab;

	this.head = UI.make("thead", "");//, "", table1);
	this.body = UI.make("tbody", "ui-row-columns");//, table1);
	this.footer = UI.make("tfoot");//, "", table1);

	var rowMenu = UI.make("tr", "bordered", this.head);
	this.rowMenu = UI.make("td", "zero-height ui-row-menu no-padding no-margin", rowMenu);
	
	var rowColumns = UI.make("tr", "bordered", this.body);
	var rowTd = UI.make("td", "", rowColumns);
	// parent for edits and tabs
	var columnsTable = UI.make("table", "collapsed full-width full-height", rowTd);
	var columnsTableBody = UI.make("tbody", "", columnsTable);

	var rowFooter = UI.make("tr", "bordered", this.footer);
	this.rowFooter = UI.make("td", "zero-height ui-row-footer no-padding no-margin", rowFooter);
	var rowTools = UI.make("tr", "", this.head);
	this.rowTools = UI.make("td", "zero-height ui-row-toolbar no-padding no-margin", rowTools);
	var footerContents = UI.make("div", "", this.rowFooter, "");
	this.footerContents = footerContents;
	
	var searchInput = UI.make("input", "ui-input", footerContents);
	searchInput.placeholder = Lang.EditSearchPlaceholder;
	searchInput.title = Lang.EditSearchHint;
	searchInput.onkeyup = function(event) {
		var dto = new InputEventDto(event);
		if (dto.key == InputEventDto.prototype.KEY_RETURN) {
			var from = "";
			var edit = GetActiveTabEditor();
			if (edit) {
				var cm = edit.datum.codemirror;
				var selection = cm.doc.getSelection();
				from = cm.doc.getValue();
			}
			var wcase = searchCaseSensitive.checked;
			console.log(wcase);
			if (dto.modifiers & InputEventDto.prototype.SHIFT)
				find.search(from, this.value, true, wcase);
			else
				find.search(from, this.value, false, wcase);
		}
	};
	new UI.make("span", "", footerContents, " ");
	var searchReplace = UI.make("input", "ui-input", footerContents);
	searchReplace.placeholder = Lang.EditSearchReplacePlaceholder;
	searchReplace.title = Lang.EditSearchReplaceHint;
	searchReplace.onkeyup = function(event) {
		var dto = new InputEventDto(event);
		if (dto.key == InputEventDto.prototype.KEY_RETURN) {
			var edit = GetActiveTabEditor();
			if (edit) {
				var cm = edit.datum.codemirror;
				var selection = cm.doc.getSelection();
				var from = cm.doc.getValue();
				cm.doc.setValue(from.replace(searchInput.value, this.value));
			}
		}
	};	
	var searchCaseSensitive = UI.makeUnique("scase", "input", "ui-checkbox", footerContents);
	searchCaseSensitive.setAttribute("type", "checkbox");
	searchCaseSensitive.checked = true;
	var searchCaseSensitiveLabel = UI.make("label", "", footerContents, "Case Sensitive");
	searchCaseSensitiveLabel.setAttribute("for", "scase");
	//UI.make("span", "absolute", searchReplaceAll2, " ");
	// mode change drop down
	var activeFileExtension = this.activeFileExtension = UI.make("select", "right", footerContents);
	activeFileExtension.name = "activeFileExtension";
	activeFileExtension.onchange = fnEditorTabMode;
	UI.make("option", "", activeFileExtension, "Raw");
	UI.makeUnique("modetest", "option", "", activeFileExtension, "Mode test");
	UI.makeUnique("javascript", "option", "", activeFileExtension, "JavaScript");
	UI.makeUnique("text/x-c++src", "option", "", activeFileExtension, "C/C++");
	UI.makeUnique("xml", "option", "", activeFileExtension, "HTML");
	UI.makeUnique("css", "option", "", activeFileExtension, "CSS");
	UI.makeUnique("text/x-java", "option", "", activeFileExtension, "Java");
	UI.makeUnique("text/x-php", "option", "", activeFileExtension, "Gross, PHP");
	UI.makeUnique("shell", "option", "", activeFileExtension, "Shell");

	// indentation space or tabs toggle
	var css = ["ui-icon"];
	if (Config.editor.IndentWithTabs)
		css.push("ui-icon-happy");
	else
		css.push("ui-icon-unhappy");
	var indentation = this.indentation = UI.make("div", css.join(" "), UI.make("div", "ui-icon-container right", footerContents));
	indentation.onmouseup = fnSetIdentationMode;

	var menu = new ElementMenu(this.rowMenu);
	this.menu = {this: menu}; // exposing for plugins
	
	var file = menu.add(Lang.Menu.File);
	this.menu.file = file;
	file.add();
	file.add(Lang.Menu.Open, "ui-icon-open", Lang.Menu.OpenHint).onclick = fnOpenFile;
	
	file.add(Lang.Menu.New, "ui-icon-new", Lang.Menu.NewHint).onclick = fnNewFile;
	file.add(Lang.Menu.Save, "ui-icon-save", Lang.Menu.SaveHint).onclick = fnSaveCurrent;
	file.add();
	file.add(Lang.Menu.Quit, "ui-icon-close", Lang.Menu.QuitHint).onclick = function() {
		window.api.quit();
	};
	
	var edit = menu.add(Lang.Menu.Edit);
	this.menu.edit = edit;
	edit.add();
	edit.add(Lang.Menu.ToggleLineWrap, Config.editor.LineWrapping ? "ui-icon-check" : "", Lang.Menu.ToggleLineWrapHint).onclick = function() {
		fnToggleLineWrap();
		if (Config.editor.LineWrapping)
			this.container.children[0].classList.add("ui-icon-check");
		else
			this.container.children[0].classList.remove("ui-icon-check");
														
	};
	
	var view = menu.add(Lang.Menu.View);
	this.menu.view = view;
	view.add();
	var columnsSlider = UI.make("input", "relative ui-menu-slider", view.add(Lang.Menu.Columns, "ui-icon-columns", Lang.Menu.ColumnsHint).container);
	columnsSlider.type = "range";
	columnsSlider.min = 1;
	columnsSlider.max = 4;
	columnsSlider.value = Config.editor.Columns;
	columnsSlider.oninput = resizeEditorColumns;
	view.add(Lang.Menu.OpenRenderConsole, "ui-icon-console", Lang.Menu.OpenRenderConsoleHint).onclick = function(event, data) {
		window.api.toggleConsole(true);
	};
	
	this.menu.project = menu.add(Lang.Menu.Project);
	this.menu.project.add();
	this.menu.plugins = menu.add(Lang.Menu.Plugins);
	this.menu.plugins.add();
	// initialize the editor
	this.columns = new ElementColumns(columnsTableBody);

	new ElementIconButton(this.rowTools, "ui-icon-open", Lang.Menu.OpenHint).onclick = fnOpenFile;
	new ElementIconButton(this.rowTools, "ui-icon-new", Lang.Menu.NewHint).onclick = fnNewFile
	new ElementIconButton(this.rowTools, "ui-icon-save", Lang.Menu.SaveHint).onclick = fnSaveCurrent;
	new ElementIconButton(this.rowTools, "ui-icon-bin-empty", Lang.GarbageCollectionHint).onclick = function() {
		window.api.gc();
	};
	fnCreateEditorColumns(Config.editor.Columns);
	// these are global hotkeys i guess idk
	this.hotkeys = new Hotkeys(); 
	var globalHotkeys = this.hotkeys;
	/*globalHotkeys.onKeyDown = function(inputDto) {
		var pluginMsg = {
			event: "hotkey",
			msg: inputDto
		};
		window.api.plugin(pluginMsg);
		console.log(inputDto);
	};*/
	globalHotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_S], fnSaveCurrent);// ctrl + s
	globalHotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_N], fnNewFile); // ctrl + n
	globalHotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_O], fnOpenFile); // ctrl + o
	globalHotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_F], function() {
		var from = "";
		var edit = GetActiveTabEditor();
		if (edit) {
			var cm = edit.datum.codemirror;
			var selection = cm.doc.getSelection();
			from = cm.doc.getValue();
		}
		searchInput.value = selection || searchInput.value;
		searchInput.focus();
		searchInput.select();
		find.search(from, searchInput.value);
	});
	globalHotkeys.add(InputEventDto.prototype.CTRL | InputEventDto.prototype.SHIFT, [InputEventDto.prototype.KEY_F], function() {
		var from = "";
		var edit = GetActiveTabEditor();
		if (edit) {
			var cm = edit.datum.codemirror;
			var selection = cm.doc.getSelection();
			from = cm.doc.getValue();
		}
		searchInput.value = selection || searchInput.value;
		searchInput.focus();
		searchInput.select();
		find.search(from, searchInput.value, true);
	});
	globalHotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_G], function() {
		if (window.popups["gotoprompt"])
			window.popups["gotoprompt"].destroy();
		var p = UI.make("span", "", null, null, true);
		window.popups["gotoprompt"] = p;
		var fc = footerContents.children[0];
		footerContents.insertBefore(p, fc);
		footerContents.insertBefore(UI.make("span", "", p, " ", true), fc);
		var input = UI.make("input", "ui-input ui-input-number", p);

		p.isPopup = true;
		input.isPopup = true;

		p.destroy = function() {
			this.remove();
		};
		/*p.style.x = "-10px";
		p.style.y = "-50px";*/
		input.onkeyup = function(event) {
			var dto = new InputEventDto(event);
			if (dto.key == InputEventDto.prototype.KEY_RETURN) {
				var from = "";
				p.destroy();
			}
			ScrollActiveTab(parseInt(this.value));
			/*var edit = GetActiveTabEditor();
			if (edit) {
				var cm = edit.datum.codemirror;
				var v = parseInt(this.value);
				if (isNaN(v)) v = 0;
				cm.scrollIntoView({line: Clamp(v - 1, 0, cm.lineCount() - 1), ch: 0}, 10);
			}*/
		};
		input.focus();
		input.select();
	});
	// cleanup temporary elements on escape and mouse clicks
	window.addEventListener('keyup', function(event) {
		var dto = new InputEventDto(event);
		if (dto.key == InputEventDto.prototype.KEY_ESCAPE) {
			find.reset();
			searchInput.value = "";
			searchReplace.value = "";
			fnClearPopups();
		}
	});
	window.addEventListener('mouseup', function(event) {
		var e = new InputEventDto(event);
		//console.log(event.target)
		//find.reset();
		if (!event.target.isPopup)
			fnClearPopups();
	});
	
	// event listeners from preload script
	window.addEventListener('app-tab-save', function(event) {
		self.columns.columns.forEach(function(column) { // todo: tab id is already included so column id should be too to save time
			column.editor.tabs.tabs.forEach(function(tab) {
				if (event.detail.id == tab.datum.id) {
					tab.datum.modifier = ""; // remove * from title and update tab datum
					tab.refresh(event.detail);
				}
			});
		});
	});
	
	window.addEventListener("app-open", function(event) { // file open event
		self.columns.active().editor.addTab(event.detail.path, event.detail.value, fnTabContextMenus);
	});
	window.addEventListener('app-pluginload', function(event) {
		LoadScript(event.detail.script);
	});
};
