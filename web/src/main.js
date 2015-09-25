"use strict";

//goddamn this motherfucker is ugly lol
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
		}

		req.send();
	});
};

const lookup = formId => {
	let inputs = _(document.getElementById(formId))
		.filter(el => el.type != "button")
		.map(el => {
			return {
				id: el.id,
				type: el.type,
				val: el.type == "checkbox" ? el.checked : el.value
			}
		})
		.value();

	//TODO I need to validate the text input and swap to a twitter id
	//also may as well error on bullshit input, not that garbage here matters to the server
	const qs = _(inputs)
		.filter(el => el.id != "handle") //FIXME duh lol
		.map(el => [el.id,el.val].join("="))
		.join("&");

	//FIXME again, obviously. it's just way past my bedtime rn
	ajax("GET", "/api?" + qs)
		.then(res => console.log(res));
};
