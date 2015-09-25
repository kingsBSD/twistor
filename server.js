"use strict";

const _ = require("lodash");
const express = require("express");
const Twit = require("twit");

//FIXME this should go in envs
const config = require("./config.json");
const sql = require("./lib/postgres.js");

const exp = express();
exp.use(express.static("web/static"));

const queryArgs = [
	"u",
	"skip",
	"take",
	"sort",
	"asc"
];

const port = 8081;

exp.get("/api", (req,res) => {
console.log(req.query);
	//every arg is optional, defaults to all users skip 0 take 20 orderby time descending
	let args = _.pick(req.query, queryArgs);
	args.asc = args.asc && (args.asc == "true" || args.asc == "1");

	sql.select(args)
		.then(results => results.rows)
		.then(rows => res.send(rows))
		.catch(err => {
			//FIXME this is hardly "handling" errors lol
			console.log(err)
			res.status(500).send([]);
		});
});

exp.get("/debug", (req,res) => {
	res.send(req.query);
});

exp.get("/*", (req,res) => {
	res.sendFile(__dirname + "/web/index.html");
});

exp.listen(port);
console.log(`listening on ${port}`);
