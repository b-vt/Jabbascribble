function WindowPrefs(editor) {
	editor.menu.file.add(Lang.Menu.Preferences, "ui-icon-book", Lang.Menu.PreferencesHint).onclick = this.openPrefsEditor;
}

WindowPrefs.prototype.openPrefsEditor = function() {
	console.log("didney worl");
};