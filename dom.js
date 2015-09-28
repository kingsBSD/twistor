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

//ok third try;s the charm. domme's stack I like, tho done again, I'd 
const doom
