"use strict";

const _ = require("lodash");
const express = require("express");
const Twit = require("twit");

//FIXME this should go in envs
const config = require("./config.json");
const sql = require("./lib/postgres.js");

const exp = express();
exp.use(express.static("web/static"));
exp.use(express.static("web/build"));

const queryArgs = [
	"u",
	"skip",
	"take",
	"sort",
	"asc"
];

const port = 8081;

exp.get("/api/search", (req,res) => {
console.log(req.query);
	//every arg is optional, defaults to all users skip 0 take 20 orderby time descending
	let args = _.pick(req.query, queryArgs);
	args.asc = args.asc && (args.asc == "true" || args.asc == "1");

	sql.select(args)
		//FIXME this might be leaking stack traces to frontend? idk how, but
		//oh wait, no, it could be throwing somewhere and hitting express... hrm
		//obv test lol
		.then(results => res.send(results))
		.catch(err => {
			//FIXME this is hardly "handling" errors lol
			console.log(err);
			res.status(500).send({});
		});
});

exp.get("/api/userid", (req,res) => {
	const uname = req.query.uname;

	/^[a-zA-Z0-9_]{1,15}$/.test(uname) ?
		sql.snToUid(uname)
			.then(results => res.send(results))
			.catch(err => res.status(err == 404 ? 404 : 500).send({u:""})) :
		res.status(400).send({u:""});
});

exp.get("/debug", (req,res) => {
	res.send(req.query);
});

exp.get("/*", (req,res) => {
	res.sendFile(__dirname + "/web/index.html");
});

exp.listen(port);
console.log(`twistor v${require("./package.json").version}\n${new Date().toISOString()}\nserver @ ${require("os").hostname()}:${port}`);
