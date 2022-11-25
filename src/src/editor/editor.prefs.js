function WindowPrefs(editor) {
	editor.menu.file.add(Lang.Menu.Preferences, "ui-icon-book", Lang.Menu.PreferencesHint).onclick = this.openPrefsEditor;
	
	
	
}

WindowPrefs.prototype.openPrefsEditor = function() {
	console.log("didney worl");
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

			var defaultTab = new ElementModalTabPane(this, "test");
			defaultTab.fnActivate = function(element) {
				var contents = new UI.make("div", "padded", self.right); // i get deleted
				
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
			
			defaultTab.select.onmouseup(); // sets the default activated pane
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