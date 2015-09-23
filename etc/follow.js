"use strict";

const fs = require("fs");
const path = require("path");
const Twit = require("twit");
const fp = require("lodash-fp");

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

const getUserId = fp.map(user => user.id_str);

const getList = fp.curry((id,slug) =>
	new Promise((y,n) =>
		T.get("lists/members",
			{owner_id: id, slug: slug, count: 5000, include_entities: false, skip_status: true},
			(err,data) => err ? n(err) : y(getUserId(data.users)))));

const follow = id => T.post("friendships/create", {user_id: id}, err => console.log(err || `following ${id}`));
const followAll = ids => (fp.first(ids) && (ids => {
		follow(fp.first(ids));
		setTimeout(followAll,8*1000,fp.rest(ids));
	})(ids));

const lists = fp.map(getList(cspan),slugs);
const followings = new Promise((y,n) =>
	T.get("friends/ids", {user_id: self, count: 5000}, (err,data) => err ? n(err) : y(data.ids)));

const flatList = Promise.all(lists)
.then(fp.flow(fp.flatten,fp.uniq))
.catch(err => console.log(err));

Promise.all([followings,flatList])
.then(lists => fp.filter(id => fp.includes(id,lists[0]),lists[1]))
.then(followAll)
.catch(err => console.log(err));
