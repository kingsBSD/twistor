"use strict";

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
	//FIXME I am 95% sure these replaces are safe but double-check w someone more experienced
	text: txt =>
		document.createTextNode(txt
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
