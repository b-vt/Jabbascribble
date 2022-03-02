function Bitfield(field) {
	this.bitfield = field;
};
Bitfield.prototype.add = function(bit) {
	return this.bitfield = this.bitfield | bit;
};
Bitfield.prototype.sub = function(bit) {
	return this.bitfield = this.bitfield & ~bit;
};
Bitfield.prototype.toggle = function(bit) {
	return this.bitfield = this.bitfield ^ bit;
};
Bitfield.prototype.compare = function(bit) {
	return (this.bitfield & bit)!=0;
};