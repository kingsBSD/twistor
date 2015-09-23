"use strict";

const R = require("ramda");
const pg = require("pg");

//FIXME this should go in envs
const config = require("../config.json");

//TODO add more when I add more columns ofc
//FIXME this... maybe shouldn't depend on my AS (u|t|d)?
const sorts = [
	"tweet_time",
	"delete_time",
	"time_diff"
];

const exec = (query, params) => {
	params = params || [];

	return new Promise((y,n) => {
		pg.connect(config.db, (err, client, done) => {
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
		 tweet_time bigint NOT NULL,\
		 harvested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()\
		 );\
		 \
		 CREATE TABLE IF NOT EXISTS deletions (\
		 id bigint PRIMARY KEY REFERENCES tweets,\
		 user_id bigint NOT NULL REFERENCES users,\
		 delete_time bigint NOT NULL,\
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

		addTweet: tweet => exec("INSERT INTO tweets (id,user_id,tweet,source,reply_to_id,lang,tweet_time) VALUES ($1,$2,$3,$4,$5,$6,$7)", [tweet.id_str,tweet.user.id_str,tweet.text,tweet.source,tweet.in_reply_to_status_id_str,tweet.lang,tweet.timestamp_ms]),

	addUser: user => exec("INSERT INTO users (id,name,screen_name,description,verified,avatar) SELECT $1,$2,$3,$4,$5,$6 WHERE NOT EXISTS (SELECT id FROM users WHERE id=$1)", [user.id_str,user.name,user.screen_name,user.description,user.verified,user.profile_image_url]),

	addDeletion: del => exec("INSERT INTO deletions (id,user_id,delete_time,time_diff) VALUES ($1,$2,$3,$3 - (SELECT tweet_time FROM tweets WHERE id=$1))", [del.status.id_str,del.status.user_id_str,del.timestamp_ms]),

	//args: skip n, take n, u n, (category, tbd), sort [sorts], asc t/f
	//the contains -> find is perhaps needlessly complicated but I'd rather be extra sure and pick the string from my own list
	select: args => {
		const q = `SELECT * FROM users AS u JOIN tweets AS t ON (u.id = t.user_id) JOIN deletions AS d ON (d.id = t.id) ${args.u ? "WHERE (u.id = $3) " : ""}ORDER BY ${R.contains(args.sort, sorts) ? R.find(val => val == args.sort, sorts) : "delete_time"} ${args.asc ? "ASC" : "DESC"} LIMIT $1 OFFSET $2`;
		console.log(q);

		//so it doesn't matter what order they come in
		const params = [].concat(
			args.take > 0 && args.take <= 100 && args.take == (args.take|0) ? args.take : 20,
			args.skip > 0 && args.skip == (args.skip|0) ? args.skip : 0,
			args.u ? args.u : []
		);

		return exec(q, params);
	}
};
