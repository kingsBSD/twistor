"use strict";

const ajax = (method,target) => {
	return new Promise((Y,N) => {
		let req = new XMLHttpRequest();

		req.open(method, target, true);

		req.onreadystatechange = () => {
			if(req.readyState == 4) { 
				if(req.status >= 200 && req.status < 400) { 
					try {
						let res = JSON.parse(req.response);
						Y(res);
					} catch(err) {
						N(err);
					}
				}
				else {
					N(new Error(`${req.url} failed: ${req.status} ${req.statusText}`));
				}
			}
		};

		req.send();
	});
};

const lookup = formId => {
	let pairs = _(dom.get(formId))
		.where({name:"grabthis"})
		.filter(el => el.value)
		//FIXME duh lol
		//TODO also I need to validate the text input and swap to a twitter id
		//also also may as well error on bullshit input, not that garbage here matters to the server
		.map(el => [el.id, el.type == "checkbox" ? el.checked : el.value])
		.filter(pair => pair[1])
		.value();

	let qs = _.map(pairs, pair => pair.join("=")).join("&");
	console.log(qs);

	//FIXME again, obviously. it's just way past my bedtime rn
	ajax("GET", "/api?" + qs)
		.then(populateTable)
		.catch(err => console.log(err));
};
