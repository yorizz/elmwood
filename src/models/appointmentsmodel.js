require("dotenv").config();

const QueryBuilder = require("node-querybuilder");

const express = require("express");
const app = express();

const dayjs = require("dayjs");
dayjs().format();

const db_config = require("../utils/dbconfig");
const helpers = require("../utils/helpers");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class AppointmentsModel {
	async getAllAppointments() {
		let appointments = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.from("appointments")
				.join("clients", "a_client=c_ID")
				.join("therapists", "a_therapist=t_ID")
				.where_not_in("a_is_referral", [1])
				.get();

			console.log("Query Ran: " + qb.last_query());

			appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAllAppointmentsAfterToday() {
		let appointments = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.where("a_date >=", helpers.formatSQLDate(Date.now()))
				.from("appointments")
				.join("clients", "a_client=c_ID")
				.join("therapists", "a_therapist=t_ID")
				.where_not_in("a_is_referral", [1])
				.order_by("a_date", "desc")
				.get();

			console.log("Query Ran: " + qb.last_query());
			// console.log("db response for appointments", response);

			appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
	async getAllAppointmentsBeforeToday() {
		let appointments = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.where("a_date <", helpers.formatSQLDate(Date.now()))
				.from("appointments")
				.join("clients", "a_client=c_ID")
				.join("therapists", "a_therapist=t_ID")
				.where_not_in("a_is_referral", [1])
				.order_by("a_date", "desc")
				.get();

			console.log("Query Ran: " + qb.last_query());
			// console.log("db response for appointments", response);

			appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAllAppointmentsForMonth(month) {
		let appointments = [];
		let rv = false;

		let selectedMonth = month ? '"' + month + '"' : "now()";

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.from("appointments")
				.join("clients", "a_client=c_ID")
				.join("therapists", "a_therapist=t_ID")
				.where(`MONTH(a_date)=MONTH(${selectedMonth})`)
				.where("a_is_cancelled", 0)
				.where_not_in("a_is_referral", [1])
				// .order_by("a_date", "desc")
				.get();

			console.log("Query Ran: " + qb.last_query());
			// console.log("db response for appointments", response);

			appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAllAppointmentsNotCancelled() {
		let appointments = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.from("appointments")
				.join("clients", "a_client=c_ID")
				.join("therapists", "a_therapist=t_ID")
				// .order_by("a_date", "desc")
				.where("a_is_cancelled", 0)
				.where_not_in("a_is_referral", [1])
				.get();

			console.log("Query Ran: " + qb.last_query());
			// console.log("db response for appointments", response);

			appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getTodaysAppointments() {
		let appointments = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			// .select(
			// 	"a_ID,a_date,a_client,a_start_time, a_end_time, c_first_name, c_surname, a_therapist, t_first_name, t_surname, t_colour"
			// )
			const response = await qb
				.select(
					"a_ID,a_date,a_client,a_start_time, a_end_time, a_therapist"
				)
				.from("appointments")
				.join("clients", "a_client=c_ID")
				.join("therapists", "a_therapist=t_ID")
				.where("a_date", helpers.formatYYYYMMDDDate(new Date(), "-"))
				.where("a_is_cancelled", 0)
				.where_not_in("a_is_referral", [1])
				.order_by("a_start_time")
				.get();

			console.log("Query Ran: " + qb.last_query());

			appointments = JSON.parse(JSON.stringify(response));
			rv = appointments;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async addAppointment(appointment) {
		console.log("appointment", appointment);
		let qb;

		try {
			qb = await pool.get_connection();
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

					if (err) return console.error(err);
					console.log("insert id:", res.insert_id);
					return res.insert_id;
				});
			} else {
				return 0;
			}
		} catch (error) {
			console.log("addAppointment", error);
		} finally {
			if (qb) qb.release();
		}
	}

	async addMultipleAppointments(appointments) {
		console.log("appointment", appointments);
		let qb;

		try {
			qb = await pool.get_connection();

			qb.insert_batch("appointments", appointments, (err, res) => {
				if (err) return console.error(err);
				console.log("Query Ran: " + qb.last_query());
			});
		} catch (error) {
			console.log("addAppointment", error);
		} finally {
			if (qb) qb.release();
		}
	}

	async cancelAllFutureAppointments(
		firstAppointmentID,
		clientID,
		therapistID
	) {
		let qb;

		let sql =
			"SELECT `a_ID` FROM `appointments` " +
			"WHERE `a_therapist`= " +
			therapistID +
			" " +
			"AND `a_client`= " +
			clientID +
			" " +
			"AND `a_date` > ( SELECT `a_date` FROM `appointments` WHERE `a_ID` = " +
			firstAppointmentID +
			" );";

		console.log("sql", sql);

		try {
			qb = await pool.get_connection();
			const response = await qb.query(sql);
			console.log("Query Ran: " + qb.last_query());

			return JSON.parse(JSON.stringify(response));
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async editAppointment(appointmentID) {
		let qb;
		let rv;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.from("appointments")
				.where("a_ID", appointmentID)
				.get();

			console.log("Query Ran: " + qb.last_query());
			console.log("db response for appointments", response);

			let appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async uncancelAppointment(appointmentID) {
		let qb;
		try {
			qb = await pool.get_connection();

			let data = {
				a_is_cancelled: 0,
				a_cancellation_reason: "",
			};

			qb.where({
				a_ID: appointmentID,
			})
				.set(data)
				.update("appointments");
			console.log("Query Ran: " + qb.last_query());
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async payAppointment(appointmentID) {
		let qb;
		try {
			qb = await pool.get_connection();

			let data = {
				a_is_paid: 1,
			};

			qb.where({
				a_ID: appointmentID,
			})
				.set(data)
				.update("appointments");
			console.log("Query Ran: " + qb.last_query());
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async deleteAppointment(appointmentID) {
		let qb;
		try {
			qb = await pool.get_connection();

			let result = await qb.delete("appointments", {
				a_ID: appointmentID,
			});
			console.log("Query Ran: " + qb.last_query());
			return result.affectedRows;
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async updateAppointment(appointmentID, data) {
		let qb;
		try {
			qb = await pool.get_connection();
			let result = await qb
				.where("a_ID", appointmentID)
				.set(data)
				.update("appointments");

			console.log("result", result);
			console.log("Query Ran: " + qb.last_query());

			return result;
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async updateAppointmentPaymentType(appointmentId, paymentType) {
		let qb;
		try {
			qb = await pool.get_connection();

			let data = {
				a_payment_type: paymentType,
			};

			qb.where({
				a_ID: appointmentId,
			})
				.set(data)
				.update("appointments");
			console.log("Query Ran: " + qb.last_query());
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async updateAppointmentIsTherapistPaid(appointmentId, isTherpistPaid) {
		let qb;
		try {
			qb = await pool.get_connection();

			let data = {
				a_is_therapist_paid: isTherpistPaid,
			};

			qb.where({
				a_ID: appointmentId,
			})
				.set(data)
				.update("appointments");
			console.log("Query Ran: " + qb.last_query());
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async getClientAppointments(clientId) {
		let appointments = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select([
					"a_ID",
					"a_date",
					"a_start_time",
					"a_end_time",
					"a_client_fee",
					"a_is_paid",
					"a_is_cancelled",
					"a_payment_type",
					"t_colour",
				])
				.join("therapists", "t_ID=a_therapist")
				.where("a_client", clientId)
				.from("appointments")
				.where_not_in("a_is_referral", [1])
				.order_by("a_date", "desc")
				.get();

			console.log("Query Ran: " + qb.last_query());
			// console.log("db response for appointments", response);

			appointments = JSON.parse(JSON.stringify(response));

			rv = appointments;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getClientsWithAppointments() {
		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.distinct()
				.select("a_client")
				.get("appointments");

			console.log("Query Ran: " + qb.last_query());
			return JSON.parse(JSON.stringify(response));
		} catch (error) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async payAppointmentReferral(appointmentID) {
		let qb;
		try {
			qb = await pool.get_connection();

			let data = {
				a_is_referral_paid: 1,
			};

			qb.where({
				a_ID: appointmentID,
			})
				.set(data)
				.update("appointments");
			console.log("Query Ran: " + qb.last_query());
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async removeAppointment(appointmentID) {}
}

module.exports = new AppointmentsModel();
