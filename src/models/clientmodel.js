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
			const response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			qb.disconnect();

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}

	async getClient(clientID) {
		let clients = [];
		let clients_rv = false;

		try {
			const qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.where("c_ID", clientID)
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			clients_rv = clients;

			qb.disconnect();

			return clients_rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}

	async addClient() {}
	async updateClient(clientID) {}
	async removeClient(clientID) {}
}

module.exports = new ClientModel();
