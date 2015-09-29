"use strict";

const _ = require("lodash");
const Twit = require("twit");

//FIXME this should go in envs
const config = require("./config.json");
const sql = require("./lib/postgres.js");

const T = new Twit(config.tw);

const sourceRegex = /^<(?:.*?)>(.*)<\/a>$/;
const selfRegex = /^[0-9]*/;

const self = selfRegex.exec(config.tw.access_token);

//after deciding whether to keep a tweet, pick this list
//TODO actually I guess these are unnecessary, I'm just passing references around and choosing fields by name anyway
//I guess maybe useful for prettyprint but that's kinda it
const keys = [
	"id_str",
	"text",
	"source",
	"in_reply_to_status_id_str",
	"user",
	"lang",
	"timestamp_ms"
];

const ukeys = [
	"id_str",
	"name",
	"screen_name",
	"description",
	"verified",
	"profile_image_url"
];

const processTweet = tweet => {
	tweet.source = sourceRegex.exec(tweet.source)[1];

	return tweet;
};


//---------

console.log(`twistor\nstarting @ ${new Date().toISOString()}`);

sql.init().then(() => console.log("db connected"));
const stream = T.stream("user");

stream.on("connected", () => console.log("listener stream open"));

stream.on("tweet", tweet => {
	if(tweet.user.id == self || tweet.retweeted_status || tweet.user.protected == true)
		return;

	const ptweet = processTweet(tweet);

	sql.upsertUser(ptweet.user)
	.catch(err => console.log(`db add error\n${err}\nuser:\n${JSON.stringify(ptweet,null,"\t")}`))
	.then(() => sql.addTweet(ptweet))
	.catch(err => console.log(`db add error\n${err}\ntweet:\n${JSON.stringify(ptweet,null,"\t")}`));

	console.log(JSON.stringify(ptweet,null,"\t"))
});

stream.on("delete", deletion => {
	sql.addDeletion(deletion.delete)
	//TODO seperate table for orphaned deletes imo
	//for now the fkey will fail and it'll go to logs at least
	.catch(err => console.log(`db deletion add error\n${err}\nmsg:\n${JSON.stringify(deletion,null,"\t")}`));
});
