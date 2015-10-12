#!/usr/bin/env node
//I just wanna pipe in from dump-lists anyway so
//the use is something like `./dump-lists.js -if | ./follow.js`
//follows one acct every 8 seconds, no sanity checks so don't like, throw garbage at it lol
//note without followers there is a 2000 followings limit
"use strict";

const _ = require("lodash");
const Promise = require("bluebird");
const Twit = require("twit");

const config = require("../config.json");
const T = new Twit(config.tw);
const self = /^[0-9]*/.exec(config.tw.access_token);

const follow = id =>
	T.post("friendships/create", {user_id: id}, err =>
		console.log(err || `following ${id}`));

const followList = ids => {
	follow(_.head(ids));
	return _.tail(ids).length == 0 || setTimeout(followList,8*1000,_.tail(ids));
};

const followings = new Promise((Y,N) =>
	T.get("friends/ids", {user_id: self, count: 5000, stringify_ids: true}, (err,data) => err ? N(err) : Y(data.ids)));

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", data => {
	const targets = JSON.parse(data);

	followings.then(fols => {
		const diff = _.difference(targets,fols);
		diff.length == 0 || followList(diff);
	});
});
