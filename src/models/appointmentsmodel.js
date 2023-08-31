require("dotenv").config();

const QueryBuilder = require("node-querybuilder");
const bcrypt = require("bcrypt");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");
const helpers = require("../utils/helpers");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class AppointmentsModel {
	async getAllAppointments() {
		let appointments = [];
		let rv = false;

		try {
			const qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.from("appointments")
				.join("clients", "a_client=c_ID")
				.join("therapists", "a_therapist=t_ID")
				.get();

			console.log("Query Ran: " + qb.last_query());
			console.log("db response for appointments", response);

			appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			qb.disconnect();

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}

	async getTodaysAppointments() {
		let appointments = [];
		let rv = false;

		try {
			const qb = await pool.get_connection();

			const response = await qb
				.select(
					"a_ID,a_date,a_start_time, a_end_time, c_first_name, c_surname, t_first_name, t_surname, t_colour"
				)
				.from("appointments")
				.join("clients", "a_client=c_ID")
				.join("therapists", "a_therapist=t_ID")
				.where("a_date", helpers.formatYYYYMMDDDate(new Date(), "-"))
				.order_by("a_start_time")
				.get();

			console.log("Query Ran: " + qb.last_query());
			console.log("db response for appointments", response);

			appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			qb.disconnect();

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		}
	}

	async addAppointment(appointment) {
		console.log("appointment", appointment);

		try {
			pool.get_connection(async (qb) => {
				const sameRecords = await qb
					.select("*")
					.where("a_client", appointment.a_client)
					.where("a_date", appointment.a_date)
					.where("a_start_time", appointment.a_start_time)
					.where("a_end_time", appointment.a_end_time)
					.where("a_therapist", appointment.a_therapist)
					.get("appointments");

				console.log(
					"Number of records with same appointment",
					sameRecords.length,
					qb.last_query()
				);
				if (sameRecords.length == 0) {
					qb.insert("appointments", appointment, (err, res) => {
						console.log("Query Ran: " + qb.last_query());
						qb.release();
						if (err) return console.error(err);
						console.log("insert id:", res.insert_id);
						return res.insert_id;
					});
				} else {
					return 0;
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
	async updateAppointment(AppointmentID) {}
	async removeAppointment(AppointmentID) {}
}

module.exports = new AppointmentsModel();
