#!/usr/bin/env node
//pulls the @gov lists defined in slugs, filters each user by keyFilter, prints to stdout
//in future edit to something more generic for ppl to use?
"use strict";

const argv = require("commander")
	.option("-i, --ids", "only output account ids")
	.option("-f, --flatten", "discard categories, output flat list")
	.option("-p, --pretty", "pretty output")
	.parse(process.argv);

const _ = require("lodash");
const Twit = require("twit");

const config = require("../config.json");
const T = new Twit(config.tw);
const gov = 222953824;

const slugs = {
	senate: "us-senate",
	house: "us-house",
	cabinet: "us-cabinet",
	governors: "us-governors",
	mayors: "us-cities"
};

const keyFilter = [
	"id_str",
	"name",
	"screen_name",
	"description",
	"verified",
	"profile_image_url"
];

const userLists = _.mapValues(slugs, slug =>
	new Promise((Y,N) =>
		T.get("lists/members", {owner_id: gov, slug: slug, count: 5000, include_entities: false, skip_status: true},
			(err,data) => err ? N(err) : Y(_.map(data.users, u => _.pick(u, keyFilter))))));

Promise.all(_.values(userLists))
	.then(lists => _(userLists)
		.keys()
		.zip(lists)
		.object()
		.thru(obj => argv.ids ? _.mapValues(obj, cat => _.map(cat, u => u.id_str)) : obj)
		.thru(obj => argv.flatten ? _uniq(_.flatten(_.values(obj)),"id_str") : obj)
		.value()
	)
	.then(obj => process.stdout.write((argv.pretty ? JSON.stringify(obj,null,"\t") : JSON.stringify(obj)) + "\n"));
