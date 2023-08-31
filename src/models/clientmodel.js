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

	async getAllClientsOnWaitingList() {
		let clients = [];
		let rv = false;

		try {
			const qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.where("t_ID", null)
				.order_by("c_enquiry_date", "desc")
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

	async getNumberOfClientsOnWaitingList() {
		let clients = [];
		let rv = false;

		try {
			const qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.where("t_ID", null)
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			clients = response.length;
			rv = clients;

			qb.disconnect();

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}

	async getClient(clientID) {
		let client = [];
		let client_rv = false;

		let client_assessed_by = [];
		let client_assessed_by_rv = false;

		let client_files = [];
		let client_files_rv = false;

		let client_notes = [];
		let client_notes_rv = false;

		try {
			const qb = await pool.get_connection();
			const c_response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.join("referrals", "c_referred_by=r_ID")
				.where("c_ID", clientID)
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			client = JSON.parse(JSON.stringify(c_response));
			client_rv = client;

			const ca_response = await qb
				.select(
					"t_ID as at_ID, t_first_name as at_first_name, t_surname as at_surname"
				)
				.join("therapists", "c_assessed_by=t_ID", "left")
				.where("c_ID", clientID)
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			client_assessed_by = JSON.parse(JSON.stringify(ca_response));
			client_assessed_by_rv = client_assessed_by;

			const cf_response = await qb
				.select("*")
				.join("clients", "cf_client=c_ID")
				.where("c_ID", clientID)
				.get("client_files");

			client_files = JSON.parse(JSON.stringify(cf_response));
			client_files_rv = client_files;

			console.log("Query Ran: " + qb.last_query());

			const cn_response = await qb
				.select("*")
				.join("clients", "cn_client=c_ID")
				.where("c_ID", clientID)
				.get("client_notes");

			console.log("Query Ran: " + qb.last_query());

			client_notes = JSON.parse(JSON.stringify(cn_response));
			client_notes_rv = client_notes;

			qb.disconnect();

			return {
				t_client: client_rv,
				client_assessed_by: client_assessed_by_rv,
				client_files: client_files_rv,
				client_notes: client_notes_rv,
			};
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}

	async addClient() {}
	async updateClient(clientID) {}
	async removeClient(clientID) {}
}

module.exports = new ClientModel();
