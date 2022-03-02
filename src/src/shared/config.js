var Config = {
	TempDir: "../tmp",
	SrcDir: "/src",
	Lang: "en",
	Langs: ["en"],
	EnableDevTools: false,
	TabsScrollDelta: 10,
	Debug: false,
	editor: {
		LineNumbers: true,
		IndentWithTabs: true,
		TabSize: 4,
		IndentUnit: 4,
		Columns: 1,
		MaxColumns: 4,
		Width: 1000,
		Height: 500
	},
	plugins: [
		{
			main: "ternjs/main.js",
			renderer: "ternjs/render.js",
			config: {
				bin: "bin/tern",
				port: 49000,
				key: 32
			}
		}
	]
};
if (typeof module!=="undefined")
	module.exports = { Config }