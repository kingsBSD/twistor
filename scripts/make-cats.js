#!/usr/bin/env node
//obv this is hilariously bad but hey it should only need to run once
//given a bunch of user objs, categorized like dump-lists.js ouputs with no flags
//adds them all to the db, adds the categories, and links the two
//rather than depending on/fucking with postgres.js I'll just do the inserts here
//in theory the account/category lists would only need major updating every two years
"use strict";

const _ = require("lodash");
const Promise = require("bluebird");
const pg = require("pg");
const Twit = require("twit");

const config = require("../config.json");
const T = new Twit(config.tw);
//const self = /^[0-9]*/.exec(config.tw.access_token);

const exec = (query, params) => {
	params = params || [];
	
	return new Promise((Y,N) => {
		pg.connect(config.db, (err, client, done) => {
			if(err) {
				done();
				N(err);
			}

			client.query(query, params, (err,data) => {
				done();
				if(err)
					N(err);
				else
					Y(data);
			});
		});
	});
};

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", data => {
	const targets = JSON.parse(data);
	const categories = _.keys(targets);

	//note this is obviously unsafe
	//but if this is exposed to the world, there are bigger problems lol
	//also note this prolly destroys syntax highlighting, but it does work
	//FIXME ok it doesn't wait for end of input so I guess I have to fs.readSync it zz
	exec(`insert into categories (category) values ${_.map(categories, cat => `(${cat})`).join(",")} on conflict do nothing`)
	.then(() => exec("select * from categories"))
	.then(cats => console.log(cats.rows));
	/*
	.then(() => _.each(targets, (users,group) => _.each(users, user =>
		exec("INSERT INTO users (id,name,screen_name,description,verified,avatar) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING", [user.id_str,user.name,user.screen_name,user.description,user.verified,user.profile_image_url])
			.then(() => exec(`insert into user_cats (user_id,cat_id) values (${user.id_str},

*/
});
