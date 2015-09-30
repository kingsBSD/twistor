"use strict";

const dom = {
	get: id =>
		document.getElementById(id),
	add: (parent, ...children) => {
		children.forEach(child => parent.appendChild(child))
		return parent;
	},
	elem: (type, ...attrs) => {
		let el = document.createElement(type);
		attrs.forEach(attr => Object.keys(attr).forEach(key => el.setAttribute(key,attr[key])));
		return el;
	},
	text: txt =>
		document.createTextNode(String(txt)
			.replace(/&amp;/g,"&")
			.replace(/&lt;/g,"<")
			.replace(/&gt;/g,">")
		),
	drop: (parent, ...children) => {
		if(children.length === 0)
			while(parent.firstChild)
				parent.removeChild(parent.firstChild);
		else
			children.forEach(child => parent.removeChild(child));

		return parent;
	},
};
