"use strict";

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
		dom.text(`@${result.screen_name}`),
		dom.elem("br"),
		dom.text(`id: ${result.user_id}`)
	);

	let tweet = dom.elem("td", {rowspan:2});
	tweet.className = "tweet";
	dom.add(tweet, dom.text(result.tweet));

	let metadata = dom.elem("td", {rowspan:2});
	metadata.className = "metadata";
	dom.add(metadata,
		dom.text(`id: ${result.id}`),
		dom.elem("br"),
		dom.text(`tweeted: ${prettyDate(result.tweet_time)}`),
		dom.elem("br"),
		dom.text(`deleted: ${prettyDate(result.delete_time)}`),
		dom.elem("br"),
		dom.text(prettyTime(result.time_diff)),
		dom.elem("br"),
		dom.text(result.source),
		dom.elem("br")
	);

	dom.add(main, av, name, tweet, metadata);

	let userDesc = dom.elem("tr");

	let desc = dom.elem("td", {colspan:2});
	desc.className = "desc";
	dom.add(desc, dom.text(result.description));

	dom.add(userDesc, desc);

	return [main,userDesc];
};

const populateTable = results => {
	window.scroll(0,0);
	let div = dom.get("resultstable");	
	dom.drop(div);

	let table = dom.elem("table");
	dom.add(div, table);

	const rows = _(results.rows)
		.map(result => makeRow(result))
		.flatten()
		.value();

	dom.add(table, ...rows);
};

const makePageNav = results => {
	const skip = parseInt(results.skip,10);
	const take = parseInt(results.take,10);
	const total = parseInt(results.total,10);

	const pages = (total/take|0) + 1;
	const page = (skip/take|0) + 1;

	let nav = dom.get("pagenav");
	dom.drop(nav);

	const displayedPages = _([page])
		.zip(_.range(page-1,0,-1), _.range(page+1,pages+1))
		.flatten()
		.compact()
		.slice(0,10)
		.sortBy()
		.value();

	const anchors = [].concat(
		page > 1 ? dom.aclick(`url.page(0)`, "&lt;&lt;") : dom.text("&lt;&lt;   "),
		page > 1 ? dom.aclick(`url.page(${(page-2)*take})`, "&lt;") : dom.text("&lt; "),
		_.map(displayedPages, num =>
			num == page ? dom.add(dom.elem("strong"), dom.text(num)) : 
				dom.aclick(`url.page(${(num-1)*take})`, num)),
		page < pages ? dom.aclick(`url.page(${page*take})`, "&gt;") : dom.text(" &gt;"),
		page < pages ? dom.aclick(`url.page(${(pages-1)*take})`, "&gt;&gt;") : dom.text("   &gt;&gt;")
	);
		
	dom.add(nav, dom.elem("hr"), ...anchors);
};

const dumpTable = () => {
	window.scroll(0,0);
	dom.drop(dom.get("resultstable"));
	dom.drop(dom.get("pagenav"));
};
