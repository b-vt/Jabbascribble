/* todo: this file is monolithic. classes should eventually seperated into their own source files */

/* on instance it adds a new div to DOM to be container of containers/elements 
provides some probably bad UI utility
 todo:
		the classes found in this file should be put into their own source files
		there are multiple context menus appended to the document. there should probably only be one context menu */
function WindowBuilder(containerType) {
	var self = this;
	this.elements = [];/* assosiative list containing all generated DOM elements */
	containerType = containerType === undefined || containerType === null ? "div" : containerType

	this.body = this.make(containerType, "absolute full-width full-height window-body bordered", document.body);
	this.elements["body-container"] = this.body;

	if (window.api === undefined) // firefox fix because border-bottom is missing when body uses height 100%
		this.body.classList.add("border-bottom");

	this.activeMenu = null;
	window.addEventListener('keyup', function(event) {
		if (event.key === "Escape" || event.keyCode === 27)
			UI.setActiveMenu(null);
		/*if (event.key === "Tab" || event.keyCode === 9)
			UI.setActiveMenu(null);*/
	});
	window.addEventListener('mouseup', function(event) {
		if (self.activeMenu == null || event.target.contextMenu !== undefined) {
			return;
		}
		UI.setActiveMenu(null);
	});
}
/* creates new DOM elements and appends them to parent or element-container elements
	type: element name
		eg, "div"
	classNames: optional, css classes for element
		eg, "icon icon-quit"
	parent: optional, must be DOM object
		eg, document.getElementById("icons-holder")
	innerText: optional, adds text node to element. &nbsp is replaced by unicode a0
	noAppend: optional, creates element but does not append it to any document
	*/
WindowBuilder.prototype.make = function(type, classNames, parent, innerText, noAppend) {
	var element = document.createElement(type);

	if (classNames !== undefined && classNames !== null && classNames.length > 0)
		element.className = classNames;
	if (innerText !== undefined && innerText !== null && innerText.length > 0) {
		if (innerText.toLowerCase() === "&nbsp;")
			innerText = '\xa0';
		element.append(document.createTextNode(innerText));
	}
	if (noAppend !== true) 
		if (parent == undefined && parent == null) {
			this.body.append(element);
		}
		else {
			parent.append(element);
		}
	return element;
};
/* calls WindowBuilder.make and adds a reference of new element to element map */
WindowBuilder.prototype.makeUnique = function(id, type, classNames, parent, innerText, noAppend) {
	this.elements[id] = this.make(type, classNames, parent, innerText, noAppend);
	this.elements[id].id = id;
	return this.elements[id];
};
/* */
WindowBuilder.prototype.setActiveMenu = function(contextMenu) {
	if (this.activeMenu !== null && this.activeMenu !== contextMenu)
		this.activeMenu.hide();
	this.activeMenu = contextMenu;
};

//

// menu class
function ElementMenu(parentElement) {
	var self = this;
	this.container = parentElement;	
	this.items = [];

	this.classNames = "top-level-most ui-menu no-padding no-margin";
}
ElementMenu.prototype.add = function(name, classNames, hint) {
	if (this.items[name] === undefined || this.items[name] === null) {
		var details = UI.make("details", "inline " + (classNames || this.classNames), this.container);
		var summary = UI.make("summary", "", details, name);
		this.items[name] = details.contextMenu = new ElementContextMenu(details, name);
		details.ontoggle = function(event) {
			if (details.open)
				details.contextMenu.show();
			else
				details.contextMenu.hide(true);
		}
		if (hint != undefined && hint != null)
			details.title = hint;
	}
	return this.items[name];
};
ElementMenu.prototype.get = function(name) {
	return this.add(name, null);
};

//

// context menu class
function ElementContextMenu(parentElement, name) {
	if (parentElement === undefined)
	this.classNames = "ui-menu-item"
	this.items = [];
	this.name = name;
	var parent = parentElement == undefined || parentElement == null ? UI.body.parentElement : parentElement;
	this.container = UI.make("div", "absolute top-level-most ui-context-menu ui-hide ui-bubble no-padding", parent);
	this.container.setAttribute("data-bubble", "1");
	this.container.contextMenu = this; // give the container a reference to the context menu object
	this.index = 0;
}
ElementContextMenu.prototype.add = function(name, iconButton, hint, noSeparator) {
	if (name !== undefined && name !== null) {
		this.index++;
		if (this.items[this.index] === undefined || this.items[this.index] === null) {
			this.items[this.index] = new ElementMenuItem(this.container, name, "", hint);		
			if (iconButton !== undefined && iconButton !== null) {
				var icon = UI.make("div", "inline ui-icon ui-icon-empty no-padding " + iconButton, null, null, true);
			}
			else {
				var icon = UI.make("div", "inline ui-icon ui-icon-empty no-padding", null, null, true);
			}
			if (noSeparator !== true) {
				var span = UI.make("span", "ui-menu-item-separator-side", null, '\xa0', true)
				span.contextMenu = this;
				this.items[this.index].container.prepend(span);
			}
			this.items[this.index].container.prepend(icon);
			if (hint !== undefined && hint !== null) {
				icon.title = hint;
			}
			icon.contextMenu = this;
		}
	}
	else 
		UI.make("div", "ui-menu-item-separator", this.container);

	/*if (onclick !== undefined && onclick !== null) {
		this.items[name].onclick = onclick;
	}*/
	return this.items[this.index];
	//return this;
};
ElementContextMenu.prototype.show = function(x, y) {
	var parent = this.container.parentElement;
	if (parent!==undefined && parent.nodeName.toLowerCase() === "details")
		parent.open = true;
	this.container.classList.remove("ui-hide");
	this.container.classList.add("ui-show");

	UI.setActiveMenu(this);

	if (x!==undefined && x!==null)
		this.setPosition(x, y);
};
ElementContextMenu.prototype.hide = function() {
	var parent = this.container.parentElement;
	if (parent!==undefined && parent !== null && parent.nodeName.toLowerCase() === "details") {
		parent.open = false;
		this.container.classList.remove("ui-show");
		this.container.classList.add("ui-hide");
	}
	else
		this.container.remove();
};

//

/* if the context menu is hidden then getClientRects will throw an exception 
	a private method used mainly by ElementContextMenu.show */
ElementContextMenu.prototype.setPosition = function(x, y) {
	var parentRect = this.container.parentElement.getClientRects()[0];
	var rect = this.container.getClientRects()[0];
	if (rect === undefined) throw "ElementContextMenu.setPosition could not get rect, element may be hidden";

	/* oddwarg magic
		but also matches css attribute selectors to the container rect
		top left = 1, top right = 2
		bottom left = 3, bottom right = 4 */
	var flag = 0;
	if (x > window.innerWidth - rect.width) {
		x = x - rect.width;
		flag|=1;
	}
	if (y > window.innerHeight - rect.height) {
		y = y - rect.height;
		flag|=2;
	}
	flag++;

	this.container.setAttribute("data-bubble", flag);
	this.container.style.left = x + "px";
	this.container.style.top = y + "px";
};
ElementContextMenu.prototype.destroy = function() {
	this.container.remove();
};

//

// menu item class
function ElementMenuItem(parentElement, name, classNames, hint ) {
	var self = this;
	this.classNames = "ui-menu-item"
	this.container = UI.make("div", classNames || this.classNames, parentElement, name);
	this.name = name;
	this.onclick = null; 
	//var element = UI.make("div", classNames || this.classNames, parentElement, name);
	this.container.contextMenu = parentElement.contextMenu;

	if (hint !== undefined && hint !== null) {
		this.container.title = hint;
		//console.log(`has hint: ${hint}`);
	}
	this.container.onclick = function(event) {
		if (self.onclick !== undefined && self.onclick !== null)
			self.onclick(event, this, self);
		// not sure where else to hide the context menu when an item has been clicked
		parentElement.contextMenu.hide();
	}
}

//

// icons buttons
function ElementIconButton(parentElement, classNames, hint, labelFor, noAppend, fnOnClick) {
	this.container = UI.make("label", "inline ui-icon-container", parentElement, null, noAppend);
	//container.alt = hint;
	var icon = UI.make("div", "ui-icon " + classNames, this.container);
	if (hint !== undefined && hint !== null) {
		icon.title = hint;
	}
	if (labelFor !== undefined && labelFor !== null) {
		this.container.htmlFor = labelFor;
	}

	this.onclick = fnOnClick || null;
	var self = this;
	this.container.onclick = function(event) {
		if (self.onclick !== undefined && self.onclick !== null)
			self.onclick(event);
	}	
}

//

// columns i guess
function ElementColumns(parentElement, classNames) {
	this.container = UI.make("tr", "collapsed", parentElement);
	this.columns = [];
	this.activeColumn = null;
	this.uuid = 0;
	var self = this;
};
ElementColumns.prototype.destroy = function() {
	for(var i = 0; i < this.columns.length; i++) {
		this.columns[i].destroy();
		this.columns[i] = null;
	}
	this.columns = [];
	this.columns = null;
	this.container.remove();
};
ElementColumns.prototype.get = function(index) {
	if (index !==undefined && index !== null)
		return this.columns[index] ? this.columns[index] : null;
	return this.columns;
};
ElementColumns.prototype.getNextUUID = function() {
	return this.uuid++;
};
/* returns an ElementColumn object */
ElementColumns.prototype.add = function() {

	var column = new ElementColumn(this, this.container, this.activeColumn);
	var len = this.columns.push(column);
	column.id = len;
	//this.lastColumnRef = column;
	this.activeColumn = column;
	//console.log("made a new column?", this.activeColumn);
	return column;
};
ElementColumns.prototype.active = function(active) {
	return (this.activeColumn = active || this.activeColumn);
};
ElementColumns.prototype.flush = function() {
	for(var i = 0; i < this.columns.length; i++) {
		this.columns[i].destroy();
		this.columns[i] = null;
	}
	this.columns = null;
	this.columns = [];
};

//

function ElementColumn(columns, parentElement) {
	this.fnActivateCallback = null;
	this.columns = columns;
	this.parent = parentElement;
	this.container = UI.make("td", "ui-column", parentElement);
	this.id = null;// array index location

	this.table = UI.make("table", "collapsed full-width full-height", this.container);
	var tableBody = UI.make("tbody", "", this.table);
	var tableRow = UI.make("tr", "", tableBody);
	this.content = UI.make("td", "collapsed full-height", tableRow);
	this.content.self = this; // expose this column class to the DOM
	
	var self = this;
	this.container.onmousedown = function(e) {
		self.columns.active(self);
	}
}
ElementColumn.prototype.destroy = function() {
	if (this.columns && this.columns.active() == this) {
		this.columns.active(this.columns.get(0));
	}
	this.content.self = null;
	this.content.remove();
	this.container.remove();
	this.removed = true;
};

//

function ElementResizer(resizerElement, parent, elementToResize) {
	this.resizerElement = resizerElement;
	resizerElement.onmousedown = function(event) {
		document.onmousemove = function(innerEvent) {
			var pos = Clamp((innerEvent.clientX - elementToResize.getClientRects()[0].left), 1, document.body.clientWidth);
			elementToResize.style.width = pos + "px";
		}
		document.onmouseup = function(innerEvent) {
			document.onmousemove = null;
			document.onmouseup = null;
		}
	}
}
ElementResizer.prototype.destroy = function() {
	this.resizerElement.onmousedown = null;
};

/* this class does not append the tabs container to any document and must be done after instantiation 
	pane: element that is attached to the tab */
function ElementTabs(parent, column) {
	var self = this;
	this.scrollerTimer = null;
	this.x = 0; // content scroll position
	this.column = column;
	//this.nextUUID = columns.getNextUUID();
	this.tabs = [];
	//this.container = UI.make("div", "block full-width", null, "", null);

	this.activeTab = null;

	this.container = UI.make("table", "collapsed", null, "", true);
	var body = UI.make("tbody", "ui-tabs", this.container);
	var tr = UI.make("tr", "", body);
	var tdLeft = UI.make("td", "collapsed full-width nudge-left", tr);
	var tdCenter = UI.make("td", "collapsed", tr);
	var tdRight = UI.make("td", "collapsed", tr);

	this.scrollerLeft = UI.make("div", "relative tabs-scroller", tdCenter);
	this.scrollerRight = UI.make("div", "relative tabs-scroller", tdRight);
	this.scrollerRight.setAttribute("data-dir", "1");

	// content is the container that holds all tabs
	this.content = UI.make("div", "tabs-container wrapped-all", tdLeft);

	this.scrollerLeft.onmousedown = function(event) { self.enableScroll(-1); }
	this.scrollerLeft.onmouseup = function(event) { self.disableScroll(); }
	this.scrollerRight.onmousedown = function(event) { self.enableScroll(1); }
	this.scrollerRight.onmouseup = function(event) { self.disableScroll(); }
	this.content.onmousewheel = function(event) { 
		var speed = event.deltaY/Config.TabsScrollDelta;
		var e = new InputEventDto(event);
		if (e.modifiers & InputEventDto.prototype.CTRL) // if ctrl is held down then speed up the scroll?
			speed *= 10;
		self.scroll(speed); 
	}

	if (parent!==undefined && parent!==null) {
		parent.append(this.container);
	}
};
ElementTabs.prototype.destroy = function() {
	while(this.tabs.length > 0) { // todo: this is a debug attempt and needs to be cleaned up
		this.tabs[this.tabs.length - 1].destroy();
		this.tabs[this.tabs.length - 1] = null;
		this.tabs.pop();
	}

	this.content.onmousewheel = null;
	this.scrollerLeft.onmousedown = null;
	this.scrollerLeft.onmouseup = null;
	this.scrollerRight.onmousedown = null;
	this.scrollerRight.onmouseup = null;
	this.scrollerTimer = null;
	this.scrollerLeft.remove();
	this.scrollerRight.remove();
	this.content.remove();
	this.container.remove();

	this.tabs = []; // gc debugging attemps
	this.tabs = null;
}
ElementTabs.prototype.get = function(index) {
	if (index !==undefined && index !== null)
		return this.tabs[index] ? this.tabs[index] : null;
	return this.tabs;
};
ElementTabs.prototype.getNextUUID = function() {
	return this.column.columns.getNextUUID();
};
ElementTabs.prototype.getActive = function() {
		if (this.activeTab !== null)
			this.activeTab.refresh();
	return this.activeTab;
};
ElementTabs.prototype.enableScroll = function(dir) {
	var self = this;
	if (this.scrollerTimer == null)
		this.scrollerTimer = setInterval(() => {
			self.scroll(dir);
		}, 1);
};
ElementTabs.prototype.disableScroll = function() {
	clearInterval(this.scrollerTimer);
	this.scrollerTimer = null;
};
ElementTabs.prototype.add = function(name, tabDto) {
	var tab = new ElementTab(this, tabDto);
	this.content.append(tab.tab);
	this.tabs.push(tab)
	tab.id = this.getNextUUID();//this.tabs.push(tab) - 1;
	return tab;
};
// call whenever tabs need to be removed i guess idk
ElementTabs.prototype.remove = function() {
	for(var i = 0; i < this.tabs.length; i++) {
		var last = this.tabs[this.tabs.length - 1];
		var pops = this.tabs[i];
		if (pops.removed) {
			this.tabs[i] = last;
			this.tabs.pop();
			pops.destroy();
			i--;
		}
	}
	for(var i = 0; i < this.tabs.length; i++) {
		var p = this.tabs[i];
		if (p.removed) {
			var last = this.tabs[this.tabs.length - 1];
			this.tabs[i] = last;
			this.tabs[this.tabs.length - 1] = p;
			this.tabs.pop();
		}
	}
};
ElementTabs.prototype.scroll = function(dir) {
	this.x = Clamp(this.x + dir, 0, this.content.scrollWidth - this.content.parentElement.getClientRects()[0].width);
	this.content.scroll(this.x, 0);
};

//

function ElementTab(tabs, data) {
	var self = this;
	this.tabs = tabs;
	this.id = -1;
	this.fnActivateCallback = null;
	this.datum = data// = new ElementTabData(namid);
	this.pane = null; // content element that tab will hide/show/modify
	this.tab = UI.make("div", "inline tab", null, data.name, true);
	this.tab.onclick = function(event) {
		self.activate();
	}
	this.tab.oncontextmenu = function(e) {
		var context = new ElementContextMenu();
		context.add(Lang.Menu.Close, "ui-icon-close").onclick = function() {
			if (self.tabs.activeTab.datum.id == self.datum.id) { // if the active tab is being closed then activate another tab
				//console.log("activeTab=", self.tabs.activeTab);
				var tabs = self.tabs.get();
				for(var i = 0; i < tabs.length - 1; i++) {
					var item = tabs[i];
					if (item === undefined || item === null || item.removed) continue;
					//console.log("item=",item);
					if (item.datum.id !== self.datum.id) { // only choose the element that isn't the one being closed
						item.activate();
						break;
					}
				}
			}
			self.destroy();
		};
		context.show(e.clientX, e.clientY);
	};

	this.tab.onmousedown = function (event1) {
		var initialRect = self.tab.getClientRects()[0];
		console.log(initialRect);
		var isMoving = false;
		var e1= new InputEventDto(event1);
		document.onmousemove = function(event2) {
			var e2 = new InputEventDto(event2);
			if (Math.abs(e2.x - e1.x) > 50 || 
					Math.abs(e2.y - e1.y) > 50 &&
						!isMoving) {
				isMoving = true;
				self.tab.classList.remove("top-level");
				self.tab.classList.remove("relative");
				self.tab.classList.add("top-level-most");
				self.tab.classList.add("absolute");
				self.tab.classList.add("outlined");
			}

			if (isMoving) {
				var rect = self.tabs.column.container.getClientRects()[0];
				//var nextX = ((event2.clientX - rect.left) - (event1.clientX - initialRect.x));
				//var nextY = ((event2.clientY - rect.top) - (event1.clientY - initialRect.y))
				console.log(e2.x, rect.left, initialRect.x, rect.x);
				var nextX = (rect.left - initialRect.x) - e2.x;
				var nextY = (rect.top - initialRect.y) - e2.y;
				
				console.log(nextX, nextY);
				//self.tab.style.position = "absolute";
				//self.tab.style.zIndex = "1100";
				//self.tab.style.pointerEvents = "none";
				self.tab.style.left = nextX + "px";
				self.tab.style.top = nextY + "px";
				
			}
		}
		document.onmouseup = function(event2) {
			//self.tab.style.position = "relative";
			//self.tab.style.pointerEvents = "auto";
			//self.tab.style.zIndex = "1000";
			self.tab.style.left = "0px";
			self.tab.style.top = "0px";

			self.tab.classList.remove("top-level-most");
			self.tab.classList.remove("absolute");
			self.tab.classList.remove("outlined");
			self.tab.classList.add("relative");
			self.tab.classList.add("top-level");

			document.onmousemove = null;
			document.onmouseup = null;
			if (self.pane) self.pane.focus(); // moving the tab causes artifacts, focusing seems to resolve this
		}
	}
	this.tab.onmouseup = function(event) {
		var e = new InputEventDto(event);
		if (e.key == InputEventDto.prototype.MOUSE_MIDDLE) {//new Bitfield(e.key).compare(InputEventDto.prototype.MOUSE)) {
			self.destroy();
		}
	}
}
ElementTab.prototype.setContext = function(newContext) {
	this.tab.oncontextmenu = newContext;
};
ElementTab.prototype.destroy = function() {
	this.removed = true;
	this.tab.onmousedown = null;
	this.tab.oncontextmenu = null;
	this.tab.onclick = null;
	if (this.datum !== null)
		this.datum.destroy();
	this.datum = null;
	this.pane.remove();
	this.tab.remove();
};
// todo: + antipattern
ElementTab.prototype.refresh = function(data) {
	if (typeof this.fnRefreshCallback == "function")
		this.fnRefreshCallback(data);
};
ElementTab.prototype.setPane = function(container) {
	this.pane = container;
	this.pane.setAttribute("data-show", 0);
};
ElementTab.prototype.activate = function() {
	if (this.tabs.activeTab !== null) {
		this.tabs.activeTab.deactivate();
	}
	this.tabs.activeTab = this;
	this.tab.setAttribute("data-active", 1);
	this.pane.setAttribute("data-show", 1);

	if (this.fnActivateCallback !== undefined && this.fnActivateCallback !== null) {
		this.fnActivateCallback(this);
	}

};
ElementTab.prototype.deactivate = function() {
	this.tab.setAttribute("data-active", 0);
	this.pane.setAttribute("data-show", 0);
};