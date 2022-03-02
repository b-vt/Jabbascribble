/* 
args {
	type: undefined, // how user can respond
	title: "Title",
	name: "Message Name",
	body: "Message body"	
} 
*/
function ModalWindow(args) {
	//alert(args.body);
	var self = this;

	if (args === undefined || args === null)
		args = {};
	var type = args.type !== undefined && args.type !== null ? args.type : 0;
	document.title = args.name !== undefined && args.name !== null ? args.name : "Attention";
	var content = UI.makeUnique("content", "div");	
	var message = UI.make("div", "", content, args.body);
	var buttons = UI.make("div", "buttons");
	//var cancel = UI.make("button", "", buttons, "Cancel");
	//var ok = UI.make("button", "", buttons, "Ok");
	var close = UI.make("button", "", buttons, "Close");
	close.onclick = function(event) {
		window.api.close(0);
	}


}