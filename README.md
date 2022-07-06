# *A goofy multipurpose CodeMirror based text editor for goofy projects*

The following libraries are included with this package: 
- [CodeMirror5](https://github.com/codemirror/codemirror5)
- [TernJS](https://github.com/ternjs/tern)

To use this application you will need to download **ElectronJS v13.6.3 or newer**(https://github.com/electron/electron/releases). Extract ElectronJS and then copy and rename Jabbascribble-master/src to ElectronJS/resources/app and then delete ElectronJS/resources/default_app.asar. `.. electronjs/resources/app/main.js` will now exist in a successful install.

This is a personal toy and a naive attempt at being a free clone of another very popular text editor.
The following 'features' are provided:
- Autocompletion currently only provided for Javascript through TernJS
- Syntax highlighting for C/C++/Javascript/HTML/CSS and more are possible through CodeMirror modes
- A simple project environment
- Tabbed views and multiple column support
- A goofy search/find and word highlight
- A copy of every file is saved in the tmp folder in case of oopsies

Todo:
- Webserver support
- Automatic javascript prototype syntax inheritance from file
- Temp file does not support multiple files of the same filename
- Refactoring, there's a lot of prototyping cheese
- The project view list needs to be sorted and also it looks yucky
- Ccls integration might be neato
- Everything else