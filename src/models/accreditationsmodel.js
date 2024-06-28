require("dotenv").config();

const QueryBuilder = require("node-querybuilder");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");
const helpers = require("../utils/helpers");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class AccreditationsModel {
	async getAllAccreditations() {
		let accreditations = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb.select("*").from("accreditations").get();

			console.log("Query Ran: " + qb.last_query());
			console.log("db response for accreditations", response);

			accreditations = JSON.parse(JSON.stringify(response));

			rv = accreditations;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async addAccreditation(accreditation) {
		console.log("accreditation", accreditation);
		let qb;

		try {
			//do something
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}
	async updateAppointment(AppointmentID) {}
	async removeAppointment(AppointmentID) {}
}

module.exports = new AccreditationsModel();
