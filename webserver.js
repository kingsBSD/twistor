"use strict";

const config = require("./config.json");
const R = require("ramda");
const express = require("express");
const sql = require("./db.js");

const exp = express();

const queryArgs = [
	"u",
	"skip",
	"take",
	"sort",
	"asc"
];

exp.get("/api", (req,res) => {
console.log(req.query);
	//every arg is optional, defaults to all users skip 0 take 20 orderby time descending
	const results = sql.select(R.pick(queryArgs,req.query))
		.then(results => results.rows)
		.then(rows => res.send(rows))
		.catch(err => {
			//FIXME this is hardly "handling" errors lol
			console.log(err)
			res.status(500).send([]);
		});
});

exp.get("/", (req,res) => {
	res.send("hello friend");
});

exp.listen(8081);
