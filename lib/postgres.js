"use strict";

const _ = require("lodash");
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

module.exports = {
	//TODO add category as a text field to allow filter by that
	//congressperson, senator, etc
	init: () => 
		exec(`BEGIN;
			
			CREATE TABLE IF NOT EXISTS users (
			id bigint PRIMARY KEY,
			name text NOT NULL,
			screen_name text NOT NULL,
			description text,
			verified boolean NOT NULL,
			avatar text NOT NULL,
			harvested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()
			);
			
			CREATE TABLE IF NOT EXISTS tweets (
			id bigint PRIMARY KEY,
			user_id bigint NOT NULL REFERENCES users,
			tweet text NOT NULL,
			source text NOT NULL,
			reply_to_id bigint,
			lang text NOT NULL,
			tweet_time bigint NOT NULL,
			harvested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()
			);
			
			CREATE TABLE IF NOT EXISTS deletions (
			id bigint PRIMARY KEY REFERENCES tweets,
			user_id bigint NOT NULL REFERENCES users,
			delete_time bigint NOT NULL,
			time_diff integer NOT NULL,
			harvested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()
			);
			
			CREATE TABLE IF NOT EXISTS orphan_deletions (
			id bigint PRIMARY KEY,
			user_id bigint NOT NULL,
			delete_time bigint NOT NULL,
			harvested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()
			);
			
			CREATE INDEX IF NOT EXISTS screen_name_index ON users (screen_name);
			CREATE INDEX IF NOT EXISTS tweet_time_index ON tweets (tweet_time);
			CREATE INDEX IF NOT EXISTS delete_time_index ON deletions (delete_time);
			CREATE INDEX IF NOT EXISTS time_diff_index ON deletions (time_diff);
			CREATE INDEX IF NOT EXISTS d_user_id_index ON deletions (user_id);
			
			COMMIT;
		`)
		.catch(err => {
			//FIXME there has to be a more sensible way to handle this lol
			console.log("db init error (this is very bad)\n",err);
			process.exit();
		}),
	addTweet: tweet =>
		exec("INSERT INTO tweets (id,user_id,tweet,source,reply_to_id,lang,tweet_time) VALUES ($1,$2,$3,$4,$5,$6,$7)", [tweet.id_str,tweet.user.id_str,tweet.text,tweet.source,tweet.in_reply_to_status_id_str,tweet.lang,tweet.timestamp_ms]),
	//FIXME I guess doing this proper doesn't matter, we're just grabbing content that updates in a linear fashion
	//but still it feels gross
	upsertUser: user =>
		exec("SELECT EXISTS (SELECT id FROM users WHERE id=$1) AS exists", [user.id_str])
			.then(result => result.rows[0].exists ?
				"UPDATE users SET (name,screen_name,description,verified,avatar) = ($2,$3,$4,$5,$6) WHERE id=$1" :
				"INSERT INTO users (id,name,screen_name,description,verified,avatar) SELECT $1,$2,$3,$4,$5,$6"
			)
			.then(q => exec(q, [user.id_str,user.name,user.screen_name,user.description,user.verified,user.profile_image_url])),
	addDeletion: del =>
		exec("SELECT EXISTS (SELECT id FROM tweets WHERE id=$1) AS exists", [del.status.id_str])
			.then(result => result.rows[0].exists ? 
				"INSERT INTO deletions (id,user_id,delete_time,time_diff) VALUES ($1,$2,$3,$3 - (SELECT tweet_time FROM tweets WHERE id=$1))" :
				"INSERT INTO orphan_deletions (id,user_id,delete_time) VALUES ($1,$2,$3)"
			)
			.then(q => exec(q,[del.status.id_str,del.status.user_id_str,del.timestamp_ms])),
	//args: skip n, take n, u n, (category, tbd), sort [sorts], asc t/f
	//the contains -> find is perhaps needlessly complicated but I'd rather be extra sure and pick the string from my own list
	select: args => {
		const q = `SELECT * FROM users AS u JOIN tweets AS t ON (u.id = t.user_id) JOIN deletions AS d ON (d.id = t.id) ${args.u ? "WHERE (u.id = $3) " : ""}ORDER BY ${_.contains(sorts, args.sort) ? _.find(sorts, val => val == args.sort) : "delete_time"} ${args.asc ? "ASC" : "DESC"} LIMIT $1 OFFSET $2`;
		console.log(q);

		//so it doesn't matter what order they come in
		const params = [].concat(
			args.take > 0 && args.take <= 100 && args.take == (args.take|0) ? args.take : 20,
			args.skip > 0 && args.skip == (args.skip|0) ? args.skip : 0,
			args.u ? args.u : []
		);

		//TODO doing this every time is wasteful. reltuples isn't guarenteed exact soo cache counts somewhere
		//maybe add an autoupdating column to user table with their delete count
		//that would actually be cool to display on frontend too, plus much cheaper to sum than to do this
		const count = exec(`SELECT COUNT(*) FROM deletions ${args.u ? "WHERE (user_id = $1) " : ""}`, args.u ? [args.u] : []);
		//FIXME err I didn't think exec through, this is taking a second connection from the pool
		//not a terribly annoying fix to let it take a list of queries tho; alternatively combine into one
		const rows = exec(q, params);

		return Promise.all([count,rows]).then(cr => {
			return {
				rows: cr[1].rows,
				//TODO does this object exist if the select matches 0 rows?
				total: cr[0].rows[0].count,
				take: params[0],
				skip: params[1]
			};
		});
	},
	//TODO this is an obv cache target, given list of followings it will taper off into a stable list
	//TODO also might be nice to do impartial matches for a suggestion list?
	snToUid: name =>
		exec("SELECT id FROM users WHERE screen_name=$1", [name])
			.then(result => result.rows.length > 0 ? { u: result.rows[0].id } : Promise.reject(404))
};
