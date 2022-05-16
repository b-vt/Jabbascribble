/* todo: idk, things i guess
	the idea behind this class was that window elements will be created here 

	unfortunately there is some spaghetti related to columns and the editor class column */

/* generates window elements, callback hell and general laziness, etc */
function EditorWindow(opts) {
	window.editor = this;
	window.popups = [];
	var self = this;
	opts = (opts === undefined || opts === null) ? {} : opts;
	var ProjectFile = {files:[], columns: 1, active_files: []}; // active_files: [{file: "", column: 1}]
	// 
	var find = new Finder();
	find.fnOnFind = function(f, item) { // fnOnFind callback, used on new searches only
		var edit = GetActiveTabEditor();
		if (edit) {	
			var cm = edit.datum.codemirror;
			var from = cm.doc.getValue();
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
			cm.scrollIntoView({line: next.startLine, ch: 0});//0, item.startLine * 15);
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
	function fnCreateEditorColumns(count) {
		console.log(count);
		var columns = self.columns.get();
		console.log(columns.length);
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
	function fnGetProject(filename) {
		if (filename && filename.length > 0)
			window.api.getProjectFile(filename);
		else
			window.api.getProjectFile();
	};
	/*function fnRebuildFileExplorerList() {
		console.log(ProjectFile);
		// re/populate the files list
		projectFileInput.value = ProjectFile.projectFile;
		fileExplorerList.remove();
		fileExplorerList = new UI.make("select", "ui-select-multi full-width full-height", projectTableBodyRowContent);
		fileExplorerList.setAttribute("multiple", true);
		var dirsplit = ProjectFile.projectFile.split(/[\\\/]/g);
		var basedir = dirsplit[dirsplit.length - 2];
		for(var i = 0; i < ProjectFile.files.length; i++) {
			var filesplit = ProjectFile.files[i].split(/[\\\/]/g);
			var filedir = filesplit[filesplit.length - 2];
			
			var classNames = ["ui-select-icon", "ui-icon-script"];
			var item = new UI.make("option", classNames.join(" "), fileExplorerList, filesplit[filesplit.length - 1]);
			item.src = ProjectFile.files[i];
			((_item, _index) => {
				_item.ondblclick = function() { // open files on double click
					console.log("clicked item: ", this.value);
					window.api.open({path: this.src});
				};
				_item.oncontextmenu = function(event) {
					console.log(event);
					var dto = new InputEventDto(event);
					var w = new ElementContextMenu();
					w.add("remove", "ui-icon-remove", "Remove item from project file").onclick = function() {
						var swap = ProjectFile.files[ProjectFile.length - 1];
						ProjectFile.files[_index] = swap;
						ProjectFile.files.pop();
						fnRebuildFileExplorerList();
					};
					w.show(dto.x, dto.y);
				};
			})(item, i);
		}
	}*/
	function fnRebuildFileExplorerList() {
		
		fileExplorerList.remove();
		fileExplorerList = new UI.make("div", "ui-treeview full-width full-height", projectTableBodyRowContent);
		
		//fileExplorerList.setAttribute("multiple", true);
		
		
		/*
			contents[0] => {name: "/jabbascribble", contents: []};
			contents[0].contents[0] => {name: "/src", contents: []};
			contents[0].contents[0].contents[0] => {name:"/src", contents: []}
			contents[0].contents[0].contents[0].contents[0] => {name:"blah.css", contents: null}
		*/
		function node(name, depth) {
			this.name = name;
			this.depth = depth || 0;
			this.children = [];
		}
		// oddwarg magic. 
		function parsed(path, parentNode, offset, depth, index) {
			console.log(path);
			var separator = path.indexOf("/", offset);
			var name = path.substring(offset);
			if (separator != -1)
				name = path.substring(offset, separator);
			var current = parentNode.children[name];
			if (current == undefined || current == null) {
				parentNode.children[name] = new node(name, depth);
				var classNames = ["ui-select-icon ui-treeview-item", (separator != -1) ? "ui-icon-folder" : "ui-icon-script"];
				var fileName = [new Array(parentNode.children[name].depth).join('\xa0'), name].join('');
				var item = new UI.make("div", classNames.join(" "), fileExplorerList, fileName);
				item.src = path;//ProjectFile.files[itemCount];
				//if ( item is not directory )
				((_item, _index) => {
					_item.onclick = function() {
						
					};
					_item.ondblclick = function() {
						console.log("clicked item: ", _item.src);
						window.api.open({path: _item.src});
					};
					_item.oncontextmenu = function(event) {
						console.log(_item, _index);
						var dto = new InputEventDto(event);
						var w = new ElementContextMenu();
						w.add("remove", "ui-icon-remove", "Remove item from project file").onclick = function() {
							var swap = ProjectFile.files[ProjectFile.files.length - 1];
							var t = ProjectFile.files[_index] = swap;
							console.log(t, swap);
							ProjectFile.files.pop();
							console.log(ProjectFile.files);
							return fnRebuildFileExplorerList();
						};
						w.show(dto.x, dto.y);
					};
				})(item, index);
			}
			if (separator != -1)
				parsed(path, parentNode.children[name], separator+1, depth+1, index);
		}
		
		var root = new node("");
		for(var i = 0; i < ProjectFile.files.length; i++) {
			parsed(ProjectFile.files[i], root, 0, 0, i);
		}
	}
	function fnOnGetProjectFile(event) {
		try {
			ProjectFile = JSON.parse(event.detail.value);
			ProjectFile.projectFile = event.detail.path;
			var projectsplits = ProjectFile.projectFile.split(/[\\\/]/g);
			var basedir = projectsplits[projectsplits.length - 2];
			// sort the files by directory
			var sorts = [];
			
			if (ProjectFile.columns != 1) fnCreateEditorColumns(ProjectFile.columns);
			ProjectFile.active_files.forEach(function(item) {
				console.log("todo:", item);
			});
			
			fnRebuildFileExplorerList(ProjectFile.files);
		}
		catch(e) {
			console.trace(e);
		}
	};
	function fnToggleLineWrap() {
		Config.editor.LineWrapping = !Config.editor.LineWrapping;
		var edit = GetActiveTabEditor();
		if (edit) {
			var cm = edit.datum.codemirror;
			cm.setOption("lineWrapping", Config.editor.LineWrapping);
		}
	};
	function fnToggleProjectViewer() {
		if (project.visible) {
			project.visible = false;
			project.setAttribute("data-show", "0");
		}
		else {
			project.visible = true;
			project.setAttribute("data-show", "1");
			//window.api.getCurrentProject({path: projectFileInput.value});
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
			else {
				context.add("Add file to project", "" , "").onclick = function() {
					console.log("adding %s to project file", details.datum.path);
					if (details.datum.path.length > 2) {
						for(var i = 0; i < ProjectFile.files.length; i++) {
							if (ProjectFile.files[i] == details.datum.path) {
								return console.log("this file is already part of the project");
							}
						}
						ProjectFile.files.push(details.datum.path);
					}
					fnRebuildFileExplorerList();
				};
			}
			
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
			//console.log(this.selectedOptions);
			tab.datum.codemirror.setOption("mode", {name: this.selectedOptions[0].id});
		}
	};
	function fnEditorTabActivate(activator) {
		var editor = self.columns.active().editor;
		if (editor) {
			var tab = editor.tabs.getActive();
			if (tab && tab.datum !== undefined && tab.datum !== null) { // todo: column resize doesn't activate mode */
				//console.log(tab.datum.codemirror.getOption("mode"));
				setEditorModeSelector(activeFileExtension, tab.datum.codemirror.getOption("mode").name);
				//find.reset();
			}
		}
	};
	// just set the select box thingabop to match the active tabs codemirror mode or whatever
	function setEditorModeSelector(selectorElement, mode) {
		for(var i = 0; i < selectorElement.options.length; i++) {
			var optName = selectorElement.options[i].id;
			//console.log("looking for %s found %s", mode, optName);
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
	function resizeEditorColumns() {
		var newValue = parseInt(this.value);
		Config.editor.Columns = newValue;
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
	function GetActiveTabEditor() {
		if (self.columns !== undefined || self.columns !== null) {
			var column = self.columns.active();
			if ((column !== undefined || column !== null) && 
					(column.editor !== undefined || column.editor !== null)) {
						return column.editor.tabs.getActive();
			}
		}
	};

	//var table1 = UI.make("table", "a full-height full-width", table1);
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
			if (dto.modifiers & InputEventDto.prototype.SHIFT)
				find.search(from, this.value, true);
			else
				find.search(from, this.value);
		}
	};
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
	var searchReplaceAll = UI.make("span", "ui-checkbox", footerContents, "");
	UI.make("span", "absolute", searchReplaceAll, " ");
	var searchReplaceAll2 = UI.make("span", "ui-checkbox", footerContents, "");
	UI.make("span", "absolute", searchReplaceAll2, " ");
	// mode change drop down
	var activeFileExtension = this.activeFileExtension = UI.make("select", "right", footerContents);
	activeFileExtension.name = "activeFileExtension";
	activeFileExtension.onchange = fnEditorTabMode;
	UI.make("option", "", activeFileExtension, "Raw");
	UI.makeUnique("javascript", "option", "", activeFileExtension, "JavaScript");
	UI.makeUnique("text/x-c++src", "option", "", activeFileExtension, "C/C++");
	UI.makeUnique("xml", "option", "", activeFileExtension, "HTML");
	UI.makeUnique("css", "option", "", activeFileExtension, "CSS");
	UI.makeUnique("java", "option", "", activeFileExtension, "Java");
	UI.makeUnique("php", "option", "", activeFileExtension, "Gross, PHP");
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
	
	var file = menu.add(Lang.Menu.File);
	//file.add();
	file.add(Lang.Menu.Open, "ui-icon-open", Lang.Menu.OpenHint).onclick = fnOpenFile;
	file.add(Lang.Menu.OpenProject, "ui-icon-projectopen", Lang.Menu.OpenProjectHint).onclick = function() {
		//window.api.getProjectFile();
		fnGetProject();
	};
	file.add(Lang.Menu.New, "ui-icon-new", Lang.Menu.NewHint).onclick = fnNewFile;
	file.add(Lang.Menu.Save, "ui-icon-save", Lang.Menu.SaveHint).onclick = fnSaveCurrent;
	file.add(Lang.Menu.SaveProject, "ui-icon-projectsave", Lang.Menu.SaveProjectHint).onclick = function() {
		window.api.saveProjectFile({project: ProjectFile, columns: Config.editor.Columns});
	};
	file.add();
	file.add(Lang.Menu.Quit, "ui-icon-close", Lang.Menu.QuitHint).onclick = function() {
		window.api.quit();
	};
	
	var edit = menu.add(Lang.Menu.Edit);
	//edit.add();
	edit.add(Lang.Menu.ToggleLineWrap, Config.editor.LineWrapping ? "ui-icon-check" : "", Lang.Menu.ToggleLineWrapHint).onclick = function() {
		fnToggleLineWrap();
		if (Config.editor.LineWrapping)
			this.container.children[0].classList.add("ui-icon-check");
		else
			this.container.children[0].classList.remove("ui-icon-check");
														
	};
	
	var view = menu.add(Lang.Menu.View);
	//view.add();
	var columnsSlider = UI.make("input", "relative ui-menu-slider", view.add(Lang.Menu.Columns, "ui-icon-columns", Lang.Menu.ColumnsHint).container);
	columnsSlider.type = "range";
	columnsSlider.min = 1;
	columnsSlider.max = 4;
	columnsSlider.value = Config.editor.Columns;
	columnsSlider.oninput = resizeEditorColumns;
	view.add("Toggle Project Viewer", "ui-icon-project", "").onclick = fnToggleProjectViewer
	view.add(Lang.Menu.OpenRenderConsole, "ui-icon-console", Lang.Menu.OpenRenderConsoleHint).onclick = function(event, data) {
		window.api.toggleConsole(true);
	};
	
	// initialize the editor
	this.columns = new ElementColumns(columnsTableBody);
	//this.project = new ElementColumn(this.columns, this.columns.container);
	//this.project.table.classList.remove("full-width");
	//this.project.container.style.width = "1px";
	var project = UI.make("td", "ui-column-folders", this.columns.container);
	project.setAttribute("data-show", "0");
	var projectTable = new UI.make("table", "ui-column-folders full-height full-width", project);
	var projectTableHead = new UI.make("thead", "", projectTable);
	var projectTableBody = new UI.make("tbody", "full-height", projectTable);
	var projectTableFoot = new UI.make("tfoot", "", projectTable);
	var projectTableHeadRow = new UI.make("tr", "", projectTableHead);
	var projectTableBodyRow = new UI.make("tr", "full-height", projectTableBody);
	var projectTableFootRow = new UI.make("tr", "", projectTableFoot);
	var projectTableHeadRowContent = new UI.make("td", "", projectTableHeadRow);
	var projectTableBodyRowContent = new UI.make("td", "", projectTableBodyRow);
	var projectTableFootRowContent = new UI.make("td", "", projectTableFootRow);
	
	var projectTableHeadRowContentDiv = new UI.make("div", "full-width", projectTableHeadRowContent);
	var projectFileInput = UI.make("input", "ui-input ui-input-project", projectTableHeadRowContentDiv);
	projectFileInput.value = ".scribble";
	projectFileInput.onkeyup = function(event) {
		var e = new InputEventDto(event);
		if (e.key == InputEventDto.prototype.KEY_RETURN) {
			fnGetProject(projectFileInput.value);
		}
	}
	var projectFileInputSearch = UI.make("button", "ui-input-project-button", projectTableHeadRowContentDiv, "load");
	projectFileInputSearch.onclick = function(event) {
		fnGetProject(projectFileInput.value);
	}
	var fileExplorerList = new UI.make("div", "ui-treeview full-width full-height", projectTableBodyRowContent);
	
	/*
	
	from
	
	/jabbascribble/src/file.js
	/jabbascribble/.scribble
	/jabbascribble/bin/test.js
	/jabbascribble/src/blah.css
	/jabbascribble/src/src/something.js
	
	to
	
	/jabbascribble
		/src
			/src
				something.js
			file.js
			blah.css
		/bin
			test.js
		.scribble
	
	*/
	
	
	/*var fileExplorerList = new UI.make("select", "ui-select-multi full-width full-height", projectTableBodyRowContent);
	fileExplorerList.setAttribute("multiple", true);*/
	/*var projectContents = new UI.make("div", "full-height", this.project);
	this.fileExplorerList = new UI.make("select", "ui-select-multi full-width full-height", projectContents);
	this.fileExplorerList.setAttribute("multiple", true);*/
	
	//var bleh = new ElementColumn(null, this.project.content);
	//var label = new UI.make("div", "ui-column-folders", bleh.content, "blah");
	
	
	new ElementIconButton(this.rowTools, "ui-icon-open", Lang.Menu.OpenHint).onclick = fnOpenFile;
	new ElementIconButton(this.rowTools, "ui-icon-new", Lang.Menu.NewHint).onclick = fnNewFile
	new ElementIconButton(this.rowTools, "ui-icon-save", Lang.Menu.SaveHint).onclick = fnSaveCurrent;
	new ElementIconButton(this.rowTools, "ui-icon-bin-empty", Lang.GarbageCollectionHint).onclick = function() {
		window.api.gc();
	};
	fnCreateEditorColumns(Config.editor.Columns);
	
	
	/*window.addEventListener("app-plugin", function(event) {
		try {

			if (event.detail.name == "ternjs") {
				if (popup != null) {
					popup.destroy();
				}

				var edit = self.columns.active().editor;
				var tabdatum = edit.tabs.getActive().datum;
				var cm = tabdatum.codemirror;
				var position = { line: cm.getCursor().line, ch: cm.getCursor().ch };

				var x = cm.display.cursorDiv.children[0].offsetLeft + 30;
				var y = cm.display.cursorDiv.children[0].offsetTop + 110;

				x = Clamp(x, 0, window.innerWidth - 425);
				y = Clamp(y, 0, window.innerHeight - 250);
				var completions = JSON.parse(event.detail.data).completions;
				if (completions.length > 0)
					popup = new ElementPopup(x, y, completions);
			}

			//fnAutoCompletions(JSON.parse(event.detail));
		}
		catch(e) {
			console.trace(e);
		}
	});*/
	//var popup = null;
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
	globalHotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_H], fnToggleProjectViewer);// ctrl h
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
	
	/*globalHotkeys.add(InputEventDto.prototype.CTRL, [32], function(e) { // ctrl + space
		var edit = self.columns.active().editor;
		if (edit.tabs.get().length > 0) {
			var tabdatum = edit.tabs.getActive().datum;
			var cm = tabdatum.codemirror;*/
			/*var position = { line: cm.getCursor().line, ch: cm.getCursor().ch };

			var x = cm.display.cursorDiv.children[0].offsetLeft + 30;
			var y = cm.display.cursorDiv.children[0].offsetTop + 110;

			x = Clamp(x, 0, window.innerWidth - 425);
			y = Clamp(y, 0, window.innerHeight - 250);*/
/*
			if (cm.getOption("mode").name == "javascript" || 1 == 1) {
				console.log("javascript ternjs thing");
				var plug = {
					name: "ternjs",
					msg: {
						src: cm.getValue(),
						name: tabdatum.path,
						text: cm.getLine(cm.getCursor().line)
					}
				};
				window.api.plugin(plug);
			}
		}
	});*/

	// cleanup temporary elements on escape and mouse clicks
	window.addEventListener('keyup', function(event) {
		var dto = new InputEventDto(event);
		if (dto.key == InputEventDto.prototype.KEY_ESCAPE) {
			find.reset();
			searchInput.value = "";
			searchReplace.value = "";
			for(var popup in window.popups) {
				console.log("??");
				if (typeof window.popups[popup].destroy === "function")
					window.popups[popup].destroy();
			}
		}
	});
	window.addEventListener('mouseup', function(event) {
		var e = new InputEventDto(event);
		//find.reset();
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
	window.addEventListener('app-getprojectfile', fnOnGetProjectFile);
	window.addEventListener('app-saveprojectfile', function() {
		
	});
	window.addEventListener('app-pluginload', function(event) {
		LoadScript(event.detail.script);
	});
};
