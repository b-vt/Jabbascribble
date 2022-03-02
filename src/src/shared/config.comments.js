var Config = {
	Lang: "en",
	Langs: ["en"],
	DevTools: false, // toggle renderer dev tools on or off by default
	TabsScrollDelta: 10,

	editor: {
		Columns: 2,
		MaxColumns: 4
	}

};

if (typeof module!=="undefined")
	module.exports = {
		Config
	}
