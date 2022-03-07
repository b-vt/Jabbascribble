# *A goofy text editor for goofy projects*

The following libraries are included with this package; CodeMirror, TernJS.

Requires ElectronJS v13.6.3. There are three main ways to launch this application.
- by launching ElectronJS binary from commandline with a path to Jabbascribble-master/src/main.js
eg: `electron ~/Jabbascribble-master/src/main.js`
- by creating a resources folder in ElectronJS path and copying and renaming Jabbascribble-master/src to app
eg: `electroncopy/resources/app/main.js` will exist in a successful install
- use `Jabbascribble-master/debug.sh` or `Jabbascribble-master/debug.bat`