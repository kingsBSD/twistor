"use strict";

const url = {
	make: state =>
		_.map(state, (val,key) => `${key}=${val}`).join("&"),
	rewrite: state =>
		history.pushState(state,"",`/search?${url.make(state)}`),
	page: take =>
		history.pushState({},"",`/search?${qs}`)//,
	//go: () =>
};
