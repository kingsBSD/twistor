"use strict";
//ooook getting way off topic let's move this to its own file

const dom = {
	get: id =>
		document.getElementById(id),
	add: (parent, ...children) =>
		children.forEach(child => parent.appendChild(child)),
	elem: (type, ...attrs) => {
		let el = document.createElement(type);
		attrs.forEach(attr => Object.keys(attr).forEach(key => el.setAttribute(key,attr[key])));
		return el;
	},
	text: txt =>
		document.createTextNode(txt),
	drop: (parent, ...children) => {
		if(children.length === 0)
			while(parent.firstChild)
				parent.removeChild(parent.firstChild);
		else
			children.forEach(child => parent.removeChild(child));

		return parent;
	},
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
const domme = function domme(magic, buffer = 2048) {
	if(this instanceof domme) {
		this.R = new Array(buffer);
		for(let i = 0; i < this.R.length; i++)
			this.R[i] = null;
		this.ptr = 0;
		this.R[0] = this._magic(magic);
	}
	else
		return new domme(magic);
};

//PROTIP/FIXME you cannot safely use this with elems with integer ids < buffer size
//certain functions will take those ids and check the buffer for an elem and use that
//this isn't an issue if you pass said ids as strings, but you have to be careful
//tho I guess if you're using this you have yo be careful anyway
domme.prototype = {
	//FIXME make sure these actually work right lol, untested
	l: function(prel = 1) {
		if(!Number.isInteger(prel))
			throw new Error("no");
		if(prel < 0)
			return this.r(prel * -1);

		this.ptr = this.ptr - prel < 0 ? this.R.length + this.ptr - prel : this.ptr - prel;
		return this;
	},
	r: function(prel = 1) {
		if(!Number.isInteger(prel))
			throw new Error("please stop");
		if(prel < 0)
			return this.l(prel * -1);
		
		this.ptr = this.ptr + prel >= this.R.length ? this.ptr + prel - this.R.length : this.ptr + prel;
		return this;
	},
	j: function(prel = 0) {
		if(!Number.isInteger(prel) || prel < 0 || prel >= this.R.length)
			throw new Error("absolutely not");

		this.ptr = prel;
		return this;
	},
	create: function(magic, prel = 0) {
		this.R[this.ptr] = this._magic(magic);

		this.r(prel);
		return this;
	},
	child: function(magic, prel = 0) {
		if(Number.isInteger(magic) && this.R[magic] instanceof Element)
			this.R[this.ptr].appendChild(this.R[magic]);
		else
			this.R[this.ptr].appendChild(this._magic(magic));
		
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
	txt: function(text, prel = 0) {
		this.R[this.ptr].appendChild(document.createTextNode(text));

		this.r(prel);
		return this;
	},
	//TODO prolly use magic here
	put: function(parent = document.body, prel = 0) {
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
	lodash: function() {
		//FIXME set this up for a clean transition back to 
		_.cache(this);
		return _.chain(this.R);
	},
	//private methods
	_magic: function(magic) {
		if(magic instanceof Element)
			return magic;
		else if(document.getElementById(magic))
			return document.getElementById(magic);
		else if(typeof magic === "string")
			return document.createElement(magic);
		else
			throw new Error("what the fuck");
	}
};

_.mixin({cache: function(domme) { this.domme = domme; },
	out: function(x) { x.wrapperValue(); return this.domme; },
	testy: function(wrapped) { console.log(wrapped); return wrapped.value(); }
},{chain: true});

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
.lodash()
.map(el => {
	el && el.appendChild(document.createElement("p"));
	return el;
})

//.testy();
//.out();
//.put();
