// todo: this is a copy paste from editor.window.js and is just plain uggo
(() => {
	var ProjectFile = {files:[], columns: 1, active_files: [], ignoreDepth: 3,  type: ""}; // active_files: [{file: "", column: 1}]
	function ProjectsRender() {
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
		function fnRebuildFileExplorerList() {
			console.log("rebuilding file list");
			fileExplorerList.remove();
			fileExplorerList = new UI.make("div", "ui-treeview full-width full-height", projectTableBodyRowContent);
			function node(name, depth) {
				this.name = name;
				this.depth = depth || 0;
				this.children = [];
			}
			// oddwarg magic. 
			function parsed(path, parentNode, offset, depth, index) {
				path = NormalizePath(path);
				var separator = path.indexOf("/", offset);
				var name = path.substring(offset);
				if (separator != -1)
					name = path.substring(offset, separator);
				var current = parentNode.children[name];
				if (current == undefined || current == null) {
					parentNode.children[name] = new node(name, depth);
					var ignoreDepth = ProjectFile.ignoreDepth || 0;
					if (depth > ignoreDepth) { // hide some directories from view
						var fileName = [new Array(parentNode.children[name].depth-ignoreDepth).join('\xa0'), name].join('');
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
					parsed(path, parentNode.children[name], separator+1, depth+1, index);
			}
			// todo: sort projectFile.files
			var root = new node("");
			for(var i = 0; i < ProjectFile.files.length; i++) {
				console.log("parsing %s", ProjectFile.files[i]);
				parsed(ProjectFile.files[i], root, 0, 0, i);
			}
		}
		this.fnRebuildFileExplorerList = fnRebuildFileExplorerList;
		function fnOnGetProjectFile(event) {
			try {
				ProjectFile = JSON.parse(event.detail.value);
				ProjectFile.projectFile = event.detail.path;
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
				
		console.log(window.editor);
		var project = UI.make("td", "ui-column-folders", null, null, true);
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

		var projectTableHeadRowContentDiv = new UI.make("div", "full-width", projectTableHeadRowContent);
		
		var menu = window.editor.menu.project;
		menu.add(Lang.Menu.ToggleProjectView, "ui-icon-project", "").onclick = fnToggleProjectViewer;
		menu.add(Lang.Menu.OpenProject, "ui-icon-projectopen", Lang.Menu.OpenProjectHint).onclick = function() {
			fnGetProject();
			fnToggleProjectViewer(true);
		};
		menu.add(Lang.Menu.SaveProject, "ui-icon-projectsave", Lang.Menu.SaveProjectHint).onclick = function() {
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
		menu.add(Lang.Menu.ProjectFileAdd, "", "Add the active file to project").onclick = function() {
			var edit = window.editor.getActiveTabEditor();
			if (edit && edit.datum) {
				self.addFile(edit.datum.path);
			}
			//self.addFile();
		};
		menu.add(Lang.Menu.ProjectFileRemove, "", "Remove the active file from project").onclick = function() {
			var edit = window.editor.getActiveTabEditor();
			if (edit && edit.datum)
				self.removeFile(edit.datum.path);
		};
		
		/*var projectFileInput = UI.make("input", "ui-input ui-input-project", projectTableHeadRowContentDiv);
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
		}*/
		var fileExplorerList = new UI.make("div", "ui-treeview full-width full-height", projectTableBodyRowContent);
		window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_H], fnToggleProjectViewer);// ctrl h
		window.addEventListener('app-plugin-projectview-open', fnOnGetProjectFile);
		window.addEventListener('app-plugin-projectview-save', function() {
			console.log("project file saved?!");
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
			context.add(Lang.Menu.ProjectFileAdd, "" , "").onclick = function() {
				self.addFile(data.details.datum.path);
			};
	};
	
	new ProjectsRender();
})();