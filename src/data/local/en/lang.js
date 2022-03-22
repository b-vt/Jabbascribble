var Lang = {
	NewTab: "<New>",
	EditSearchPlaceholder: "Search",
	EditSearchHint: "Find and highlight search text",
	EditSearchReplacePlaceholder: "Replace",
	EditSearchReplaceHint: "Replace search text with whatever jank is in this box",
	GarbageCollection: "Force Garbage Collection",
	GarbageCollectionHint: "If --expose-gc flag is enabled then this will attempt to free up used memory",
	Menu: {
		// file menu
		File: "File",
		Open: "Open",
		OpenHint: "Open files",
		Save: "Save Active File",
		SaveHint: "Save active file",
		New: "New",
		NewHint: "New tab",
		Quit: "Quit",
		QuitHint: "Close this window(without warning!)",
		SaveProject: "Save Project File",
		SaveProjectHint: "Save the current project state to a .scribble file",
		OpenProject: "Open Project File",
		OpenProjectHint: "Open a project .scribble file",
		// view menu
		View: "View",
		OpenRenderConsole: "Open Render Console",
		OpenRenderConsoleHint: "*Caution* unsaved data will be lost on CTRL + R/F5 while console is open!",
		Columns: "Columns",
		ColumnsHint: "Change the number of editor columns",
		// edit/tab menu
		Edit: "Edit",
		Close: "Close",
		CloseHint: "Close only this item",
		CloseAll: "Close All",
		CloseAllHint: "Close all items",
		CloseAllOther: "Close All Other",
		CloseAllOtherHint: "Close all but this item",
		OpenFileLocation: "Open File Location",
		OpenFileLocationHint: "Launch shell at file location",
		ToggleLineWrap: "Toggle Line Wrap",
		ToggleLineWrapHint: "Toggles line wrap in the active edit"
		
	}
};
if (typeof module!=="undefined")
	module.exports = {
		Lang
	}