"use strict";

const fs = require("fs");
const path = require("path");
const Twit = require("twit");
const throttle = require("lodash/function/throttle");
const R = require("ramda");

const T = new Twit(require("./config.json").tw);

//obv change this if they ever go away or stop updating their lists but
//it's a nice set of lists definitely
const cspan = 15675138;

//interesting ones for our purposes, do note there are more
//esp "foreign-leaders"
const slugs = [
	"members-of-congress",
	"presidential-candidates",
	"governors"
];

//FIXME they are however insufficient, we also need @potus and whatever cabinet/mil/intel heads are on twitter


