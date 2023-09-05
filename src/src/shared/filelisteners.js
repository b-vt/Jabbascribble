function FileOpenListener() {
	var self = this;
	this.listeners = Object.create(null);
	//this.uniqueListeners = Object.create(null);
	
	window.addEventListener("app-open", function(event) {
		var listeners = self.listeners;
		for(var path in listeners) {
			var listener = listeners[path];
			if (listener) {
				listener(event.detail); 
				// cleanup so this callback only happens once
				listeners[path] = undefined; // todo: probably not needed
				delete listeners[path];
				return;
			}
		}
		
	});
};
FileOpenListener.prototype.add = function(file, fnCallback) {
	if (!this.listeners[file])
		this.listeners[file] = Object.create(null);
	this.listeners[file] = fnCallback;
};

/*FileOpenListener.prototype.once = function(file, fnCallback) {
	if (!this.uniqueListeners[file])
		this.uniqueListeners[file].push(fnCallback);
};*/