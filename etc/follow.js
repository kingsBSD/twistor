"use strict";

const fs = require("fs");
const path = require("path");
const Twit = require("twit");
const R = require("ramda");

const T = new Twit(require("./config.json").tw);

//obv change this if they ever go away or stop updating their lists but
//it's a nice set of lists definitely
const cspan = 15675138;
//FIXME just a test acct now but the real acct should be kept secret
const self = 3717100756;

//interesting ones for our purposes, do note there are more
//esp "foreign-leaders"
const slugs = [
//TODO remember to uncomment these when I set the actual thing up lol
	"members-of-congress",
	"presidential-candidates"//,
//	"governors"
];

//FIXME they are however insufficient, we also need @potus and whatever cabinet/mil/intel heads are on twitter

const getUserId = R.map(user => user.id_str);

const getList = R.curry((id,slug) =>
	new Promise((y,n) =>
		T.get("lists/members",
			{owner_id: id, slug: slug, count: 5000, include_entities: false, skip_status: true},
			(err,data) => err ? n(err) : y(getUserId(data.users)))));

const follow = id => T.post("friendships/create", {user_id: id}, err => console.log(err || `following ${id}`));
const followAll = ids => (R.head(ids) && (ids => {
		follow(R.head(ids));
		setTimeout(followAll,8*1000,R.tail(ids));
	})(ids));

const lists = R.map(getList(cspan),slugs);
const followings = new Promise((y,n) =>
	T.get("friends/ids", {user_id: self, count: 5000}, (err,data) => err ? n(err) : y(data.ids)));

const flatList = Promise.all(lists)
.then(R.pipe(R.flatten,R.uniq))
.catch(err => console.log(err));

Promise.all([followings,flatList])
.then(lists => R.filter(id => R.contains(id,lists[0]),lists[1]))
.then(followAll)
.catch(err => console.log(err));
