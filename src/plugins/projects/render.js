// todo: this is a copy paste from editor.window.js and is just plain uggo
(() => {
	
	
	var ProjectFile = {projectLanguage: "", projectDirectory: "", projectFile: "", files:[], columns: 1, active_files: [], ignoreDepth: 3, runCommands: []}; // active_files: [{file: "", column: 1}]	
	
	// is filename.txt in project file and if so what is the absolute path?
	function fnIsProjectFile(name) {
		for(var i = 0; i < ProjectFile.files.length; i++) {
			var item = ProjectFile.files[i];
			var itemSplits = item.split(/[\\\/]/g);
			if (itemSplits.pop() == name) {
				return item;
			}
		};
		return name;
	};
	
	function fnRunCommands() {
		window.api.plugin({
			pluginName: "projectview", event: "render", request: {
				type: "spawn",
				projectFile: ProjectFile
			}
		});
	};

	function ProjectsRender() {
		function ElementModalTabPane(context, text) {
			var self = this;
			this.select = UI.make("div", "ui-list-item", context.left);
			this.fnActivate = null;
			UI.make("div", "", this.select, text);
			this.select.onmouseup = function(event) {
				((ctx) => {
				var prev = ctx.selected;
				if (ctx.selected) {
					ctx.selected.setAttribute("data-highlighted", "0");
					ctx.selected = null;
				}
				if (prev != self.select) {
					self.select.setAttribute("data-highlighted", "1");
					ctx.selected = self.select;
				}
				if (ctx.right.children.length > 0)
					ctx.right.removeChild(ctx.right.children[0]);
				/*console.log(ctx.right.children);
				for(var i = 0; i < ctx.right.children.length; i++) {
					ctx.right.children[i].remove();
				};*/
				console.log(ctx.right.children);
				//self.contents = new UI.make("div", "", context.right, "?!?"); // i get cleaned up

				if (typeof self.fnActivate == "function")
					self.fnActivate();

				})(context);
			}
		};

		var selectedRunCommand = null;
		function createRunCommandElements(container, input) {
			var containers = new UI.make("div", "", container);
			for(var i = 0; i < ProjectFile.runCommands.length; i++) {
				((index, _input) => {
					var indexItem = ProjectFile.runCommands[index];
					var itemContainer = new UI.make("div", "ui-list-item", containers);
					var item = new UI.make("div", "", itemContainer, indexItem);
					item.onmouseup = function() {
						_input.value = indexItem;
					};
					var itemBtn = new ElementIconButton(item, "ui-icon-reddelete", "Remove this line");
					itemBtn.container.className = `${itemBtn.container.className} ui-input-rbutton2 absolute`;
					itemBtn.onclick = function() {
						var rmIndex = ProjectFile.runCommands.indexOf(indexItem);
						if (!(rmIndex >= 0)) return;
						ProjectFile.runCommands.splice(rmIndex, 1);
						containers.remove();
						createRunCommandElements(container, _input);
					};
					new UI.make("span", "clearfix", item);
				})(i, input);
			};
		};

		function ElementModalProjectOptions() {
			var self = this;
			this.container = UI.make("div", "absolute modal", document.body);
			this.popup = UI.make("div", "bordered child-window child-window-project-settings", this.container);

			var table1_1 = UI.make("table", "absolute collapsed full-width full-height", this.popup);//popupContents);
			var tbody1_1 = UI.make("tbody", "", table1_1);
			var tr1_1 = UI.make("tr", "", tbody1_1);
			var td1_1 = UI.make("td", "", tr1_1);
			var td2_1 = UI.make("td", "full-width", tr1_1);
			var tr2_1 = UI.make("tr", "ui-modal-footer", tbody1_1);
			var td3_1 = UI.make("td", "", tr2_1);
			td3_1.setAttribute("colspan", "3");

			this.left = UI.make("div", "bordered full-height ui-container-resizable ui-container-projectsettings", td1_1);
			this.right = UI.make("div", "bordered full-height ui-scrollable", td2_1);
			//var rightContents = UI.make("div", "", right);

			var footer = new UI.make("div", "full-width", td3_1);
			var buttons = new UI.make("div", "", footer, "");

			var close = new UI.make("span", "ui-modal-button right", buttons, "close");
			var load = UI.make("div", "ui-modal-button right", buttons, "load");
			load.setAttribute("data-dir", "1");
			var save = new UI.make("span", "ui-modal-button right", buttons, "save");
			close.setAttribute("data-dir", "2");
			save.setAttribute("data-dir", "0");
			this.selected = null;
			var projectSettings = new ElementModalTabPane(this, "Settings");
			projectSettings.fnActivate = function(element) {
				var contents = new UI.make("div", "padded", self.right); // i get deleted
				var contentProjectPathLabel = new UI.make("div", "ui-label", contents, "Currently loaded project file:");
				var contentProjectPath = new UI.make("input", "ui-input ui-input right", contentProjectPathLabel);//, ProjectFile.columns);
				contentProjectPath.value = ProjectFile.projectFile;
				
				// 
				var currentProjectDirectoryLabel = new UI.make("div", "ui-label", contents, "Working project directory:");
				var currentProjectDirectory = new UI.make("input", "ui-input ui-input right", currentProjectDirectoryLabel);//, 
				currentProjectDirectory.value = ProjectFile.projectDirectory;
				currentProjectDirectory.onkeyup = function () {
					ProjectFile.projectDirectory = currentProjectDirectory.value;
				};
				
				// last elements due 
				var defaultProjectDefaults = new UI.make("div", "ui-label", contents, "Use example run command as default:");
				var contentProjectPathLabel = new UI.make("br", "", defaultProjectDefaults, "");
				defaultProjectDefaults.title = "These examples will most likely require editing in Run Command tab";
				

				/* some default project things go here
				*/
				var projectDefaultsJavascript = new UI.make("span", "ui-modal-button right", defaultProjectDefaults, "Javascript");
				projectDefaultsJavascript.setAttribute("data-dir", "2");
				var projectDefaultsElectron = new UI.make("span", "ui-modal-button right", defaultProjectDefaults, "Electron");
				projectDefaultsElectron.setAttribute("data-dir", "1");
				var projectDefaultsCpp = new UI.make("span", "ui-modal-button right", defaultProjectDefaults, "C++");
				projectDefaultsCpp.setAttribute("data-dir", "1");
				var projectDefaultsC = new UI.make("span", "ui-modal-button right", defaultProjectDefaults, "C");
				projectDefaultsC.setAttribute("data-dir", "0");

				projectDefaultsJavascript.onmouseup = function() {
					ProjectFile.runCommands = [`node my_file.js`];
				};
				projectDefaultsElectron.onmouseup = function() {
					ProjectFile.runCommands = [`electron my_page.html`, `electron my_file.js`];
				};
				projectDefaultsC.onmouseup = function() {
					ProjectFile.runCommands = ["gcc -o3 -g -o my_program my_source.c", "./my_program"];
				};
				projectDefaultsCpp.onmouseup = function() {
					ProjectFile.runCommands = ["echo \"1\"", "echo \"2\"", "echo \"3\"", "echo \"4\""];
					//ProjectFile.runCommands.push(`echo \"no default run command available for c++\"`);
				};
			};
			var defaultView = new ElementModalTabPane(this, "View");
			defaultView.fnActivate = function(element) {
				var contents = new UI.make("div", "padded", self.right); // i get deleted
				var contentItemColumnsLabel = new UI.make("div", "ui-label", contents, "Number of editor columns:");
				var contentItemColumns = new UI.make("input", "ui-input ui-input-number right", contentItemColumnsLabel);//, ProjectFile.columns);
				contentItemColumns.value = ProjectFile.columns;
				var contentItemDepthLabel = new UI.make("div", "ui-label", contents, "Ignore first #n directories in file path:\n");
				var contentItemDepth = new UI.make("input", "ui-input ui-input-number right", contentItemDepthLabel);//, ProjectFile.ignoreDepth);
				contentItemDepth.value = ProjectFile.ignoreDepth;
				contentItemDepth.onkeyup = function(event) {
					ProjectFile.ignoreDepth = parseInt(this.value);
				};
				contentItemColumns.onkeyup = function(event) {
					ProjectFile.columns = parseInt(this.value);
				};
				//files:[], columns: 1, active_files: [], ignoreDepth: 3, runCommands: []
			};
			var runCommands = new ElementModalTabPane(this, "Run Commands");
			runCommands.fnActivate = function(element) {
				var paneTable = new UI.make("table", "full-width ", self.right); // i get deleted
				var paneTableHeader = new UI.make("thead", "bordered", paneTable);
				var paneTableHeaderRow = new UI.make("tr", "bordered", paneTableHeader);
				var paneTableHeaderRowData = new UI.make("td", "bordered", paneTableHeaderRow);
				var paneTableBody = new UI.make("tbody", "", paneTable);

				var paneTableRow1 = new UI.make("tr", "bordered", paneTableBody);
				var paneTableRowData1 = new UI.make("td", "bordered", paneTableRow1);

				var contentItemCmdLabel = new UI.make("div", "relative full-width ui-input-button", paneTableHeaderRowData);
				var contentItemCmd = new UI.make("input", "relative ui-input full-width", contentItemCmdLabel);//, ProjectFile.columns)
				contentItemCmd.placeholder = "Add new command to the run list";

				createRunCommandElements(paneTableRowData1, contentItemCmd);

				var addBtn = new ElementIconButton(contentItemCmdLabel, "ui-icon-greenadd", "Add a new run command");
				addBtn.onclick = function() {
					if (!(contentItemCmd.value.length > 0)) return;
					ProjectFile.runCommands.push(contentItemCmd.value);
					paneTableRowData1.children[0].remove();
					createRunCommandElements(paneTableRowData1, contentItemCmd);
					contentItemCmd.value = "";
				};
				contentItemCmd.onkeyup = function(event) {
					var dto = new InputEventDto(event);
					if (dto.key == InputEventDto.prototype.KEY_ENTER)
						addBtn.onclick();
				};
				console.log(addBtn);
				addBtn.container.className = `${addBtn.container.className} absolute ui-input-rbutton`;

			};
			projectSettings.select.onmouseup(); // sets the default activated pane
			new UI.make("span", "", buttons);

			close.onmouseup = function (event) {
				self.container.remove();
			};

			save.onmouseup = function(event) {
				console.log("saving project file", ProjectFile);
				window.api.plugin({
					pluginName: "projectview", event: "render", request: {
						type: "save",
						project: ProjectFile
					}
				});
			};
			load.onmouseup = function(event) {
				console.log("TODO: load needs to repopulate fields with loaded values instead of forcing the user to reopen project settings");
				fnGetProject();
				fnToggleProjectViewer(true);
				self.container.remove();
			};

		};
		//new ElementModalProjectOptions();
		
		var self = this;
		this.pluginName = "projectview";
		window.editor.plugins[this.pluginName] = this;
		this.projectFile = ProjectFile;
		// todo: project files list needs to be sorted
		function fnGetProject(filename) {
			console.log("did open?");
			if (filename && filename.length > 0)
				window.api.plugin({
					pluginName: self.pluginName, event: "render", request: {
						type: "open",
						path: filename
					}
				});
				//window.api.getProjectFile(filename);
			else
				window.api.plugin({
					pluginName: self.pluginName, event: "render", request: {
						type: "open"
					}
				});
				//window.api.getProjectFile();
		};
		this.fnGetProject = fnGetProject;
		function fnRebuildFileExplorerList(mfiles) {
			console.log("rebuilding file list");
			fileExplorerList.remove();
			fileExplorerList = new UI.make("div", "ui-treeview full-height", projectTableBodyRowContent);
			function node(name, depth) {
				this.name = name;
				this.depth = depth || 0;
				this.children = new Map();
			}
			// oddwarg magic. 
			function parsed(path, parentNode, offset, depth, index) {
				path = NormalizePath(path);
				var separator = path.indexOf("/", offset);
				var name = path.substring(offset);
				if (separator != -1)
					name = path.substring(offset, separator);
				console.log(parentNode);
				var current = parentNode.children.get(name);
				if (current == undefined || current == null) {
					parentNode.children.set(name, new node(name, depth));
					//[name] = new node(name, depth);
					var ignoreDepth = ProjectFile.ignoreDepth || 0;
					if (depth > ignoreDepth) { // hide some directories from view
						var fileName = [new Array(parentNode.children.get(name).depth-ignoreDepth).join('\xa0'), name].join('');
						var fnSplits = fileName.split(/[.]/g);
						var ext = fnSplits[fnSplits.length - 1];
						console.log(ext);
						var classNames = ["ui-select-icon ui-treeview-item"];
						if (separator != -1) {
							classNames.push("ui-icon-folder");
						}
						else {
							switch (ext) {
								case "js": {
									classNames.push("ui-icon-js");
									break;
								}
								case "c":
								case "h":{
									classNames.push("ui-icon-c");
									break;
								}
								case "cpp":
								case "hpp":{
									classNames.push("ui-icon-cpp");
									break;
								}
								case "css": {
									classNames.push("ui-icon-css");
									break;
								}
								case "html": {
									classNames.push("ui-icon-html");
									break;
								}
								default: {
									classNames.push("ui-icon-script");
									break;
								}
							}
							
						}
						var item = new UI.make("div", classNames.join(" "), fileExplorerList, fileName);
						item.src = path;
						item.ext = ext;
						((_item, _index) => {
							_item.onclick = function() {
								// todo
							};
							_item.ondblclick = function() {
								window.api.open({path: _item.src});
							};
							_item.oncontextmenu = function(event) {
								var dto = new InputEventDto(event);
								var w = new ElementContextMenu();
								var extSplits = _item.src.split(/[.]/g);
								var ext =extSplits[ extSplits.length - 1];
								if (ext === "js") {
									w.add("Inherit From", "ui-icon-inherit", "").onclick = function() {
										console.log(_item.src);
									};
								}
								w.add();
								w.add("remove", "ui-icon-remove", "Remove item from project file").onclick = function() {
									var swap = ProjectFile.files[ProjectFile.files.length - 1];
									var t = ProjectFile.files[_index] = swap;
									ProjectFile.files.pop();
									return fnRebuildFileExplorerList();
								};

								w.show(dto.x, dto.y);
							};
						})(item, index);
					}
				}
				if (separator != -1)
					parsed(path, parentNode.children.get(name), separator+1, depth+1, index);
			}
			var root = new node("");
			var files = ArrayAlphabeticalSort(mfiles||ProjectFile.files);
			for(var i = 0; i < files.length; i++) {
				parsed(files[i], root, 0, 0, i);
			}
		}
		this.fnRebuildFileExplorerList = fnRebuildFileExplorerList;
		function fnOnGetProjectFile(event) {
			try {
				ProjectFile = JSON.parse(event.detail.value);
				// initialize any missing properties that a ProjectFile should have or prepare for tears later
				ProjectFile.projectFile = event.detail.path;
				ProjectFile.runCommands = ProjectFile.runCommands || [];
				ProjectFile.files = ProjectFile.files || [];
				ProjectFile.columns = ProjectFile.columns || 1;
				ProjectFile.active_files = ProjectFile.active_files || [];
				ProjectFile.ignoreDepth = ProjectFile.ignoreDepth || 3;
				ProjectFile.projectDirectory = ProjectFile.projectDirectory || "";
				
				self.projectFile = ProjectFile;
				var projectsplits = ProjectFile.projectFile.split(/[\\\/]/g);
				var basedir = projectsplits[projectsplits.length - 2];
				if (ProjectFile.columns != 1) {
					window.editor.fnCreateEditorColumns(ProjectFile.columns); // todo: this is a terrible hack to fix column and the position of the project viewer
					window.editor.fnResizeEditorColumns(null, ProjectFile.columns);
					//project.visible = true;
					//project.setAttribute("data-show", "1");
					fnToggleProjectViewer(true);
				}
				ProjectFile.active_files.forEach(function(item) {
					console.log("todo:", item);
				});

				fnRebuildFileExplorerList();//ProjectFile.files);
			}
			catch(e) {
				console.trace(e);
			}
		};
		function fnToggleProjectViewer(v) {
			if (v == true || v == false) {
				project.visible = v;
				project.setAttribute("data-show", v ? "true" : "false");
				return;
			}
			if (project.visible) {
				project.visible = false;
				project.setAttribute("data-show", "0");
			}
			else {
				project.visible = true;
				project.setAttribute("data-show", "1");
			}
		};
		var project = UI.make("td", "ui-column-folders", null, null, true);
		/*project.style.borderTop = "1px solid #383933";
		project.style.borderLeft = "1px solid #383933";
		project.style.borderBottom = "2px solid #383933";*/
		window.editor.columns.container.parentElement.children[0].prepend(project); // force the view tree thing to appear on the left side
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

		var projectTableHeadRowContentDiv = new UI.make("div", "", projectTableHeadRowContent);
		var projectTableFootRowContentDiv = new UI.make("div", "", projectTableFootRowContent);
		projectTableFootRowContentDiv.style.padding = "0px 12px 0px 0px";
		var filesSearch = new UI.make("input", "full-width ui-input", projectTableFootRowContentDiv);
		filesSearch.placeholder = Lang.Plugins.Projects.ProjectFileSearch;
		filesSearch.title = Lang.Plugins.Projects.ProjectFileSearchHint;
		filesSearch.onkeyup = function(event) {
			var tmpFiles = [];
			for(var i = 0; i < ProjectFile.files.length; i++) {
				var file = ProjectFile.files[i];
				var exp = new RegExp(`(${this.value.toLowerCase()})`, "g");
				if (file.toLowerCase().match(exp)) {
					tmpFiles.push(file);
				}
			};
			if (this.value.length > 0)
				fnRebuildFileExplorerList(tmpFiles);
			else
				fnRebuildFileExplorerList();
		};
		
		var menu = window.editor.menu.project;
		menu.add("Run Commands").onclick = fnRunCommands;
		menu.add("Project Settings", "", "Open the project file editor").onclick = function() {
			new ElementModalProjectOptions();
		};
		menu.add(Lang.Plugins.Projects.OpenProject, "ui-icon-projectopen", Lang.Plugins.Projects.OpenProjectHint).onclick = function() {
			fnGetProject();
			fnToggleProjectViewer(true);
		};
		menu.add(Lang.Plugins.Projects.SaveProject, "ui-icon-projectsave", Lang.Plugins.Projects.SaveProjectHint).onclick = function() {
			ProjectFile.columns = Config.editor.Columns;
			//window.api.saveProjectFile({project: ProjectFile});
			window.api.plugin({
				pluginName: self.pluginName, event: "render", request: {
					type: "save",
					project: ProjectFile
				}
			});
			console.log(ProjectFile);
		};
		menu.add(Lang.Plugins.Projects.ProjectFileAdd, "", "Add the active file to project").onclick = function() {
			var edit = window.editor.getActiveTabEditor();
			if (edit && edit.datum) {
				self.addFile(edit.datum.path);
			}
			//self.addFile();
		};
		menu.add(Lang.Plugins.Projects.ProjectFileRemove, "", "Remove the active file from project").onclick = function() {
			var edit = window.editor.getActiveTabEditor();
			if (edit && edit.datum)
				self.removeFile(edit.datum.path);
		};
		menu.add();
		menu.add(Lang.Plugins.Projects.ToggleProjectView, "ui-icon-project", Lang.Plugins.Projects.ToggleProjectViewHint).onclick = fnToggleProjectViewer;
		menu.add(Lang.Plugins.Projects.ToggleConsole, "ui-icon-project", Lang.Plugins.Projects.ToggleConsoleHint).onclick = fnToggleConsole;;

		var fileExplorerList = new UI.make("div", "ui-treeview full-width full-height", projectTableBodyRowContent);
		window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_H], fnToggleProjectViewer);// ctrl h
		window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_R], fnRunCommands);
		window.addEventListener('app-plugin-projectview-open', fnOnGetProjectFile);
		window.addEventListener('app-plugin-projectview-save', function() {
			console.log("project file saved?!");
		});
		
		var output = null;
		var outputDestroyBtn = null;
		
		function fnRemoveInput() {
			output.children[output.children.length - 1].remove();// the input element
		};
		function fnAddInput() {
			var input = new UI.make("input", "ui-output-input full-width color-lime", output, "");
			input.placeholder = ">";
			
			input.onkeydown = function(event) {
				var dto = new InputEventDto(event);
				if (dto.key == InputEventDto.prototype.KEY_ENTER) {
					if (this.value.length > 1) {
						window.api.plugin({
							pluginName: "projectview", event: "render", request: {
								type: "spawn",
								projectFile: {runCommands: this.value.split("&&")}
							}
						});
					}
					else {
						fnAddOutput("color-lime", `> ${this.value}`);
					}
				}
			};
			input.focus();
		};
		function fnAddOutput(style, msg) {
			//if (output != null)
				//return new UI.make("div", style, output, msg);
			if (output != null) {
				fnRemoveInput();
				var line = new UI.make("div", style, output, msg);
				fnAddInput();
				return line;
			};
		};
		var toggled = false;
		function fnToggleConsole() {
			toggled = !toggled;
			if (output != null) {
				if (toggled) {
					output.parentElement.children[1].setAttribute("data-show", "1"); // button container
					output.setAttribute("data-show", "1");
				}
				else {
					output.parentElement.children[1].setAttribute("data-show", "0"); // button container
					output.setAttribute("data-show", "0");
				}
			}
			else {
				fnCreateOutput();
			};
			fnForceOutputRepaint(output);
		}
		function fnForceOutputRepaint(output) {
			// force a repaint...
			//window.resizeTo(window.outerWidth, window.outerHeight);
			window.resizeTo(window.outerWidth, window.outerHeight-1);
			window.resizeTo(window.outerWidth, window.outerHeight+1);
			// and scroll to the bottom of the output

		}
		function fnCreateOutput(fromClear) {
			var p = window.editor.footerContents.parentElement;
			if (output == null) {
				var outputResize = new UI.make("div", "ui-output-resizer full-width", p);
				outputResize.onmousedown = function(e) {
					var dto = new InputEventDto(e);
					var init = {y: dto.y, height: output.clientHeight};
					window.onmousemove = function(evt) {
						var dto = new InputEventDto(evt);
						output.style.height = `${(init.y - dto.y) + init.height + 10}px`;
						fnForceOutputRepaint();
					};
					window.onmouseup = function(evt) {
						window.onmousemove = null;
						window.onmouseup = null;
						console.log("cleaned up the thing");
					};
				};
				output = new UI.make("div", "bordered ui-output relative full-width", p);
				output.style.height = `100px`;
				var btnContainer = new UI.make("div", "", outputResize);
				var outputClearBtn = new ElementIconButton(btnContainer, "ui-icon-bin-empty ", "Clear contents of output window");
				var outputDestroyBtn = new ElementIconButton(btnContainer, "ui-icon-reddelete ", "Close this output window");
				var outputStopBtn = new ElementIconButton(btnContainer, "ui-icon-cancel ", "Stop any spawned process");
				outputDestroyBtn.onclick =function() {
					output.remove();
					outputResize.remove();
					output = null;
					//setTimeout(function () {
					window.api.plugin({
						pluginName: self.pluginName, event: "render", request: {
							type: "spawn-kill"
						}
					});
					setTimeout(fnForceOutputRepaint, 100);
				};
				outputStopBtn.onclick = function() {
					window.api.plugin({
						pluginName: self.pluginName, event: "render", request: {
							type: "spawn-kill"
						}
					});
				};
				outputClearBtn.onclick = function() {
					output.remove();
					outputResize.remove();
					output = null;
					fnCreateOutput(true);
					fnAddOutput("color-lime", "output cleared");//new UI.make("div", "", output, "cleared");
				}
				toggled = true;
				//fnAddOutput("", `stderr 00:12:50 ccls           initialize.cc:298 I initializationOptions: {"compilationDatabaseCommand":"","compilationDatabaseDirectory":"","cache":{"directory":".ccls-cache","format":"binary","hierarchicalPath":false,"retainInMemory":2},"capabilities":{"documentOnTypeFormattingProvider":{"firstTriggerCharacter":"}","moreTriggerCharacter":[]},"foldingRangeProvider":true,"workspace":{"workspaceFolders":{"supported":true,"changeNotifications":true}}},"clang":{"excludeArgs":[],"extraArgs":[],"pathMappings":[],"resourceDir":""},"client":{"diagnosticsRelatedInformation":true,"hierarchicalDocumentSymbolSupport":true,"linkSupport":true,"snippetSupport":true},"codeLens":{"localVariables":true},"completion":{"caseSensitivity":2,"detailedLabel":true,"dropOldRequests":true,"duplicateOptional":true,"filterAndSort":true,"include":{"blacklist":[],"maxPathSize":30,"suffixWhitelist":[".h",".hpp",".hh",".inc"],"whitelist":[]},"maxNum":100,"placeholder":true},"diagnostics":{"blacklist":[],"onChange":1000,"onOpen":0,"onSave":0,"spellChecking":true,"whitelist":[]},"highlight":{"largeFileSize":2097152,"lsRanges":false,"blacklist":[],"whitelist":[]},"index":{"blacklist":[],"comments":2,"initialNoLinkage":false,"initialBlacklist":[],"initialWhitelist":[],"maxInitializerLines":5,"multiVersion":0,"multiVersionBlacklist":[],"multiVersionWhitelist":[],"name":{"suppressUnwrittenScope":false},"onChange":false,"parametersInDeclarations":true,"threads":0,"trackDependency":2,"whitelist":[]},"request":{"timeout":5000},"session":{"maxNum":10},"workspaceSymbol":{"caseSensitivity":1,"maxNum":1000,"sort":true},"xref":{"maxNum":2000}}`);
				fnAddInput();
				return true;
			};
			return false;
		};
		window.addEventListener('app-plugin-projectview-output', function(data) {
			var d = data.detail;
			//var p = window.editor.footerContents.parentElement;
			/*function fnForceOutputRepaint(output) {
				// force a repaint...
				//window.resizeTo(window.outerWidth, window.outerHeight);
				window.resizeTo(window.outerWidth, window.outerHeight-1);
				window.resizeTo(window.outerWidth, window.outerHeight+1);
				// and scroll to the bottom of the output
				
			}*/
			/*function fnCreateOutput(fromClear) {
				if (output == null) {
					var outputResize = new UI.make("div", "ui-output-resizer full-width", p);
					outputResize.onmousedown = function(e) {
						var dto = new InputEventDto(e);
						var init = {y: dto.y, height: output.clientHeight};
						window.onmousemove = function(evt) {
							var dto = new InputEventDto(evt);
							output.style.height = `${(init.y - dto.y) + init.height + 10}px`;
							fnForceOutputRepaint();
						};
						window.onmouseup = function(evt) {
							window.onmousemove = null;
							window.onmouseup = null;
							console.log("cleaned up the thing");
						};
					};
					output = new UI.make("div", "bordered ui-output relative full-width", p);
					output.style.height = `100px`;
					var btnContainer = new UI.make("div", "", outputResize);
					outputClearBtn = new ElementIconButton(btnContainer, "ui-icon-bin-empty ", "Clear contents of output window");
					outputDestroyBtn = new ElementIconButton(btnContainer, "ui-icon-reddelete ", "Close this output window");
					outputStopBtn = new ElementIconButton(btnContainer, "ui-icon-cancel ", "Stop any spawned process");
					outputDestroyBtn.onclick =function() {
						output.remove();
						outputResize.remove();
						output = null;
						//setTimeout(function () {
						window.api.plugin({
							pluginName: self.pluginName, event: "render", request: {
								type: "spawn-kill"
							}
						});
						setTimeout(fnForceOutputRepaint, 100);
					};
					outputStopBtn.onclick = function() {
						window.api.plugin({
							pluginName: self.pluginName, event: "render", request: {
								type: "spawn-kill"
							}
						});
					};
					outputClearBtn.onclick = function() {
						output.remove();
						outputResize.remove();
						output = null;
						fnCreateOutput(true);
						fnAddOutput("color-lime", "output cleared");//new UI.make("div", "", output, "cleared");
					}
					toggled = true;
					//fnAddOutput("", `stderr 00:12:50 ccls           initialize.cc:298 I initializationOptions: {"compilationDatabaseCommand":"","compilationDatabaseDirectory":"","cache":{"directory":".ccls-cache","format":"binary","hierarchicalPath":false,"retainInMemory":2},"capabilities":{"documentOnTypeFormattingProvider":{"firstTriggerCharacter":"}","moreTriggerCharacter":[]},"foldingRangeProvider":true,"workspace":{"workspaceFolders":{"supported":true,"changeNotifications":true}}},"clang":{"excludeArgs":[],"extraArgs":[],"pathMappings":[],"resourceDir":""},"client":{"diagnosticsRelatedInformation":true,"hierarchicalDocumentSymbolSupport":true,"linkSupport":true,"snippetSupport":true},"codeLens":{"localVariables":true},"completion":{"caseSensitivity":2,"detailedLabel":true,"dropOldRequests":true,"duplicateOptional":true,"filterAndSort":true,"include":{"blacklist":[],"maxPathSize":30,"suffixWhitelist":[".h",".hpp",".hh",".inc"],"whitelist":[]},"maxNum":100,"placeholder":true},"diagnostics":{"blacklist":[],"onChange":1000,"onOpen":0,"onSave":0,"spellChecking":true,"whitelist":[]},"highlight":{"largeFileSize":2097152,"lsRanges":false,"blacklist":[],"whitelist":[]},"index":{"blacklist":[],"comments":2,"initialNoLinkage":false,"initialBlacklist":[],"initialWhitelist":[],"maxInitializerLines":5,"multiVersion":0,"multiVersionBlacklist":[],"multiVersionWhitelist":[],"name":{"suppressUnwrittenScope":false},"onChange":false,"parametersInDeclarations":true,"threads":0,"trackDependency":2,"whitelist":[]},"request":{"timeout":5000},"session":{"maxNum":10},"workspaceSymbol":{"caseSensitivity":1,"maxNum":1000,"sort":true},"xref":{"maxNum":2000}}`);
					return true;
				};
				return false;
			};*/

			fnCreateOutput();

			var classname = "";
			if (d.isError) classname = "color-red";
			if (d.cmd) fnAddOutput("color-lime", `> ${d.cmd}`);//new UI.make("div", "color-lime", output, `> ${d.cmd}`);
			if (d.data)
				var lines = d.data.split(/[\n]/g) || [];
			else
				var lines = [];

			for(var i = 0; i < lines.length; i++)
				if (lines[i].length > 0) {
					((_line) => {
						var hasClick = false;
						var ns = _line.split(/:/g);
						if (ns.length > 3) { // is this a gcc style error?
							var msgType = ns[3].toLowerCase().trim();
							var errMatch = msgType.match(/(error)/g);
							if (errMatch != null && errMatch.length > 0) {// is this an error?
								//console.log("this is an error line");
								hasClick = true;
								classname += " pointer-link";
							};
						};
						var item = fnAddOutput(classname, _line);//new UI.make("div", classname, output, _line);
						// todo: this is horrible and can lead to disasters
						if (hasClick) {
							item.onclick = function() {
								// check if tab contains filename
								// if not, open
								// then scroll?
								var errfile = ns[0].trim();
								var errLine = parseInt(ns[1].trim());
								var errCh = parseInt(ns[2].trim());
								var errFilenameSplits = errfile.split(/[\\\/]/g);
								var errFilename = errFilenameSplits.pop();
								var columns = window.editor.columns.get();
								for(var i = 0; i < columns.length; i++) { // walk through all the columns
									var tabs = window.editor.columns.get(i).editor.tabs.get();
									for(var z = 0; z < tabs.length; z++) { // walk through all the tabs in column i
										var openTabName = tabs[z].datum.name;
										//console.log("this one is: %s", tabs[z].datum.path, tabs[z].datum.name);
										if (openTabName == errFilename) {
											var edit = window.editor.getActiveTabEditor();
											if (edit) {
												var cm = edit.datum.codemirror;
												tabs[z].activate();
												window.editor.scrollActiveTab(errLine);
												cm.doc.markText({line: errLine-1, ch: 0},
																{line: errLine-1, ch: errCh},
																{className: "cm-highlight-focused"});
											};
											return;
										};
									};
								};
								// file isn't already open, so open and then dothe thing?
								var absFilePath = fnIsProjectFile(errfile);
								window.api.open({path: absFilePath});
								setTimeout(function() { // a stinky timeout because opening a file is an asynchronous action
									var edit = window.editor.getActiveTabEditor();
									if (edit) {
										var cm = edit.datum.codemirror;
										edit.activate();
										window.editor.scrollActiveTab(errLine);
										cm.doc.markText({line: errLine-1, ch: 0},
														{line: errLine-1, ch: errCh},
														{className: "cm-highlight-focused"});

									};
								}, 500);
							};
						};
					})(lines[i]);
				}
			fnForceOutputRepaint();
			output.scrollTo(0, output.scrollHeight);
		});
	};
	ProjectsRender.prototype.removeFile = function(path) {
		var swap = ProjectFile.files[ProjectFile.files.length - 1];
		for(var i = 0; i < ProjectFile.files.length; i++) {
			var filename = ProjectFile.files[i];
			if (filename == path) {
				ProjectFile.files[i] = swap;
				ProjectFile.files.pop();
				return this.fnRebuildFileExplorerList();
			}
		}
	};
	ProjectsRender.prototype.addFile = function(path) {
		var self = this;
		console.log("adding %s to project file", path, ProjectFile);
		if (path.length > 2) {
			for(var i = 0; i < ProjectFile.files.length; i++) {
				if (ProjectFile.files[i] == path) {
					return console.log("this file is already part of the project");
				}
			}
			ProjectFile.files.push(path);
			console.log("did the thing");
		}
		this.fnRebuildFileExplorerList();
	};
	ProjectsRender.prototype.onContextMenu = function(context, data) {
		var self = this;
		var details = data.details;
		if (data.details.datum.path)
			context.add(Lang.Plugins.Projects.ProjectFileAdd, "" , "").onclick = function() {
				self.addFile(data.details.datum.path);
			};
	};
	
	new ProjectsRender();
})();