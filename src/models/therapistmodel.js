require("dotenv").config();

const QueryBuilder = require("node-querybuilder");
const bcrypt = require("bcrypt");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class TherapistModel {
	async getAllTherapists() {
		let therapists = [];
		let rv = false;

		try {
			const qb = await pool.get_connection();
			const response = await qb.select("*").get("therapists");

			// SELECT `name`, `position` FROM `planets` WHERE `type` = 'rocky' AND `diameter` < 12000
			console.log("Query Ran: " + qb.last_query());

			// [{name: 'Mercury', position: 1}, {name: 'Mars', position: 4}]
			// console.log("Results:", response);

			therapists = JSON.parse(JSON.stringify(response));
			rv = therapists;

			qb.disconnect();

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}

	async getTherapist(therapistID) {
		let therapists = [];
		let therapists_rv = false;

		let therapist_qualifications = [];
		let therapist_qualifications_rv = false;

		try {
			const qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.where("t_ID", therapistID)
				.get("therapists");

			// SELECT `name`, `position` FROM `planets` WHERE `type` = 'rocky' AND `diameter` < 12000
			console.log("Query Ran: " + qb.last_query());

			// [{name: 'Mercury', position: 1}, {name: 'Mars', position: 4}]
			// console.log("Results:", response);

			therapists = JSON.parse(JSON.stringify(response));
			therapists_rv = therapists;

			const tq_response = await qb
				.select("*")
				.join("qualifications", "q_ID=tq_qualification")
				.where("tq_therapist", therapistID)
				.get("therapist_qualifications");

			// SELECT `name`, `position` FROM `planets` WHERE `type` = 'rocky' AND `diameter` < 12000
			console.log("Query Ran: " + qb.last_query());

			therapist_qualifications = JSON.parse(JSON.stringify(tq_response));
			therapist_qualifications_rv = therapist_qualifications;

			qb.disconnect();

			let rv = {
				therapist: therapists_rv,
				therapist_qualifications: therapist_qualifications_rv,
			};

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}
	async addTherapist() {}
	async updateTherapist(therapistID) {}
	async removeTherapist(therapistID) {}
}

module.exports = new TherapistModel();
