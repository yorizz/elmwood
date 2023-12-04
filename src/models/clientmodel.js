require("dotenv").config();

const QueryBuilder = require("node-querybuilder");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class ClientModel {
	async getAllClients() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAllClientsOnWaitingList() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select([
					"c_ID",
					"c_first_name",
					"c_surname",
					"c_phone",
					"c_email",
					"c_enquiry_date",
				])
				.where("c_therapist", null)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			console.log("waitinglist", response);

			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getNumberOfClientsOnWaitingList() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.where("t_ID", null)
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			clients = response.length;
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
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

		let qb;

		try {
			qb = await pool.get_connection();
			const c_response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.join("referrals", "c_referred_by=r_ID", "left")
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
				.order_by("cn_date", "desc")
				.get("client_notes");

			console.log("Query Ran: " + qb.last_query());

			client_notes = JSON.parse(JSON.stringify(cn_response));
			client_notes_rv = client_notes;

			return {
				t_client: client_rv,
				client_assessed_by: client_assessed_by_rv,
				client_files: client_files_rv,
				client_notes: client_notes_rv,
			};
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getTherapistIDForClient(clientID) {
		let qb;

		try {
			qb = await pool.get_connection();
			const ct_response = await qb
				.select("c_therapist")
				.join("therapists", "c_therapist=t_ID", "left")
				.where("c_ID", clientID)
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			let client = JSON.parse(JSON.stringify(ct_response));

			console.log("client", client);
			return client;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async addClient(clientData) {
		let qb = await pool.get_connection();
		try {
			qb.insert("clients", clientData, (err, res) => {
				if (err) return console.error(err);
				else return 1;
			});
			console.log("Query Ran: " + qb.last_query());
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async storeClientTherapyTypeRequests(clientID, therapy_types_requested) {
		let qb = await pool.get_connection();
		try {
			for (let i = 0; i < therapy_types_requested.length; i++) {
				let clientData = {
					cttr_client_ID: `${clientID}`,
					cttr_therapy_type_requested: therapy_types_requested[i],
				};
				qb.insert(
					" client_therapy_types_requests",
					clientData,
					(err, res) => {
						if (err) return console.error(err);
						else return 1;
					}
				);
				console.log("Query Ran: " + qb.last_query());
			}
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async getRequestedTherapyTypes(client_ID) {
		let qb;
		let rv = [];

		try {
			qb = await pool.get_connection();
			const cttr_response = await qb
				.select("*")
				.join("qualifications", "cttr_therapy_type_requested=q_ID", "left")
				.where("cttr_client_ID", client_ID)
				.get("client_therapy_types_requests");

			console.log("Query Ran: " + qb.last_query());

			rv = JSON.parse(JSON.stringify(cttr_response));

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async removeExistingTherapyRequestsForClient(clientID) {
		let qb;
		try {
			qb = await pool.get_connection();
			const results = await qb.delete("client_therapy_types_requests", {
				cttr_client_ID: clientID,
			});
			console.log("number of rows deleted", results.affected_rows);
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async updateClient(clientData, clientID) {
		let qb = await pool.get_connection();
		try {
			qb.update("clients", clientData, { c_ID: clientID }, (err, res) => {
				if (err) return console.error(err);
				else return 1;
			});
			console.log("Query Ran: " + qb.last_query());
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async removeClient(clientID) {}

	async clientDeactivated(clientID) {
		let qb = await pool.get_connection();
		try {
			qb.update(
				"clients",
				{ c_is_active: 0 },
				{ c_ID: clientID },
				(err, res) => {
					if (err) return console.error(err);
					else return 1;
				}
			);

			console.log("Query Ran: " + qb.last_query());
			return { msg: "client dactivated" };
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async clientActivated(clientID) {
		let qb = await pool.get_connection();
		try {
			qb.update(
				"clients",
				{ c_is_active: 1 },
				{ c_ID: clientID },
				(err, res) => {
					if (err) return console.error(err);
					else return 1;
				}
			);

			console.log("Query Ran: " + qb.last_query());
			return { msg: "client activated" };
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async getClientsPerTherapist() {
		let qb = await pool.get_connection();
		try {
			const ct_response = await qb
				.limit(5)
				.select(
					[
						"t_ID",
						"t_first_name",
						"t_surname",
						"COUNT(`c_ID`) as `NumberOfClients`",
					],
					null,
					false
				)
				.join("clients", "c_therapist=t_ID", "inner")
				.where("t_is_active", 1)
				.where("c_is_active", 1)
				.group_by("c_therapist")
				.order_by("NumberOfClients", "desc")
				.get("therapists");

			console.log("cpt ", qb.last_query());

			return JSON.parse(JSON.stringify(ct_response));
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async addNote(note, clientId) {
		let qb = await pool.get_connection();
		try {
			qb.insert("client_notes", note, (err, res) => {
				if (err) return console.error(err);
			});
			console.log("Query Ran: " + qb.last_query());
			return res.JSON({ msg: "added note to client" });
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async storeFileData(clientFileData) {
		let qb = await pool.get_connection();
		try {
			qb.insert("client_files", clientFileData, (err, res) => {
				if (err) return console.error(err);
			});
			console.log("Query Ran: " + qb.last_query());
			return 1;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async getOutstandingFeesPerClient() {
		let qb;
		let msg = "";
		try {
			qb = await pool.get_connection();
			const response = await qb
				.select(
					[
						`a_client`,
						`c_first_name`,
						`c_surname`,
						"SUM(`a_fee`) AS `unpaid`",
					],
					null,
					false
				)
				.join("clients", "a_client=c_ID", "inner")
				.where({
					a_is_paid: 0,
					"`a_date`<": Date.now(),
					a_needs_payment: 1,
					"`a_fee`>": 0,
				})
				.group_by("a_client")
				.order_by("unpaid", "desc")
				.get("appointments");

			console.log("Unpaid fees per client Query", qb.last_query());

			console.log("Unpaid fees per client", response);
			return JSON.parse(JSON.stringify(response));
		} catch (error) {
			console.log("Unable to list unpaid fees per client ", error);
			msg = "Error: " + error;
		} finally {
			if (qb) qb.release();
		}
	}

	async allClientsForSession() {
		let qb;
		try {
			qb = await pool.get_connection();
			const allTherapistsForSession = await qb
				.select(["c_ID", "c_first_name", "c_surname", "c_phone", "c_email"])
				.get("clients");

			console.log("Query Ran: " + qb.last_query());

			return allTherapistsForSession;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}
}

module.exports = new ClientModel();
