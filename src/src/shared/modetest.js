CodeMirror.defineMode("modetest", function(a, b, c) {
	return {
		token: function(stream, state) {
			//stream.eatWhile(/\s/);
			//stream.next();
			//var t = stream.current();
			// operators
			/*if (new RegExp(/\w/).test(t)) {
				return "operator";
			}*/
			stream.eatWhile(/\w/);
			// numbers
			var t= stream.current();
			console.log(t);
			if (new RegExp(/^[0-9]+$/).test(t)) {
				//t=-1;
				return "keyword";
			}
			// tokens
			var t = stream.current();
			switch(t) {
				case -2: {
					return "number";
				}
				case "if":
				case "else":
				case "for":
				case "while":
				case "this":
				case "var": 
				case "function": {
					return "keyword";
				}
				case -1:
				case "try": 
				case "throw": 
				case "catch": 
				case "return": 
				case "break": 
				case "continue": {
					return "operator";
				}
				case "goto": {
					return "asdiJKLok";
				}
				default: {
					break;//return stream.next();
				}
			};
			stream.next();
		}
	};
});