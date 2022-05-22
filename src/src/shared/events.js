/* normalize various forms of input from listener events
		todo: multitouch, keyboard, mouse, controller support?
	*/
function InputEventDto(event, keymap, noDefaultPropagation) {
	console.log(event);
	this.x = 0; // mouse cursor position
	this.y = 0;
	this.key = -1; // key or mouse keyCode
	this.buttons = -1; // mouse bitfield
	this.isModified = false; // input has a modifier key
	this.modifiers = 0; // bitfield for modifier keys
	this.map = ""; // poorly implemented string name of button, ie "A KEY" when A is pressed
	this.keymap = keymap || []; // a map, all keys are formated " keyCodeValue" because pressing just A results in array [empty x 94, 95]
	this.wheelDelta = 0;
	this.wheelDeltaX = 0;
	this.wheelDeltaY = 0;
	this.deltaX = 0;
	this.deltaY = 0;
	this.deltaZ = 0;
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
		case "contextmenu":
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
};
InputEventDto.prototype.consumeMouseEvent = function(event) {
	this.isModified = this.hasModifier(event);

	this.x = event.pageX;
	this.y = event.pageY;

	this.deltaX = event.deltaX;
	this.deltaY = event.deltaY;
	this.deltaZ = event.deltaZ;

	this.target = event.target;

	this.key = event.button;// || event.buttons;
	this.buttons = event.buttons;
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
	if (event.ctrlKey || this.key == InputEventDto.prototype.KEY_CTRL)
		this.modifiers = this.modifiers | InputEventDto.prototype.CTRL;
	if (event.shiftKey || this.key == InputEventDto.prototype.KEY_SHIFT)
		this.modifiers = this.modifiers | InputEventDto.prototype.SHIFT;
	if (event.altKey || this.key == InputEventDto.prototype.KEY_ALT)
		this.modifiers = this.modifiers | InputEventDto.prototype.ALT;
	if (event.metaKey || this.key == InputEventDto.prototype.KEY_META)
		this.modifiers = this.modifiers | InputEventDto.prototype.META;
	return (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey || this.isFunctionKey());
};
InputEventDto.prototype.isFunctionKey = function() {
	// #SorryNotSorry
	return (this.key == this.KEY_F1 || this.key == this.KEY_F2 || this.key == this.KEY_F3 || this.key == this.KEY_F4 || 
			this.key == this.KEY_F5 || this.key == this.KEY_F6 || this.key == this.KEY_F7 || this.key == this.KEY_F8 || 
			this.key == this.KEY_F9 || this.key == this.KEY_F10 || this.key == this.KEY_F11 || this.key == this.KEY_F12);
};
/* bitfield things */
InputEventDto.prototype.CTRL = 1;
InputEventDto.prototype.ALT = 2;
InputEventDto.prototype.SHIFT = 4;
InputEventDto.prototype.META = 8;
InputEventDto.prototype.MOUSE_1 = 1;
InputEventDto.prototype.MOUSE_2 = 2;
InputEventDto.prototype.MOUSE_3 = 4;
InputEventDto.prototype.MOUSE_4 = 8;
InputEventDto.prototype.MOUSE_5 = 16;
/* these will probably be system dependent and are probably 
	only useful for an initial startup, there is also a very good chance these are just wrong */
InputEventDto.prototype.MOUSE_LEFT = 0;
InputEventDto.prototype.MOUSE_MIDDLE = 1;
InputEventDto.prototype.MOUSE_RIGHT = 2;
InputEventDto.prototype.MOUSE_BACK = 3;
InputEventDto.prototype.MOUSE_FORWARD = 4;
InputEventDto.prototype.KEY_ENTER = 13;
InputEventDto.prototype.KEY_RETURN = 13;
InputEventDto.prototype.KEY_A = 65;
InputEventDto.prototype.KEY_B = 66;
InputEventDto.prototype.KEY_C = 67;
InputEventDto.prototype.KEY_D = 68;
InputEventDto.prototype.KEY_E = 69;
InputEventDto.prototype.KEY_F = 70;
InputEventDto.prototype.KEY_G = 71;
InputEventDto.prototype.KEY_H = 72;
InputEventDto.prototype.KEY_I = 73;
InputEventDto.prototype.KEY_J = 74;
InputEventDto.prototype.KEY_K = 75;
InputEventDto.prototype.KEY_L = 76;
InputEventDto.prototype.KEY_M = 77;
InputEventDto.prototype.KEY_N = 78;
InputEventDto.prototype.KEY_O = 79;
InputEventDto.prototype.KEY_P = 80;
InputEventDto.prototype.KEY_Q = 81;
InputEventDto.prototype.KEY_R = 82;
InputEventDto.prototype.KEY_S = 83;
InputEventDto.prototype.KEY_T = 84;
InputEventDto.prototype.KEY_U = 85;
InputEventDto.prototype.KEY_V = 86;
InputEventDto.prototype.KEY_W = 87;
InputEventDto.prototype.KEY_X = 88;
InputEventDto.prototype.KEY_Y = 89;
InputEventDto.prototype.KEY_Z = 90;
InputEventDto.prototype.KEY_0 = 48;
InputEventDto.prototype.KEY_1 = 49;
InputEventDto.prototype.KEY_2 = 50;
InputEventDto.prototype.KEY_3 = 51;
InputEventDto.prototype.KEY_4 = 52;
InputEventDto.prototype.KEY_5 = 53;
InputEventDto.prototype.KEY_6 = 54;
InputEventDto.prototype.KEY_7 = 55;
InputEventDto.prototype.KEY_8 = 56;
InputEventDto.prototype.KEY_9 = 57;
InputEventDto.prototype.KEY_MINUS = 189;
InputEventDto.prototype.KEY_EQUAL = 187;
InputEventDto.prototype.KEY_LBRACKET = 219;
InputEventDto.prototype.KEY_RBRACKET = 220;
InputEventDto.prototype.KEY_BACKSLACK = 221;
InputEventDto.prototype.KEY_SEMICOLON = 186;
InputEventDto.prototype.KEY_SINGLEQUOTE = 222;
InputEventDto.prototype.KEY_COMMA = 188;
InputEventDto.prototype.KEY_PERIOD = 190;
InputEventDto.prototype.KEY_FORWARDSLASH = 191;
InputEventDto.prototype.KEY_GRAVE = 192;
InputEventDto.prototype.KEY_F1 = 112;
InputEventDto.prototype.KEY_F2 = 113;
InputEventDto.prototype.KEY_F3 = 114;
InputEventDto.prototype.KEY_F4 = 115;
InputEventDto.prototype.KEY_F5 = 116;
InputEventDto.prototype.KEY_F6 = 117;
InputEventDto.prototype.KEY_F7 = 118;
InputEventDto.prototype.KEY_F8 = 119;
InputEventDto.prototype.KEY_F9 = 120;
InputEventDto.prototype.KEY_F10 = 121;
InputEventDto.prototype.KEY_F11 = 122;
InputEventDto.prototype.KEY_F12 = 123;
InputEventDto.prototype.KEY_PRINT = 44;
InputEventDto.prototype.KEY_SCROLL_LOCK = 145;
InputEventDto.prototype.KEY_SPACE = 32;
InputEventDto.prototype.KEY_PAUSE = 19;
InputEventDto.prototype.KEY_INSERT = 45;
InputEventDto.prototype.KEY_DEL = 46;
InputEventDto.prototype.KEY_HOME = 36;
InputEventDto.prototype.KEY_END = 35;
InputEventDto.prototype.KEY_PAGEUP = 33;
InputEventDto.prototype.KEY_PAGEDOWN = 34;
InputEventDto.prototype.KEY_BACKSPACE = 8;
InputEventDto.prototype.KEY_TAB = 9;
InputEventDto.prototype.KEY_CAPSLOCK = 20;
InputEventDto.prototype.KEY_SHIFT = 16;
InputEventDto.prototype.KEY_CTRL = 17;
InputEventDto.prototype.KEY_ALT = 18;
InputEventDto.prototype.KEY_LMETA = 91;
InputEventDto.prototype.KEY_RMETA = 92;
InputEventDto.prototype.KEY_ESCAPE = 27;
InputEventDto.prototype.KEY_MACRO1 = 127;
InputEventDto.prototype.KEY_MACRO2 = 128;
InputEventDto.prototype.KEY_MACRO3 = 129;
InputEventDto.prototype.KEY_MACRO4 = 0;
InputEventDto.prototype.KEY_LEFT = 37;
InputEventDto.prototype.KEY_RIGHT = 39;
InputEventDto.prototype.KEY_UP = 38;
InputEventDto.prototype.KEY_DOWN = 40;
InputEventDto.prototype.KEY_NUMPAD_0 = 96;
InputEventDto.prototype.KEY_NUMPAD_1 = 97;
InputEventDto.prototype.KEY_NUMPAD_2 = 98;
InputEventDto.prototype.KEY_NUMPAD_3 = 99;
InputEventDto.prototype.KEY_NUMPAD_4 = 100;
InputEventDto.prototype.KEY_NUMPAD_5 = 101;
InputEventDto.prototype.KEY_NUMPAD_6 = 102;
InputEventDto.prototype.KEY_NUMPAD_7 = 103;
InputEventDto.prototype.KEY_NUMPAD_8 = 104;
InputEventDto.prototype.KEY_NUMPAD_9 = 105;
InputEventDto.prototype.KEY_NUMPAD_DIVIDE = 111;
InputEventDto.prototype.KEY_NUMPAD_MULTIPLY = 106;
InputEventDto.prototype.KEY_NUMPAD_SUBTRACT = 109;
InputEventDto.prototype.KEY_NUMPAD_ADD = 107;
InputEventDto.prototype.KEY_NUMPAD_PERIOD = 110;
InputEventDto.prototype.KEY_NUMPAD_NUMLOCK = 144;