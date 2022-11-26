function WindowPrefs(editor) {
	editor.menu.file.add(Lang.Menu.Preferences, "ui-icon-book", Lang.Menu.PreferencesHint).onclick = this.openPrefsEditor;
	
	
	
}

WindowPrefs.prototype.openPrefsEditor = function() {
	// todo: this should be a class of its own probably
	function AddCheckboxOption(parent, labelString, initialValue, onChange) {
		var label = new UI.make("label", "ui-label", parent, labelString);
		label.for = GetRandomString();
		var checkbox = new UI.make("input", "ui-checkbox right", label);
		checkbox.id = label.for;
		checkbox.type = "checkbox";
		checkbox.checked = initialValue;
		checkbox.onchange = onChange;
		var br = new UI.make("br", "clearfix", parent);
	};
	function AddInputOption(parent, className, labelString, initialValue, onChange) {
		var label = new UI.make("div", "ui-label", parent, labelString);
		var input = new UI.make("input", `ui-input right ${className}`, label);
		input.value = initialValue;
		input.onkeydown = onChange;
	};
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
			if (typeof self.fnActivate == "function")
				self.fnActivate();
			})(context);
		}
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

			var generalTab = new ElementModalTabPane(this, "General");
			generalTab.fnActivate = function(element) {
				var contents = new UI.make("div", "padded", self.right); // i get deleted
				AddInputOption(contents, "", "Temp directory path:", Config.TempDir, function() {
					Config.TempDir = this.value;
				});
				AddInputOption(contents, "", "(unused?) Source directory path:", Config.SrcDir, function() {
					Config.TempDir = this.value;
				});
				AddInputOption(contents, "", "Current Language: ", Config.Lang, function() {
					Config.TempDir = this.value;
				});
				var todo1 = new UI.make("div", "ui-label", contents, "todo: array of languages for lang?");
				AddCheckboxOption(contents, "Enable developers console on startup:", Config.EnableDevTools, function() {
					Config.EnableDevTools = this.checked;
				});
				AddCheckboxOption(contents, "Enable debug flag:", Config.Debug, function() {
					Config.Debug = this.checked;
				});
				AddInputOption(contents, "ui-input-number", "Tabs scroll speed:", Config.TabsScrollDelta, function() {
					Config.TabsScrollDelta = this.value;
				});
				
				
				//var contentTestLabel = new UI.make("div", "ui-label", contents, "Something goes here");
				
				/*var contentProjectPathLabel = new UI.make("div", "ui-label", contents, "Currently loaded project file:");
				var contentProjectPath = new UI.make("input", "ui-input ui-input right", contentProjectPathLabel);//, ProjectFile.columns);
				//contentProjectPath.value = ProjectFile.projectFile;
				
				// 
				var currentProjectDirectoryLabel = new UI.make("div", "ui-label", contents, "Working project directory:");
				var currentProjectDirectory = new UI.make("input", "ui-input ui-input right", currentProjectDirectoryLabel);//, 
				//currentProjectDirectory.value = ProjectFile.projectDirectory;
				currentProjectDirectory.onkeyup = function () {
					//ProjectFile.projectDirectory = currentProjectDirectory.value;
				};
				
				// last elements due 
				var defaultProjectDefaults = new UI.make("div", "ui-label", contents, "Use example run command as default:");
				var contentProjectPathLabel = new UI.make("br", "", defaultProjectDefaults, "");
				defaultProjectDefaults.title = "These examples will most likely require editing in Run Command tab";
				
				*/
				/* some default project things go here
				*/
				/*var projectDefaultsJavascript = new UI.make("span", "ui-modal-button right", defaultProjectDefaults, "Javascript");
				projectDefaultsJavascript.setAttribute("data-dir", "2");
				var projectDefaultsElectron = new UI.make("span", "ui-modal-button right", defaultProjectDefaults, "Electron");
				projectDefaultsElectron.setAttribute("data-dir", "1");
				var projectDefaultsCpp = new UI.make("span", "ui-modal-button right", defaultProjectDefaults, "C++");
				projectDefaultsCpp.setAttribute("data-dir", "1");
				var projectDefaultsC = new UI.make("span", "ui-modal-button right", defaultProjectDefaults, "C");
				projectDefaultsC.setAttribute("data-dir", "0");

				projectDefaultsJavascript.onmouseup = function() {
					//ProjectFile.runCommands = [`node my_file.js`];
				};
				projectDefaultsElectron.onmouseup = function() {
					//ProjectFile.runCommands = [`electron my_page.html`, `electron my_file.js`];
				};
				projectDefaultsC.onmouseup = function() {
					//ProjectFile.runCommands = ["gcc -o3 -g -o my_program my_source.c", "./my_program"];
				};
				projectDefaultsCpp.onmouseup = function() {
					//ProjectFile.runCommands = ["echo \"1\"", "echo \"2\"", "echo \"3\"", "echo \"4\""];
					//ProjectFile.runCommands.push(`echo \"no default run command available for c++\"`);
				};*/
			};
			var editorTab = new ElementModalTabPane(this, "Window");
			editorTab.fnActivate = function(element) {
				var contents = new UI.make("div", "padded", self.right); // i get deleted
			};
			var editorTab = new ElementModalTabPane(this, "Editor");
			editorTab.fnActivate = function(element) {
				var contents = new UI.make("div", "padded", self.right); // i get deleted
				AddCheckboxOption(contents, "Show line numbers?", Config.editor.LineNumbers, function() {
					console.log(this.checked);
					Config.editor.LineNumbers = this.checked;
				});
				AddCheckboxOption(contents, "Indentation uses tabs?", Config.editor.IndentWithTabs, function() {
					Config.editor.IndentWithTabs = this.checked;
				});
				AddCheckboxOption(contents, "Use line wrapping?", Config.editor.LineWrapping, function() {
					Config.editor.LineWrapping = this.checked;
				});
				AddInputOption(contents, "ui-input-number", "Tab size:", Config.editor.TabSize, function() {
					Config.editor.TabSize = this.value;
				});
				AddInputOption(contents, "ui-input-number", "Indentation units:", Config.editor.IndentUnit, function() {
					Config.editor.IndentUnit = this.value;
				});
				AddInputOption(contents, "ui-input-number", "Number of Columns:", Config.editor.Columns, function() {
					Config.editor.Columns = this.value;
				});
				AddInputOption(contents, "ui-input-number", "Maximum number of columns:", Config.editor.MaxColumns, function() {
					Config.editor.MaxColumns = this.value;
				});
				
				/*var lineNumbersLabel = new UI.make("label", "ui-label", contents, "Show line numbers:");
				lineNumbersLabel.for = "prefs-linenumbers";
				var lineNumbers = new UI.make("input", "ui-checkbox right", lineNumbersLabel);//, 
				lineNumbers.id = "prefs-linenumbers";
				lineNumbers.type = "checkbox";
				console.log("Config?", Config.editor.LineNumbers);
				lineNumbers.checked = Config.editor.LineNumbers;
				lineNumbers.onchange = function () {
					console.log(this.checked);
					Config.ProjectViewIgnoreDepth = lineNumbers.checked;
				};*/
				
				
				
			}

			var pluginsTab = new ElementModalTabPane(this, "Plugins");
			pluginsTab.fnActivate = function(element) {
				var contents = new UI.make("div", "padded", self.right); // i get deleted
				//var contentDefaultLabel = new UI.make("div", "ui-label", contents, "Something goes here");
			}

			generalTab.select.onmouseup(); // sets the default activated pane
			new UI.make("span", "", buttons);

			close.onmouseup = function (event) {
				self.container.remove();
			};

			save.onmouseup = function(event) {
				console.log("todo: save config.js");
				//console.log("saving project file", ProjectFile);
				/*window.api.plugin({
					pluginName: "projectview", event: "render", request: {
						type: "save",
						//project: ProjectFile
					}
				});*/
			};
			load.onmouseup = function(event) {
				console.log("todo: reload config.js");
				//fnGetProject();
				//fnToggleProjectViewer(true);
				//self.container.remove();
			};

		};
		new ElementModalProjectOptions();
};