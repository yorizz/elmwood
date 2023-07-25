require("dotenv").config();

const QueryBuilder = require("node-querybuilder");
const bcrypt = require("bcrypt");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class LoginModel {
	async verifyUser(req) {
		let user = [];
		let rv = false;
		let name = req.body.username;
		let password = req.body.password;
		try {
			const qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.where({ u_name: name })
				.get("users");

			// SELECT `name`, `position` FROM `planets` WHERE `type` = 'rocky' AND `diameter` < 12000
			console.log("Query Ran: " + qb.last_query());

			// [{name: 'Mercury', position: 1}, {name: 'Mars', position: 4}]
			console.log("Results:", response);

			user = JSON.parse(JSON.stringify(response));

			user = user[0];

			if (user.u_name == name) {
				if (await bcrypt.compare(password, user.u_password)) {
					console.log("found user", user);
					rv = user;
				} else {
					// console.log("not a valid password");
					rv = false;
				}
			}
			qb.disconnect();
			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}
}

module.exports = new LoginModel();
