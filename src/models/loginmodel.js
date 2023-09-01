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

		let qb;
		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.where({ u_name: name })
				.get("users");

			console.log("Query Ran: " + qb.last_query());

			// console.log("Results:", response);

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

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
}

module.exports = new LoginModel();
