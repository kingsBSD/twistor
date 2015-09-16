"use strict";

const config = require("./config.json");
const Twit = require("twit");
const throttle = require("lodash/function/throttle");
const R = require("ramda");
const sql = require("./db.js");

const T = new Twit(config.tw);

const self = 3168258306;

//after deciding whether to keep a tweet, R.pick this list
//TODO actually I guess these are unecessary, I'm just passing references around and choosing fields by name anyway
//I guess maybe useful for prettyprint but that's kinda it
const keys = [
	"id_str",
	"text",
	//trim the html out of this
	"source",
	"in_reply_to_status_id_str",
	//user objs are rather large, we should store single copies on their own table and check for changes
	//or perhaps just store once, thus we have the oldest (from start of this anyway) and newest is on twitter
	//orrrr actually some fields change often (follow/following) some *always* (statuses_count)
	//cache mm... user.(id_str, name, screen_name, verified)
	//a sensible default would prolly be to discard protected accounts' tweets, drop location data
	//tho... fuck that gives me an even better idea for a bot, archive locations of all verified govt accts that tweet geo data
	//link it up with google maps omg this is genius
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
];

const processTweet = tweet => {
	tweet.source = /^<(?:.*?)>(.*)<\/a>$/.exec(tweet.source)[1];

	return tweet;
};


//---------

console.log(`twistor\nstarting @ ${new Date().toISOString()}`);

sql.init().then(() => console.log("db connected"))
//this seems to work, don't need it in this file tho
.then(() => sql.select({}))
.then(results => console.log(JSON.stringify(results,null,"\t")))
.catch(err => console.log(err));

const stream = T.stream("user");
stream.on("connected", () => console.log("stream open"));

//const followings = new Promise(Y => stream.on("friends", data => Y(data.friends)));

stream.on("tweet", tweet => {
	if(tweet.user.id == self || tweet.retweeted_status || tweet.user.protected == true)
		return;

	const ptweet = processTweet(tweet);

	sql.addUser(ptweet.user)
	.then(() => sql.addTweet(ptweet))
	//TODO don't clutter logs with success messages, simply existing in the db is evidence of success
	//if I wrap this in a cli module this would be something for a -v flag
	.then(result => console.log(`op:\n${JSON.stringify(result,null,"\t")}\nrows:\n${JSON.stringify(result.rows,null,"\t")}`))
	.catch(err => console.log(`db add error\nerror:\n${err}\ntweet:\n${JSON.stringify(ptweet,null,"\t")}`));

	console.log(JSON.stringify(ptweet,null,"\t"))
});

stream.on("delete", deletion => {
	sql.addDeletion(deletion.delete)
	.then(result => console.log(`op:\n${JSON.stringify(result,null,"\t")}\nrows:\n${JSON.stringify(result.rows,null,"\t")}`))
	.catch(err => console.log(`db deletion add error\nerror:\n${err}\nmsg:\n${JSON.stringify(deletion,null,"\t")}`));
	
	//console.log(JSON.stringify(deletion,null,"\t"))
});

