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
