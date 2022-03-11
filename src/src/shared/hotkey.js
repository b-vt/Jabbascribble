/*
*/
function Hotkeys(element) {
	var self = this;
	this.list = [];
	this.keymap = [];
	this.element = element || document.body;
	this.canConsume = true; // if true then a hotkey can use its callback, prevents success callback spam

	this.element.onkeydown = function(event) {
		var input = new InputEventDto(event, self.keymap);
		if (!input.hasKeymapChanged || !input.isModified || self.canConsume == false) return;
		self.onKeyDown(input);
		self.keymap = input.keymap;
		for(var i = 0; i < self.list.length; i++) {
			var hotkey = self.list[i];
			if (hotkey.check(input, event)) {
				self.canConsume = false;
				self.keymap = [];
				break;
			}
		}
	};

	this.element.onkeyup = function(event) { // reset hotkey state
		self.canConsume = true;
		self.keymap = [];
	};
}
/*  */
Hotkeys.prototype.onKeyDown = function(inputDto) {
	return;
};
Hotkeys.prototype.destroy = function() {
	this.list.forEach(function(hotkey) {
		hotkey.destroy();
	});
	this.list = null;
	this.element.onkeydown = null;
	this.element.onkeyup = null;
};
/* same as Hotkey constructor */
Hotkeys.prototype.add = function(modifiers, keys, fnCallback) {
	var hotkey = new Hotkey(modifiers, keys, fnCallback);
	this.list.push(hotkey);
	return this;//hotkey;
};
/*	modifiers = InputEventDto.prototype.CTRL | InputEventDto.prototype.SHIFT, a bitfield
	keys = array of key codes
	callback = do thing on hotkey
	eg, new Hotkey(InputEventDto.prototype.CTRL, [InputEventDto.key=68, InputEventDto.key=69], function(msg) { console.log(msg); })
*/
function Hotkey(modifiers, keys, callback) {
	this.keys = keys;
	this.callback = callback || (() => {});
	this.modifiers = modifiers;
}
/* takes an InputEventDto and tests if a hotkey event can trigger
	*/
Hotkey.prototype.check = function(dto, event) {
	var sets = 0;
	if (this.modifiers != dto.modifiers) return false;
	this.keys.forEach(function(keyCode) {
		if (dto.keymap[" "+(keyCode)] == true) { // " " + 10 because "10" results in array => [empty x 9, 10: true] instead
			sets++;
		}
	});
	if (sets==this.keys.length) {
		this.callback(dto, event);
		return true;
	}
	return false;
};
Hotkeys.prototype.destroy = function() {
	this.keys = null;
	this.callback = null;
};