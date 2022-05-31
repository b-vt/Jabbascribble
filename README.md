# *A goofy CodeMirror based text editor for goofy projects*

The following libraries are included with this package: 
- [CodeMirror](https://github.com/codemirror/codemirror)
- [TernJS](https://github.com/ternjs/tern)

Requires ElectronJS v13.6.3. There are three main ways to launch this application.
- launch ElectronJS binary from commandline with a path to Jabbascribble-master/src/main.js
eg: `electron ~/Jabbascribble-master/src/main.js`
- by creating a resources folder in ElectronJS path and copying and renaming Jabbascribble-master/src to app
eg: `electroncopy/resources/app/main.js` will exist in a successful install, then launch ElectronJS
- use `Jabbascribble-master/debug.sh` or `Jabbascribble-master/debug.bat`

This project started as a personal toy and slowly morphed into a free clone of another very popular text editor.
The following 'features' are provided:
- Autocompletion provided through TernJS for Javascript
- Syntax highlighting for C/C++/Javascript/HTML/CSS with the freedom to import more with CodeMirror modes and minor editing of `src/shared/codemirror.js`
- A Project file viewer
- Tabbed views and multiple column support
- A goofy search/find and word highlight
- A copy of every file is saved in the tmp folder in case of oopsies

Todo:
- A built in webserver for web projects & viewing web projects without the need of launching a new browser instance or tab
- Automatic javascript prototype syntax inheritance from file
- Temp file does not support multiple files of the same filename
- Refactoring, there's a lot of prototyping cheese
- The project view list needs to be sorted and also it looks yucky
- Everything else