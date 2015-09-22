"use strict";

const R = require("ramda");
const pg = require("pg");

const db = require("./config.json").db;

//TODO add more when I add more columns ofc
const sorts = [
	"timestamp_ms",
	"time_diff"
];

const exec = (query, params) => {
	params = params || [];

	return new Promise((y,n) => {
		pg.connect(db, (err, client, done) => {
			if(err) {
				done();
				n(err);
			}

			client.query(query, params, (err,data) => {
				done();
				if(err)
					n(err);
				else
					y(data);
			});
		});
	});
};

const argsProcess = args => {

};

module.exports = {
	//TODO add category as a text field to allow filter by that
	//congressperson, senator, etc
	init: () => 
		exec("BEGIN;\
		 \
		 CREATE TABLE IF NOT EXISTS users (\
		 id bigint PRIMARY KEY,\
		 name text NOT NULL,\
		 screen_name text NOT NULL,\
		 description text NOT NULL,\
		 verified boolean NOT NULL,\
		 avatar text NOT NULL,\
		 harvested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()\
		 );\
		 \
		 CREATE TABLE IF NOT EXISTS tweets (\
		 id bigint PRIMARY KEY,\
		 user_id bigint NOT NULL REFERENCES users,\
		 tweet text NOT NULL,\
		 source text NOT NULL,\
		 reply_to_id bigint,\
		 lang text NOT NULL,\
		 timestamp_ms bigint NOT NULL,\
		 harvested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()\
		 );\
		 \
		 CREATE TABLE IF NOT EXISTS deletions (\
		 id bigint PRIMARY KEY REFERENCES tweets,\
		 user_id bigint NOT NULL REFERENCES users,\
		 timestamp_ms bigint NOT NULL,\
		 time_diff integer NOT NULL,\
		 harvested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()\
		 );\
		 \
		 COMMIT;\
		 ")
		 .catch(err => {
			 //FIXME there has to be a more sensible way to handle this lol
			 console.log("db init error (this is very bad)\n",err);
			 process.exit();
		 }),

		addTweet: tweet => exec("INSERT INTO tweets (id,user_id,tweet,source,reply_to_id,lang,timestamp_ms) VALUES ($1,$2,$3,$4,$5,$6,$7)", [tweet.id_str,tweet.user.id_str,tweet.text,tweet.source,tweet.in_reply_to_status_id_str,tweet.lang,tweet.timestamp_ms]),

	addUser: user => exec("INSERT INTO users (id,name,screen_name,description,verified,avatar) SELECT $1,$2,$3,$4,$5,$6 WHERE NOT EXISTS (SELECT id FROM users WHERE id=$1)", [user.id_str,user.name,user.screen_name,user.description,user.verified,user.profile_image_url]),

	addDeletion: del => exec("INSERT INTO deletions (id,user_id,timestamp_ms,time_diff) VALUES ($1,$2,$3,$3 - (SELECT timestamp_ms FROM tweets WHERE id=$1))", [del.status.id_str,del.status.user_id_str,del.timestamp_ms]),

	//args: skip n, take n, u n, (category, tbd), sort [sorts], asc t/f
	select: args => {
		const q = `SELECT * FROM users AS u JOIN tweets AS t ON (u.id = t.user_id) JOIN deletions AS d ON (d.id = t.id) ${args.u ? "WHERE (u.id = $4) " : ""}ORDER BY $1 ${args.asc ? "ASC" : "DESC"} LIMIT $2 OFFSET $3`;
		console.log(q);

		//so it doesn't matter what order they come in
		//FIXME skip take u all seem to work, sort and asc do not
		const params = [].concat(
			R.contains(args.sort, sorts) ? args.sort : "timestamp_ms",
			args.take > 0 && args.take <= 100 && args.take == (args.take|0) ? args.take : 20,
			args.skip > 0 && args.skip == (args.skip|0) ? args.skip : 0,
			args.u ? args.u : []
		);
		console.log(args);
		console.log(params);

		return exec(q, params);
	}
};
