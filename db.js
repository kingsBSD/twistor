"use strict";

const R = require("ramda");
const pg = require("pg");

const db = require("./config.json").db;

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

module.exports = {
	init: () => 
	exec("BEGIN;\
		 \
		 CREATE TABLE IF NOT EXISTS users (\
		 id bigint PRIMARY KEY,\
		 name text NOT NULL,\
		 screen_name text NOT NULL,\
		 description text NOT NULL,\
		 verified boolean NOT NULL,\
		 created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()\
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
		 created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()\
		 );\
		 \
		 CREATE TABLE IF NOT EXISTS deletions (\
		 id bigint PRIMARY KEY REFERENCES tweets,\
		 user_id bigint NOT NULL REFERENCES users,\
		 timestamp_ms bigint NOT NULL,\
		 time_diff integer NOT NULL,\
		 created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()\
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

		 addUser: user => exec("INSERT INTO users (id,name,screen_name,description,verified) SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS (SELECT id FROM users WHERE id=$1)", [user.id_str,user.name,user.screen_name,user.description,user.verified]),

		 addDeletion: del => exec("INSERT INTO deletions (id,user_id,timestamp_ms,time_diff) VALUES ($1,$2,$3,$3 - (SELECT timestamp_ms FROM tweets WHERE id=$1))", [del.status.id_str,del.status.user_id_str,del.timestamp_ms])
};
