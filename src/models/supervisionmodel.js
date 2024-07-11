require("dotenv").config();
const express = require("express");
const QueryBuilder = require("node-querybuilder");
const db_config = require("../utils/dbconfig");
const pool = new QueryBuilder(db_config, "mysql", "pool");

class SupervisionModel {
	async getSupervisionSessions() {
		let rv = false;
		let qb;

		try {
			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getNumberOfSupervisionSessionAttendees() {
		let qb;
		const sql =
			"SELECT  `sup_ID`, `sup_date`, `sup_supervisor`, sum(`ssm_attendee_present`) present, count(*) as total FROM `supervision_sessions_mgmt` JOIN `supervision_sessions` ON `ssm_sup_ID` = `sup_ID`JOIN `therapists` ON `t_ID`=`sup_supervisor` GROUP BY `ssm_sup_ID` ORDER BY `sup_date` DESC;";

		try {
			qb = await pool.get_connection();
			const response = await qb.query(sql);
			console.log(
				"getNumberOfSupervisionSessionAttendees Query Ran: " +
					qb.last_query()
			);

			let rv = JSON.parse(JSON.stringify(response));

			console.log("attendance", rv);

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async addSupervisionSession(supervisionSessionData) {
		let rv = false;
		let qb;

		try {
			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async addSupervisionSession(supervisionSessionID, supervisionSessionData) {
		let rv = false;
		let qb;

		try {
			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async updateSupervisionSession(
		supervisionSessionID,
		supervisionSessionData
	) {
		let rv = false;
		let qb;

		try {
			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async storeNewSupervisionSession(data) {
		let rv = false;
		let qb;

		try {
			qb = await pool.get_connection();
			qb.returning("sup_ID").insert(
				"supervision_sessions",
				data,
				(err, res) => {
					console.log("Query Ran: " + qb.last_query());

					if (err)
						return console.error(
							"unable to store supervision session",
							err
						);
					rv = true;
				}
			);
			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async storeTraineesForSupervisionSession(data) {
		let rv = false;
		let qb;

		console.log("data for storeTraineesForSupervisionSession", data);

		for (let i = 0; i < data.trainees.length; i++) {
			try {
				qb = await pool.get_connection();

				qb.insert(
					"supervision_sessions_mgmt",
					{
						ssm_ID: Date.now(),
						ssm_sup_ID: data.ssm_sup_ID,
						ssm_attendee: data.trainees[i],
					},
					(err, res) => {
						console.log("Query Ran: " + qb.last_query());

						if (err)
							return console.error(
								"unable to store supervision session",
								err
							);
						rv = true;
					}
				);
			} catch (err) {
				return console.error("Pool Query Error: " + err);
			} finally {
				if (qb) qb.release();
			}
		}
	}
	async getSupervisionSession(supervisionSessionId) {
		let rv = false;
		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.join("supervision_sessions", "sup_ID=ssm_sup_ID")
				.where("ssm_sup_ID", supervisionSessionId)
				.get("supervision_sessions_mgmt");

			const supervisionSessions = JSON.parse(JSON.stringify(response));

			rv = supervisionSessions;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async updateAttendance(attendeeID, present) {
		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb.update(
				"supervision_sessions_mgmt",
				{ ssm_attendee_present: present },
				{ ssm_ID: attendeeID }
			);
			const supervisionSessions = JSON.parse(JSON.stringify(response));

			rv = supervisionSessions;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
}

module.exports = new SupervisionModel();
