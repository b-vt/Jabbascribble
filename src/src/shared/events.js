/* transfer input event from a listener into less
		todo: multitouch, keyboard, mouse, controller support?
	*/
function InputEventDto(event, keymap, noDefaultPropagation) {
	this.x = 0; // mouse cursor position
	this.y = 0;
	this.key = -1; // key press keyCode
	this.isModified = false; // input has a modifier key
	this.modifiers = 0; // bitfield for modifier keys
	/*this.ctrl = false;
	this.shift = false;
	this.alt = false;
	this.meta = false;*/
	this.map = ""; // poorly implemented string name of button, ie "A KEY" when A is pressed
	this.keymap = keymap || []; // 
	this.wheelDelta = 0;
	this.wheelDeltaX = 0;
	this.wheelDeltaY = 0;
	this.target = null; // element that the event happened in?


	switch(event.type) {

		// touch screen stuff
		case "touchstart":
		case "touchend":
		case "touchmove": { // todo: ???
			this.x = event.touches[0].pageX;
			this.y = event.touches[0].pageY;
			break;
		}
		// mouse stuff
		case "mouseover":
		case "mousedown":
		case "mouseup":
		case "mousemove":
		case "mousewheel": { // todo: this should account for pointer lock
			/*this.x = event.pageX;
			this.y = event.pageY;
			this.key = event.buttons;
			this.map = ["MOUSE", this.key].join(" ");*/
			this.consumeMouseEvent(event);
			break;
		}

		// keyboard stuff
		case "keypress": {
			if (event.code === undefined) break; // chrome sends keyboard events on autofill input
			this.consumeKeyboardEvent(event, true);
			break;
		}
		case "keydown": {
			if (event.code === undefined) break;
			this.consumeKeyboardEvent(event, true);
			break;
		}
		case "keyup": { 
			if (event.code === undefined) break;
			this.consumeKeyboardEvent(event, false);
			break;
		}

		// todo: controller stuff?
		default: {
			break;
		}
	}
}

InputEventDto.prototype.consumeMouseEvent = function(event) {
	this.isModified = this.hasModifier(event);

	this.x = event.pageX;
	this.y = event.pageY;

	this.deltaX = event.deltaX;
	this.deltaY = event.deltaY;
	this.deltaZ = event.deltaZ;

	this.target = event.target;

	this.key = event.buttons;
	this.map = ["MOUSE", this.key].join(" ");
};
// todo: this is not 'future proof' because it uses keyCode
InputEventDto.prototype.consumeKeyboardEvent = function(event, isDown) {
	this.key = event.keyCode;
	if (this.keymap[" "+(this.key)] != isDown)
		this.hasKeymapChanged = true;
	
	this.keymap[" "+(this.key)] = isDown;
	this.isModified = this.hasModifier(event);
	this.map = event.code.toUpperCase().replace("KEY", "");
};
InputEventDto.prototype.hasModifier = function(event) {
	this.modifiers = 0;
	if (event.ctrlKey)
		this.modifiers = this.modifiers | InputEventDto.prototype.CTRL;
	if (event.shiftKey)
		this.modifiers = this.modifiers | InputEventDto.prototype.SHIFT;
	if (event.altKey)
		this.modifiers = this.modifiers | InputEventDto.prototype.ALT;
	if (event.metaKey)
		this.modifiers = this.modifiers | InputEventDto.prototype.META;
	return (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey);
};
InputEventDto.prototype.CTRL = 1;
InputEventDto.prototype.ALT = 2;
InputEventDto.prototype.SHIFT = 4;
InputEventDto.prototype.META = 8;
