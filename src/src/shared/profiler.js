function Profiler() {
	this.fnCallback = null;
	this.time = 0;
}
Profiler.prototype.start = function() {
	this.time = new Date().getTime();
	if (this.fnCallback !== null)
		this.fnCallback();
};
Profiler.prototype.stop = function() {
	var i = new Date().getTime() - this.time;
	console.trace("ellapsed time->", i);
};
Profiler.prototype.run = function(func) {
	this.fnCallback = func;
	this.start();
	this.stop();
};