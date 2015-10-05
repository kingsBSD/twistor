"use strict";

const url = {
	make: state =>
		_.map(state, (val,key) => `${key}=${val}`).join("&"),
	unmake: qs =>
		_(qs.split("&"))
			.map(kv => kv.split("="))
			.object()
			.value(),
	rewrite: state =>
		history.pushState(state,"",`/search?${url.make(state)}`),
	page: skip => {
		let state = history.state;
		skip ? state.skip = skip : delete state.skip;

		url.rewrite(state);
		url.go();
	},
	submit: formId => {
		let state = _(dom.get(formId))
			.where({name:"grabthis"})
			.filter(el => el.value)
			//FIXME duh lol
			//TODO also I need to validate the text input and swap to a twitter id
			//also also may as well error on bullshit input, not that garbage here matters to the server
			.map(el => [el.id == "handle" ? "u" : el.id, el.type == "checkbox" ? el.checked : el.value])
			.filter(pair => pair[1])
			.object()
			.value();

		const namecheck = subject.checkName(state.u)
			.then(result => state.u = result.u)
			.catch(err => delete state.u);

		namecheck.then(() => url.rewrite(state));
		namecheck.then(() => url.go());
	},
	onload: () => {
		//regex could be fancier but eh, it's just ux
		//server if my code's right should be telling client to get fucked on garbage anyway
		const state = location.search && /^\?[0-9a-z=&_]*$/.test(location.search) ?
			url.unmake(location.search.slice(1)) : {};

		history.replaceState(state,"",location.search ? `/search${location.search}` : "");

		url.go();
	},
	go: () => {
		//honestly conflicted on whether the reject here is a kludge
		const results = location.search ? ajax("GET", `/api/search${location.search}`) :
			Promise.reject(dumpTable());

		results.then(populateTable).catch(err => err && console.log(err));
		results.then(makePageNav).catch(err => err && console.log(err));
	}
};

window.onpopstate = evt => url.go();

dom.get("handle").addEventListener("input",subject.handle,false);
dom.get("handle").addEventListener("input",subject.imgClear,false);
//oninput="subject.handle('handle')" name="grabthis"

url.onload();
