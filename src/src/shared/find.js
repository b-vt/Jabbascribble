function Finder() {
	// persistent states
	this.findList = []; // 
	this.findListIterator = 0; // which findList item is currently being looked up
	this.lastTxt = undefined; // if the same as search txt then search will look through findList instead
	this.matches = 0;
	// search cursor state
	this.length = 0;// txt index made by accumulating character matches
	this.startLine = 0;
	this.startCh = 0;
	this.endLine = 0; // persistent line count, does not get reset
	this.endCh = 0; // persistent ch count, on reset to 0 on line breaks
	this.fnOnFind = () => {};
	this.fnOnRepeat = () => {};
	this.fnOnReset = () => {};
};
Finder.prototype.reset = function(resetIterator) {
	this.lastTxt = undefined;
	this.matches = 0;
	this.length = 0;
	this.startLine = 0;
	this.startCh = 0;
	this.endLine = 0;
	this.endCh = 0;
	this.findList = [];
	if (typeof this.fnOnReset === "function")
		this.fnOnReset(this);
	if (resetIterator) this.findListIterator = 0;
};
Finder.prototype.clear = function() {
	this.length = 0;
	this.startLine = 0;
	this.startCh = 0;
};
Finder.prototype.repeat = function(ascending) {
	var item1 = this.findList[this.findListIterator];
	if (ascending)
		var it = this.reverse();
	else
		var it = this.forward();
	var item2 = this.findList[it];
	if (item1 && item2)
		this.fnOnRepeat(this, {length: item2.length,
								startLine: item2.startLine,
								startCh: item2.startCh,
								endLine: item2.endLine, 
								endCh: item2.endCh, 
								id: item2.id},
							   {length: item1.length,
								startLine: item1.startLine,
								startCh: item1.startCh,
								endLine: item1.endLine, 
								endCh: item1.endCh, 
								id: item1.id});
};
Finder.prototype.search = function(from, txt, ascending) {
	if (txt!=this.lastTxt && txt.length > 0) {
		this.reset(true);
		this.lastTxt = txt;
		for(var i = 0; i < from.length; i++) {
			if (from[i] == '\n') {
				// step index & line forward because new line
				this.endLine++;
				this.endCh = 0;
				continue; // continue in case the next character is also new line
			}
			if (from[i] == txt[this.length]) {
				if (this.length == 0) { // this is the first match
					this.startLine = this.endLine;
					this.startCh = this.endCh; // endCh - 1 because endCh has already increased
				}
				this.length++;					
			}
			else {
				this.clear();
			}
			this.endCh++;
			if (this.length == txt.length) {
				var mark = {length: this.length,
							startLine: this.startLine,
							startCh: this.startCh,
							endLine: this.endLine, 
							endCh: this.endCh, 
						    id: this.matches++};
				this.findList.push(mark);
				if (typeof this.fnOnFind === "function")
					this.fnOnFind(this, mark);
				this.clear();
			}
		}
	}
	if (txt.length == 0)
		return this.reset();
	this.repeat(ascending);
};
Finder.prototype.replace = function(txt, to) {

};
Finder.prototype.forward = function() {
	this.findListIterator = (this.findListIterator+1) % (this.findList.length);
	return this.findListIterator;
};
Finder.prototype.reverse = function() {
	this.findListIterator = (this.findListIterator-1+this.findList.length) % this.findList.length;
	return this.findListIterator;
};