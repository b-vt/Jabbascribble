var Lang = {
	NewTab: "<New>",
	EditSearchPlaceholder: "Search",
	EditSearchHint: "Find and highlight search text.",
	EditSearchReplacePlaceholder: "Replace",
	EditSearchReplaceHint: "Replace search text with whatever jank is in this box.",
	Menu: {
		// file menu
		File: "File",
		Open: "Open",
		OpenHint: "Open files",
		Save: "Save",
		SaveHint: "Save active file",
		New: "New",
		NewHint: "New tab",
		Quit: "Quit",
		QuitHint: "Close this window(without warning!)",
		// view menu
		View: "View",
		OpenRenderConsole: "Open Render Console",
		OpenRenderConsoleHint: "*Caution* unsaved data will be lost on CTRL + R while console is open!",
		Columns: "Columns",
		ColumnsHint: "Change the number of editor columns",

		// tab menu
		Close: "Close",
		CloseHint: "Close only this item",
		CloseAll: "Close All",
		CloseAllHint: "Close all items",
		CloseAllOther: "Close All Other",
		CloseAllOtherHint: "Close all but this item",
		OpenFileLocation: "Open File Location",
		OpenFileLocationHint: "Launch shell at file location"
	}
};
if (typeof module!=="undefined")
	module.exports = {
		Lang
	}