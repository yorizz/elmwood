require("dotenv").config();

const QueryBuilder = require("node-querybuilder");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");
const helpers = require("../utils/helpers");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class QualificationsModel {
	async getAllQualifications() {
		let referrers = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.from("qualifications")
				.order_by("q_fully_qualified", "desc")
				.order_by("q_qualification", "asc")
				.get();

			console.log("Query Ran: " + qb.last_query());
			console.log("db response for referrers", response);

			referrers = JSON.parse(JSON.stringify(response));

			rv = referrers;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async addReferrer(referrer) {
		console.log("referrer", referrer);
		let qb;

		try {
			//do something
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}
	async updateQualification(QualificationID) {}
	async removeQualification(QualificationID) {}
}

module.exports = new QualificationsModel();
