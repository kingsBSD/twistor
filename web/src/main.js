"use strict";

//alice stdlib lol
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
	let qs = _(dom.get(formId))
		.where({name:"grabthis"})
		.filter(el => el.value)
		//FIXME duh lol
		//TODO also I need to validate the text input and swap to a twitter id
		//also also may as well error on bullshit input, not that garbage here matters to the server
		.filter(el => el.id != "handle")
		.map(el => [el.id, el.type == "checkbox" ? el.checked : el.value].join("="))
		.join("&");

	//FIXME again, obviously. it's just way past my bedtime rn
	ajax("GET", "/api?" + qs)
		.then(populateTable)
		.catch(err => console.log(err));
};

const prettyDate = timestamp =>
	new Date(parseInt(timestamp,10)).toISOString().slice(0,18);

const prettyTime = time => {
	let s = parseInt(time,10)/1000,
		m = s/60,
		h = m/60,
		d = h/24,
		M = d/30,
		y = d/365;

	let xo = (num,word) => {
		num = Math.round(num);
		return `~${num} ${word}${num == 1 ? "" : "s"}`;
	};
	
	return m < 1 ? xo(s,"second") :
		h < 1 ? xo(m,"minute") :
		d < 1 ? xo(h,"hour") :
		M < 1 ? xo(d,"day") :
		y < 1 ? xo(M,"month") :
				xo(y,"year");
};


const makeRow = result => {
	let main = dom.elem("tr");

	let av = dom.elem("td");
	av.className = "av";
	dom.add(av, dom.elem("img",{src: result.avatar}));

	let name = dom.elem("td");
	name.className = "name";
	dom.add(name,
		dom.text(result.name),
		dom.elem("br"),
		dom.text("@"+result.screen_name)
	);

	let tweet = dom.elem("td", {rowspan:2});
	tweet.className = "tweet";
	dom.add(tweet, dom.text(result.tweet));

	let metadata = dom.elem("td", {rowspan:2});
	metadata.className = "metadata";
	dom.add(metadata,
		dom.text(`tweeted: ${prettyDate(result.tweet_time)}`),
		dom.elem("br"),
		dom.text(`deleted: ${prettyDate(result.delete_time)}`),
		dom.elem("br"),
		dom.text(prettyTime(result.time_diff)),
		dom.elem("br")
	);

	dom.add(main, av, name, tweet, metadata);

	let userDesc = dom.elem("tr");

	let desc = dom.elem("td", {colspan:2});
	dom.add(desc, dom.text(result.description));

	dom.add(userDesc, desc);

	return [main,userDesc];
};

const populateTable = results => {
	let table = dom.get("resultsTable");	
	dom.drop(table);

	let rows = _(results)
		.map(result => makeRow(result))
		.flatten()
		.value();

	dom.add(table, ...rows);
};
