"use strict";

const _ = require("lodash");
const Promise = require("bluebird");
const Twit = require("twit");

//FIXME this should go in envs
const config = require("./config.json");
const sql = require("./lib/postgres.js");

const T = new Twit(config.tw);

const sourceRegex = /^<(?:.*?)>(.*)<\/a>$/;
const selfRegex = /^[0-9]*/;

const self = selfRegex.exec(config.tw.access_token);

const processTweet = tweet => {
	tweet.source = sourceRegex.exec(tweet.source)[1];

	return tweet;
};


//---------

console.log(`twistor v${require("./package.json").version}\n${new Date().toISOString()}`);

sql.init().then(() => console.log("db connected"));
const stream = T.stream("user");

stream.on("connected", () => console.log("stream open\nlistening..."));

stream.on("tweet", tweet => {
	if(tweet.user.id == self || tweet.retweeted_status || tweet.user.protected == true)
		return;

	const ptweet = processTweet(tweet);

	sql.upsertUser(ptweet.user)
	.catch(err => console.log(`db add error\n${err}\nuser:\n${JSON.stringify(ptweet,null,"\t")}`))
	.then(() => sql.addTweet(ptweet))
	.catch(err => console.log(`db add error\n${err}\ntweet:\n${JSON.stringify(ptweet,null,"\t")}`));

	//console.log(JSON.stringify(ptweet,null,"\t"))
	console.log(`@${ptweet.user.screen_name}: ${ptweet.text}`);
});

stream.on("delete", deletion => {
	sql.addDeletion(deletion.delete)
	.catch(err => console.log(`db deletion add error\n${err}\nmsg:\n${JSON.stringify(deletion,null,"\t")}`));

	console.log(`delete: ${deletion.delete.status.id_str}`);
});
