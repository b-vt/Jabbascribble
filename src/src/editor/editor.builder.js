function ElementEditorColumn(column) {
	this.parent = column.content;
	this.column = column;
	this.container = UI.make("div", "full-width full-height", this.parent);
	this.table = UI.make("table", "collapsed full-width full-height", this.container);
	this.tbody = UI.make("tbody", "", this.table);
	this.tr1 =	UI.make("tr", "", this.tbody);
	this.header = UI.make("td", "collapsed ui-columns-tabs", this.tr1);
//	this.resizer = UI.make("td", "ui-columns-resizer", tr1, undefined, true);
	this.tr2 = UI.make("tr", "", this.tbody);
	this.content2 =	UI.make("td", "ui-columns-column", this.tr2);
	this.content = UI.make("div", " full-height full-width relative", this.content2);

	this.header.setAttribute("colspan", "0");
	
	this.tabs = null;
	this.resizer = null;
	column.fnActivateCallback = null;
	console.log(column);
	column.container.ondrop = function(data1, data2, data3) {
		console.log(data1, data2, data3);
	}
}
ElementEditorColumn.prototype.destroy = function() {

	this.destroyResizer();
	this.header.remove();
	this.table.remove();
	this.tbody.remove();
	this.tr1.remove();
	this.tr2.remove();
	this.content2.remove();
	this.content.remove();
	this.container.remove();

	this.tabs.destroy();
	this.tabs = null;

	this.column.destroy();
	this.column = null;

	this.resizer = null;
	this.fnTabActivateCallback = null;
};
ElementEditorColumn.prototype.init = function(resizable, fnTabActivateCallback) {
	//this.editor = new ElementEditorColumn(this.content);
	if (resizable) {
		this.appendResizer();
		this.column.container.style.width = "800px";
	}
	this.tabs = new ElementTabs(this.header, this.column);
	this.column.fnActivateCallback = this.fnTabActivateCallback = fnTabActivateCallback;
	return this;
};
ElementEditorColumn.prototype.appendResizer = function() {
	this.resizerElement = UI.make("td", "ui-columns-resizer", this.tr1);
	this.resizerElement.setAttribute("rowspan", "2");
	//this.tr1.append(this.resizer);
	this.resizer = new ElementResizer(this.resizerElement, this.header, this.column.container);
};
ElementEditorColumn.prototype.destroyResizer = function() {
	if (this.resizer == null) return
	this.resizer.destroy();
	this.resizerElement.remove();
	this.resizer = null;
};
ElementEditorColumn.prototype.addTab = function(name, value, fnOnContextMenu) {
	var self = this;
	if (this.tabs !== undefined && this.tabs !== null) {
		
		var pane = UI.make("div", "absolute full-height full-width", this.content);
		pane.onclick = this.fnTabActivateCallback;

		var datum = new ElementTabEditorData(name, this.tabs.getNextUUID());
		datum.codemirror = CodeMirrorFactory(pane, name, value);
		datum.codemirror.on('change', function(event, data) { // add a * until the document is saved
			if (datum.modifier.length == 0) {
				datum.modifier = "*";
				tab.tab.firstChild.nodeValue = [datum.name, datum.modifier].join("");
			}
		});

		var tab = this.tabs.add(name, datum);

		tab.fnRefreshCallback = function(data) {
			datum.update(data);
			tab.tab.firstChild.nodeValue = [datum.name, datum.modifier].join("");
		}

		function onContextMenu(event, isTab) {
			var context = new ElementContextMenu();
			if (typeof fnOnContextMenu === "function")
				fnOnContextMenu(context, {isTab: isTab, datum: datum, tab: tab});
			if (isTab) {
				context.add(Lang.Menu.Close, "ui-icon-close", Lang.Menu.CloseHint).onclick = function() {
					if (self.tabs.activeTab.datum.id == tab.datum.id) { // if the active tab is being closed then activate another tab
						var tabs = self.tabs.get();
						for(var i = 0; i < tabs.length - 1; i++) { // -1 because one tab will not be removed
							var item = tabs[i];
							if (item === undefined || item === null || item.removed) continue;
							console.log("item=",item);
							if (item.datum.id !== tab.datum.id) { // only choose the element that isn't the one being closed
								item.activate();
								break;
							}
						}
					}
					tab.destroy();
					self.tabs.remove();
				};
				context.add(Lang.Menu.CloseAll, "ui-icon-close", Lang.Menu.CloseAllHint).onclick = function() {
					while(self.tabs.tabs.length > 0) {
						var item = self.tabs.tabs.pop();
						item.destroy();
					};
					self.tabs.remove();
				};
				context.add(Lang.Menu.CloseAllOther, "ui-icon-close", Lang.Menu.CloseAllOtherHint).onclick = function() {
					var tabs = self.tabs.get();
					for(var i = 0; i < tabs.length; i++) {
						var item = tabs[i];
						if (item.datum.id !== tab.datum.id) {
							item.removed = true;
						}
					};
					self.tabs.remove();
					tab.activate();
				};
			}
			/*
			else { // 
				var selections = datum.codemirror.doc.getSelection();
				if (selections > 0) {
					console.log(selections);
					
					context.add(`search for \"${selections}\"`, "ui-icon-save", "").onclick = function() {
						console.log("selected junko: %s", selections);
					};
				}
			}
			if (datum.path && datum.path.length > 1)
				context.add(Lang.Menu.OpenFileLocation, "ui-icon-folder-explore", Lang.Menu.OpenFileLocationHint).onclick = function() {
					if (datum.path == undefined) return;
					var splits = datum.path.split(/[\\/]/g);
					splits.pop();
					window.api.openFileLocation({path: splits.join("/")});
				};
			*/
			if (context.items.length > 0) // destroy the tiny little square of resistence
				context.show(event.clientX, event.clientY);
			console.log(event.clientX, event.pageX);
		}

		pane.oncontextmenu = function(event) { onContextMenu(event, false); }
		tab.tab.oncontextmenu = function(event) { onContextMenu(event, true); };

		tab.setPane(pane);
		tab.fnActivateCallback = this.fnTabActivateCallback;
		tab.activate();
	}
};


function ElementTabEditorData(fullPathName, id) {
	// 
	this.id = id;
	//console.log(fullPathName)
	this.name = fullPathName.split("\\").pop().split("/").pop(); // tab name only
	this.modifier = "";
	//this.value = null;
	this.path = fullPathName === Lang.NewTab ? undefined : fullPathName;
	this.codemirror = null; // 	
}
ElementTabEditorData.prototype.destroy = function() {
	this.codemirror.setValue("");
	this.codemirror.clearHistory();
	this.codemirror.parentRef.remove();
	this.codemirror = null;
};
ElementTabEditorData.prototype.update = function(data) {
	
	if (data)
		if (data.name !== undefined) {
			this.name = data.name.split("\\").pop().split("/").pop(); // todo: this is gross
			this.path = data.name === Lang.NewTab ? 0 : data.name;
			//element.nodeValue = this.name;
		}

};
// auto compete thing
function ElementPopup(x, y, completions) {
	this.container = UI.makeUnique("popup", "div", "absolute popup", window.body);
	
	this.select = UI.make("select", "", this.container);
	this.select.setAttribute("multiple", "");
	//activeFileExtension.name = "activeFileExtension";
	//activeFileExtension.onchange = fnEditorTabMode;
	for(var i = 0; i < completions.length; i++) {
		var opt = UI.make("option", "", this.select, completions[i]);
		opt.isPopup = true;
	}

	this.container.style.left = `${x}px`;
	this.container.style.top = `${y}px`;

	this.container.isPopup = true;
	this.select.isPopup = true;

};
ElementPopup.prototype.destroy = function() {
	this.container.remove();
};