var Config = {
	TempDir: "../tmp",
	SrcDir: "/src",
	Lang: "en",
	Langs: ["en"],
	EnableDevTools: true,
	TabsScrollDelta: 10,
	Debug: false,
	window: {
		Width: 1100,
		Height: 600
	},
	editor: {
		LineNumbers: true,
		IndentWithTabs: true,
		LineWrapping: true,
		TabSize: 4,
		IndentUnit: 4,
		Columns: 1,
		MaxColumns: 4,
		FontSize: 15 // css px
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