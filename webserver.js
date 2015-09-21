"use strict";

const config = require("./config.json");
const R = require("ramda");
const sql = require("./db.js");

sql.select({})
.then(results => console.log(JSON.stringify(results.rows,null,"\t")))
.catch(err => console.log(err));
