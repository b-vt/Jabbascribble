hotkeys:
	ctrl + n => create new tab in active column
	ctrl + s => save active file
	ctrl + o => open file in active column
	ctrl + g => goto line number
	ctrl + f => find next
	ctrl + h => show project view file list (requires projects plugin)
	ctrl + r => run project commands (requires projects plugin)
	ctrl + space => send autocomplete request to server (requires ternjs/ccls plugins)
	
commandline flags:
	filename1 filename2, opens files in editor
	-d -debug, enables debugging tools like chrome devtools
	-v -version, print version
	-x -y (integer), takes set window position on start
	-e -electron (filename|localhost/url/path|127.0.0.1/url/path), reuse binary as instance of electron for development
	
extra:
	run command `eletron -e filename` to use instance of electron
	using {$HOME} in ccls plugin config bin path will be replaced with path to home, eg '{$HOME}/ccls' will become '/home/username/ccls'