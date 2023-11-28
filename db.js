"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    user: 'laynemcintosh12',
    host: 'localhost',
    database: getDatabaseUri(),
    password: 'password', 
    port: 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    user: 'laynemcintosh12',
    host: 'localhost',
    database: getDatabaseUri(),
    password: 'password', // Make sure the password is a string
    port: 5432,
  });
}

db.connect();

module.exports = db;
