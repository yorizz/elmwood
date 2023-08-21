require("dotenv").config();

const QueryBuilder = require("node-querybuilder");
const bcrypt = require("bcrypt");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class ClientModel {
	async getAllClients() {
		let clients = [];
		let rv = false;

		try {
			const qb = await pool.get_connection();
			const response = await qb.select("*").get("clients");

			// SELECT `name`, `position` FROM `planets` WHERE `type` = 'rocky' AND `diameter` < 12000
			console.log("Query Ran: " + qb.last_query());

			// [{name: 'Mercury', position: 1}, {name: 'Mars', position: 4}]
			// console.log("Results:", response);

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			qb.disconnect();

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}
	async addClient() {}
	async updateClient(clientID) {}
	async removeClient(clientID) {}
}

module.exports = new ClientModel();
