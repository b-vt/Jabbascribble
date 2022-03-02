var UI = undefined; // WindowBuilder, global for scope since it's meant to be static anyway
function main() {
	console.log("Modal init")
	var data = {
		title: "test",
		name: "Test",
		body: "duh... didney worl"
	}
	new ModalWindow(data); 
	window.addEventListener("modal-event-init", function(data) {
		//new ModalWindow(data.detail);
	});
	window.addEventListener("keyup", function(event) {
		if (event.key === "Escape" || event.keyCode === 27)
			window.api.close(0);
	});
	window.addEventListener("beforeunload", function(event) {
		//window.api.close(0);
	});

};
document.addEventListener("DOMContentLoaded", function() {
	UI = new WindowBuilder();
	main();
});