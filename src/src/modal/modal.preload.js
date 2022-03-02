// renderer script
var electron = require("electron");

var API_Blob = { // persistent data to exchange between main and render
	hasInit: 0
};

electron.contextBridge.exposeInMainWorld('api', {
	close: ApiClose,
	persist: API_Blob
});

function ApiClose(reason) {
	electron.ipcRenderer.send("modal-response", {response: reason})
	window.close();
}

function ApiInit() {
	console.log("modal.preload init")
	electron.ipcRenderer.on('modal-event-init', function(event, data) {
		var details = {
			type: data.type,
			title: data.title,
			body: data.body,
			name: data.name
		}
		window.dispatchEvent(new CustomEvent("modal-event-init", {detail: details}));
	});
}

//
ApiInit();