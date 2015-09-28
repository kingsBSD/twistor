"use strict";
//ooook getting way off topic let's move this to its own file

var dom = {
	get: function get(id) {
		return document.getElementById(id);
	},
	add: function add(parent) {
		for (var _len = arguments.length, children = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			children[_key - 1] = arguments[_key];
		}

		return children.forEach(function (child) {
			return parent.appendChild(child);
		});
	},
	elem: function elem(type) {
		for (var _len2 = arguments.length, attrs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
			attrs[_key2 - 1] = arguments[_key2];
		}

		var el = document.createElement(type);
		attrs.forEach(function (attr) {
			return Object.keys(attr).forEach(function (key) {
				return el.setAttribute(key, attr[key]);
			});
		});
		return el;
	},
	text: function text(txt) {
		return document.createTextNode(txt);
	},
	drop: function drop(parent) {
		for (var _len3 = arguments.length, children = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
			children[_key3 - 1] = arguments[_key3];
		}

		if (children.length === 0) while (parent.firstChild) parent.removeChild(parent.firstChild);else children.forEach(function (child) {
			return parent.removeChild(child);
		});

		return parent;
	}
};
//TEST
/*
let div = dom.get("testbed");
dom.add(div, dom.elem("img", {src: "http://www.alicemaz.com/img/face-mc.png", width: "5px"}, {height: "10px"}));
dom.add(div, dom.elem("br"), dom.elem("br"), dom.elem("hr"), dom.text("gay"), dom.elem("div", {id: "gaaay"}));
dom.add(dom.get("gaaay"), dom.text("sweet"), dom.elem("div", {id: "fuckthis"}));
dom.drop(dom.get("gaaay"), dom.get("fuckthis"));
*/
//ENDTEST

/*
//hmm ok that stuff is cool but let's try something a lil different
const domme = function domme(magic) {
	if(this instanceof domme) {
		this.stack = [];
		if(magic instanceof Element)
			this.element = magic;
		else if(document.getElementById(magic))
			this.element = document.getElementById(magic);
		//prolly keep a list of valid types instead of this
		//if I end up liking this wrapper lib
		//also prioritize over getElById
		else if(typeof magic === "string")
			this.element = document.createElement(magic);
		//mb do something clever w this later
	//	else if(magic === undefined)
	//		;
		else
			throw new Error("hi alice you are either fucking up hard or need to add something to the if");
	}
	else
		return new domme(magic);
};

domme.prototype = {
	child: function(magic) {
		this.element.appendChild(domme(magic).element);
		return this;
	},
	img: function(url,alt="") {
		let img = document.createElement("img");
		img.src = url;
		img.alt = img.title = alt;
		this.element.appendChild(img);
		return this;
	},
	txt: function(text) {
		this.element.appendChild(document.createTextNode(text));
		return this;
	},
	put: function(parent=document.body) {
		parent.appendChild(this.element);
		return domme(parent);
	},
	push: function() {
		this.stack.push(this.element);
		return this;
	},
	pop: function() {
		this.element = this.stack.pop();
		return this;
	},
	cat: function() {
		this.stack[this.stack.length - 1].appendChild(this.element);
		return this;
	},
	sub: function(magic) {
		this.element = domme(magic).element;
		return this;
	}
};

domme("div")
.txt("hello friends")
.child("br")
.txt("still lots of work")
.child("hr")
.img("http://www.alicemaz.com/img/face-mc.png","but")
.cache()
.sub("div")
.txt("don't worry")
.cache()
.sub("div")
.txt("I intend to go deeper")
.cat()
.recall()
.cat()
.recall()
.child("br")
.put();omme("div")
.txt("hello friends")
.child("br")
.txt("still lots of work")
.child("hr")
.img("http://www.alicemaz.com/img/face-mc.png","but")
.cache()
.sub("div")
.txt("don't worry")
.cache()
.sub("div")
.txt("I intend to go deeper")
.cat()
.recall()
.cat()
.recall()
.child("br")
.put();
*/

//ok third try;s the charm. domme's stack I like kinda
//if I go with that prolly integrate stack into the constructor to build it more seamlessly
//but either way reference becomes a problem unless you build the dom as you traverse
//enter... Domme Level 3
var domme = function domme(magic) {
	var buffer = arguments.length <= 1 || arguments[1] === undefined ? 2048 : arguments[1];

	if (this instanceof domme) {
		this.R = new Array(buffer);
		for (var i = 0; i < this.R.length; i++) {
			this.R[i] = null;
		}this.ptr = 0;
		this.R[0] = this._magic(magic);
	} else return new domme(magic);
};

//PROTIP/FIXME you cannot safely use this with elems with integer ids < buffer size
//certain functions will take those ids and check the buffer for an elem and use that
//this isn't an issue if you pass said ids as strings, but you have to be careful
//tho I guess if you're using this you have yo be careful anyway
domme.prototype = {
	//FIXME make sure these actually work right lol, untested
	l: function l() {
		var prel = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

		if (!Number.isInteger(prel)) throw new Error("no");
		if (prel < 0) return this.r(prel * -1);

		this.ptr = this.ptr - prel < 0 ? this.R.length + this.ptr - prel : this.ptr - prel;
		return this;
	},
	r: function r() {
		var prel = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

		if (!Number.isInteger(prel)) throw new Error("please stop");
		if (prel < 0) return this.l(prel * -1);

		this.ptr = this.ptr + prel >= this.R.length ? this.ptr + prel - this.R.length : this.ptr + prel;
		return this;
	},
	j: function j() {
		var prel = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

		if (!Number.isInteger(prel) || prel < 0 || prel >= this.R.length) throw new Error("absolutely not");

		this.ptr = prel;
		return this;
	},
	create: function create(magic) {
		var prel = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

		this.R[this.ptr] = this._magic(magic);

		this.r(prel);
		return this;
	},
	child: function child(magic) {
		var prel = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

		if (Number.isInteger(magic) && this.R[magic] instanceof Element) this.R[this.ptr].appendChild(this.R[magic]);else this.R[this.ptr].appendChild(this._magic(magic));

		this.r(prel);
		return this;
	},
	/*
 img: function(url,alt="") {
 	let img = document.createElement("img");
 	img.src = url;
 	img.alt = img.title = alt;
 	this.element.appendChild(img);
 	return this;
 },
 */
	txt: function txt(text) {
		var prel = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

		this.R[this.ptr].appendChild(document.createTextNode(text));

		this.r(prel);
		return this;
	},
	//TODO prolly use magic here
	put: function put() {
		var parent = arguments.length <= 0 || arguments[0] === undefined ? document.body : arguments[0];
		var prel = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

		parent.appendChild(this.R[this.ptr]);

		this.r(prel);
		return this;
	},
	/*
 push: function() {
 	this.stack.push(this.element);
 	return this;
 },
 pop: function() {
 	this.element = this.stack.pop();
 	return this;
 },
 cat: function() {
 	this.stack[this.stack.length - 1].appendChild(this.element);
 	return this;
 },
 sub: function(magic) {
 	this.element = domme(magic).element;
 	return this;
 },
 */
	//private methods
	_magic: function _magic(magic) {
		if (magic instanceof Element) return magic;else if (document.getElementById(magic)) return document.getElementById(magic);else if (typeof magic === "string") return document.createElement(magic);else throw new Error("what the fuck");
	}
};
/*
var x = domme("div")
.r()
.create("div")
.txt("hey check this out", 1)
.create("div")
.txt("kinda neat imo")
.child("br", -1)
.child(2)
.r(2)
.create("div")
.txt("haha sweet")
.j()
.child(1)
.child(3)
.put();

var y = domme("div")
.r()
.create("div", 1)
.create("div", 1)
.create("div", 1)
.put()
*/