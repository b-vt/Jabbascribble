function Finder() {
	// persistent states
	this.findList = []; // 
	this.findListIterator = 0; // which findList item is being viewed
	this.lastTxt = undefined; // if the same as search txt then search will look through findList instead
	this.matches = 0;
	// search cursor state
	this.length = 0;// txt index made by accumulating character matches
	this.startLine = 0;
	this.startCh = 0;
	this.endLine = 0; // persistent line count, does not get reset
	this.endCh = 0; // persistent ch count, on reset to 0 on line breaks
};
Finder.prototype.reset = function(fnNext) {
	//if (typeof fnNext === "function")
	//	fnNext(this, true);
	this.findList = [];
	this.findListIterator = 0;
	this.lastTxt = undefined;
	this.matches = 0;
	this.length = 0;
	this.startLine = 0;
	this.startCh = 0;
	this.endLine = 0;
	this.endCh = 0;
};
Finder.prototype.clear = function() {
	this.length = 0;
	this.startLine = 0;
	this.startCh = 0;
	//this.endLine = 0;
	//this.endCh = 0;
	//this.reset = false;
};
/* fnOnFind({line: this.startLine, ch: this.endCh}, {line: this.startLine, ch: this.endCh}) */
Finder.prototype.search = function(from, txt, fnOnFind, fnNext) {
	if (txt!=this.lastTxt && txt.length > 0) {
		this.reset(fnNext);
		this.lastTxt = txt;
		for(var i = 0; i < from.length; i++) {
			if (from[i] == '\n') {
				// step index & line forward because new line
				this.endLine++;
				this.endCh = 0;
				continue; // continue in case the next character is also new line
			}
			this.endCh++;
			if (from[i] == txt[this.length]) {
				if (this.length == 0) { // this is the first match
					this.startLine = this.endLine;
					this.startCh = this.endCh-1; // endCh - 1 because endCh has already increased
				}
				this.length++;					
			}
			else {
				this.clear();
			}

			if (this.length == txt.length) {
				var mark = {length: this.length,
							startLine: this.startLine,
							startCh: this.startCh,
							endLine: this.endLine, 
							endCh: this.endCh, 
						    id: this.matches++};
				this.findList.push(mark);
				if (typeof fnOnFind === "function")
					fnOnFind(this, mark);
				this.clear();
			}
		}
	}
	else {
		if (txt.length == 0)
			this.reset();
		fnNext(this);
	}
};
Finder.prototype.replace = function(txt, to) {

};
Finder.prototype.forward = function() {
	//this.findListIterator = 
	this.findListIterator = (this.findListIterator+1) % (this.findList.length);
	return this.findListIterator;
};
Finder.prototype.reverse = function() {
	//this.findListIterator = 
	this.findListIterator = (this.findListIterator-1+this.findList.length) % this.findList.length;
	return this.findListIterator;
};
/*var findList = []; // each index contains a span element reference, a CodeMirror.markText object and line details
var findListIterator = 0; // 
var lastTxt = undefined;
var highlights = [];
function clearFinds(cm) {
	cm.doc.getAllMarks(function(mark) {
		mark.clear();
	});
	lastTxt = undefined;
	findList = [];
	highlights = [];
}
function fnFindMatches(txt, caseSensitive, noHighlight) { // ctrl + f
	var edit = GetActiveTabEditor();
	var cm = edit.datum.codemirror;
	var from = cm.doc.getValue();
	if (txt !== lastTxt) { // this is a new search
		clearFinds(cm);
		lastTxt = txt;
		if (txt.length == 0)
			return;
	}
	if (edit && from.length >= txt.length) { // prevent search strings that are larger than the search txt or 
		var matches = 0; // highlight id
		var length = 0;// txt index made by accumulating character matches
		var startLine = 0;
		var startCh = 0;
		var endLine = 0; // persistent line count, does not get reset
		var endCh = 0; // persistent ch count, on reset to 0 on line breaks
		var highlight = null;
		var reset = false;

		if (findList.length > 0) {
			console.log("found some things");
			// locate highlight span element here because codemirror doesn't seem to do this
			if (highlights.length == 0) { // only do this when highlights array is empty
				highlights = document.getElementsByClassName("cm-highlight");
				for(var h = 0; h < highlights.length; h++) {
					var id = parseInt(highlights[h].getAttribute("data-id"));
					findList[id].element = highlights[h];
				}
			}
			//console.log(findListIterator, findList, findList[findListIterator].element);
			//cm.doc.setCursor({line: findList[findListIterator].startLine, ch: 0});
			findList[findListIterator].element.setAttribute("data-highlighted", "0"); // unfocus current highlight				
			findListIterator = (findListIterator+1) % (findList.length);//findListIterator < findList.length - 1 ? findListIterator+1 : 0; // step iterator forward 
			findList[findListIterator].element.setAttribute("data-highlighted", "1"); // focus next highlight
			//console.log(findListIterator, findList[findListIterator].element);
			// now scroll to the highlight
			//var y1 = findList[findListIterator].element.getClientRects()[0].top;
			//var y2 = cm.doc.height;
			//cm.scrollTo(0, y2 - y1);
			return;
		};

		for(var i = 0; i < from.length; i++) {
			if (length == txt.length || reset) {
				if (!reset) {
					if (!noHighlight)
						highlight = cm.doc.markText({line: startLine, ch: startCh}, 
												{line: endLine, ch: endCh}, 
												{className: "cm-highlight", attributes: {"data-id": matches}});
					findList.push({
						length: length,
						startLine: startLine,
						startCh: startCh,
						endLine: endLine,
						endCh: endCh,
						highlight: highlight
					});
					cm.scrollTo(0, endLine * Config.editor.FontSize);
					matches++;
				}
				length = 0;
				startLine = 0;
				startCh = 0;
				highlight = null;
				reset = false;
			}

			if (from[i] == '\n') {
				// step index & line forward because new line
				endLine++;
				endCh = 0;
				i++;
				//continue; // skip the rest of loop because i needs to be increased first
			}
			//var m = (from[i] == txt[length])
			//if (m) {
			if (from[i] == txt[length]) {
				if (length == 0) { // this is the first match
					startLine = endLine;
					startCh = endCh-1; // endCh - 1 because endCh has already increased
				}
				length++;					
			}		
			//if (!m){
			else {
				reset = true;
			}
		}
	}
	else {
		clearFinds(cm);
	}
};
function fnReplace(from, oldTxt, newTxt, replaceAll) {
	console.log(oldTxt, newTxt, replaceAll);
}*/