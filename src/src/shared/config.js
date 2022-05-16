// global editor config
var Config = {
	TempDir: "../tmp",
	SrcDir: "/src",
	Lang: "en",
	Langs: ["en"],
	EnableDevTools: false,
	TabsScrollDelta: 10,
	Debug: false,
	window: {
		Width: 1100,
		Height: 600
	},
	editor: {
		LineNumbers: true,
		IndentWithTabs: true,
		LineWrapping: false, // todo: resizing columns with this enabled breaks cursor position for some raisin
		TabSize: 4,
		IndentUnit: 4,
		Columns: 1,
		MaxColumns: 4
	},
	plugins: [
		{
			main: "ternjs/main.js",
			renderer: "ternjs/render.js",
			config: {
				bin: "/bin/bin/tern",
				port: 49000
			}
		}
	]
};
if (typeof module!=="undefined")
	module.exports = { Config }