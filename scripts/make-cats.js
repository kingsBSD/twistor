#!/usr/bin/env node
//obv this is ugly but hey it should only needs to run once
//`./scripts/dump-lists.js > catobjs.json` and load that file here
//adds them all to the db, adds the categories, and links the two
//rather than depending on/fucking with postgres.js I'll just do the inserts here
//in theory the account/category lists would only need major updating every two years
"use strict";

const _ = require("lodash");
const Promise = require("bluebird");
const pg = require("pg");

const config = require("../config.json");
const targets = require("../catobjs.json");

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

const catstring = _(targets).keys().map(cat => `('${cat}')`).join(",");

exec(`INSERT INTO categories (category) VALUES ${catstring} ON CONFLICT DO NOTHING`)
	.then(() => exec("select * from categories"))
	.then(cats => _.map(cats.rows, row => _.values(row)))
	.then(catpairs => _.each(targets, (users,group) => _.each(users, user =>
		exec(`INSERT INTO users (id,name,screen_name,description,verified,avatar)
			VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
			[user.id_str,user.name,user.screen_name,user.description,user.verified,user.profile_image_url])
			.tap(() => console.log(`linking ${user.name} to ${group}`))
			.then(() => exec(`INSERT INTO user_cats (user_id,cat_id) VALUES ($1,$2)
				ON CONFLICT DO NOTHING`,[user.id_str,_.find(catpairs, pair => pair[1] == group)[0]])))));
