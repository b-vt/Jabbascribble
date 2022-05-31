// todo: this is a copy paste from editor.window.js and is just plain uggo
(() => {
	var ProjectFile = {files:[], columns: 1, active_files: [], type: ""}; // active_files: [{file: "", column: 1}]
	function ProjectsRender() {
		this.name = "projects";
		window.editor.plugins[this.name] = this;	
		// todo: project files list needs to be sorted
		function fnGetProject(filename) {
			if (filename && filename.length > 0)
				window.api.getProjectFile(filename);
			else
				window.api.getProjectFile();
		};
		function fnRebuildFileExplorerList() {
			fileExplorerList.remove();
			fileExplorerList = new UI.make("div", "ui-treeview full-width full-height", projectTableBodyRowContent);
			function node(name, depth) {
				this.name = name;
				this.depth = depth || 0;
				this.children = [];
			}
			// oddwarg magic. 
			function parsed(path, parentNode, offset, depth, index) {
				console.log(path);
				path = NormalizePath(path);
				var separator = path.indexOf("/", offset);
				var name = path.substring(offset);
				if (separator != -1)
					name = path.substring(offset, separator);
				var current = parentNode.children[name];
				if (current == undefined || current == null) {
					parentNode.children[name] = new node(name, depth);
					if (depth > Config.ProjectViewIgnoreDepth) {
						var classNames = ["ui-select-icon ui-treeview-item", (separator != -1) ? "ui-icon-folder" : "ui-icon-script"];
						var fileName = [new Array(parentNode.children[name].depth-Config.ProjectViewIgnoreDepth).join('\xa0'), name].join('');
						var item = new UI.make("div", classNames.join(" "), fileExplorerList, fileName);
						//new UI.make("br", "", fileExplorerList, "");
						item.src = path;
						((_item, _index) => {
							_item.onclick = function() {

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
										//console.log(_item.src);
										window.api.inheritJavascript(_item.src);
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
				parsed(ProjectFile.files[i], root, 0, 0, i);
			}
		}
		this.fnRebuildFileExplorerList = fnRebuildFileExplorerList;
		function fnOnGetProjectFile(event) {
			try {
				ProjectFile = JSON.parse(event.detail.value);
				ProjectFile.projectFile = event.detail.path;
				var projectsplits = ProjectFile.projectFile.split(/[\\\/]/g);
				var basedir = projectsplits[projectsplits.length - 2];
				// sort the files by directory
				var sorts = [];

				if (ProjectFile.columns != 1) {
					window.editor.fnCreateEditorColumns(ProjectFile.columns); // todo: this is a terrible hack to fix column and the position of the project viewer
					window.editor.fnResizeEditorColumns(null, ProjectFile.columns);
					project.visible = true;
					project.setAttribute("data-show", "1");
				}
				ProjectFile.active_files.forEach(function(item) {
					console.log("todo:", item);
				});

				fnRebuildFileExplorerList(ProjectFile.files);
			}
			catch(e) {
				console.trace(e);
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
		
		var project = UI.make("td", "ui-column-folders", window.editor.columns.container);
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
		
		var menu = window.editor.menu.this.add("Project");
		menu.add(Lang.Menu.OpenProject, "ui-icon-projectopen", Lang.Menu.OpenProjectHint).onclick = function() {
			fnGetProject();
		};
		menu.add(Lang.Menu.SaveProject, "ui-icon-projectsave", Lang.Menu.SaveProjectHint).onclick = function() {
			ProjectFile.columns = Config.editor.Columns;
			window.api.saveProjectFile({project: ProjectFile});
			console.log(ProjectFile);
		};
		
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

		
		window.editor.menu.view.add("Toggle Project Viewer", "ui-icon-project", "").onclick = fnToggleProjectViewer
		window.addEventListener('app-getprojectfile', fnOnGetProjectFile);
		window.editor.hotkeys.add(InputEventDto.prototype.CTRL, [InputEventDto.prototype.KEY_H], fnToggleProjectViewer);// ctrl h
	};
	ProjectsRender.prototype.onContextMenu = function(context, data) {
		var self = this;
		var details = data.details;
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
			self.fnRebuildFileExplorerList();
		};
	};
	new ProjectsRender();
})();