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

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAllActiveClients() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.where("c_is_active", 1)
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

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

			const appointments = await qb.select("a_client").get("appointments");

			let apptmts = [];
			for (let i = 0; i < appointments.length; i++) {
				apptmts.push(appointments[i].a_client);
			}

			const response = await qb
				.select([
					"c_ID",
					"c_first_name",
					"c_surname",
					"c_phone",
					"c_email",
					"c_enquiry_date",
					"c_low_cost_employment",
				])
				.where_not_in("c_ID", apptmts)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			// console.log("waitinglist", response);

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

			const appointments = await qb.select("a_client").get("appointments");

			let apptmts = [];
			for (let i = 0; i < appointments.length; i++) {
				apptmts.push(appointments[i].a_client);
			}

			const response = await qb
				.select("c_ID")
				.where_not_in("c_ID", apptmts)
				.get("clients");

			console.log("Waiting List Query Ran: " + qb.last_query());

			clients = response.length;
			rv = clients;

			return rv;
		} catch (err) {
			return console.error(
				"Pool Query Error for getNumberOfClientsOnWaitingList : " + err
			);
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

			// console.log("Query Ran: " + qb.last_query());

			client = JSON.parse(JSON.stringify(c_response));
			client_rv = client;

			const ca_response = await qb
				.select(
					"t_ID as at_ID, t_first_name as at_first_name, t_surname as at_surname"
				)
				.join("therapists", "c_assessed_by=t_ID", "left")
				.where("c_ID", clientID)
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			client_assessed_by = JSON.parse(JSON.stringify(ca_response));
			client_assessed_by_rv = client_assessed_by;

			const cf_response = await qb
				.select("*")
				.join("clients", "cf_client=c_ID")
				.where("c_ID", clientID)
				.get("client_files");

			client_files = JSON.parse(JSON.stringify(cf_response));
			client_files_rv = client_files;

			// console.log("Query Ran: " + qb.last_query());

			const cn_response = await qb
				.select("*")
				.join("clients", "cn_client=c_ID")
				.where("c_ID", clientID)
				.order_by("cn_date", "desc")
				.get("client_notes");

			// console.log("Query Ran: " + qb.last_query());

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
				.select("c_therapist, t_fee")
				.join("therapists", "c_therapist=t_ID", "left")
				.where("c_ID", clientID)
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			let client = JSON.parse(JSON.stringify(ct_response));

			// console.log("client", client);
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
			// console.log("Query Ran: " + qb.last_query());
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
				// console.log("Query Ran: " + qb.last_query());
			}
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async storeReferral(newReferral) {
		let qb = await pool.get_connection();
		try {
			qb.insert("referrals", { r_referral: newReferral }, (err, res) => {
				if (err) return console.error(err);
				else return 1;
			});
			// console.log("Query Ran: " + qb.last_query());
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

			// console.log("Query Ran: " + qb.last_query());

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
			// console.log("Query Ran: " + qb.last_query());
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

			// console.log("Query Ran: " + qb.last_query());
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

			// console.log("Query Ran: " + qb.last_query());
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
			// console.log("Query Ran: " + qb.last_query());
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
			// console.log("Query Ran: " + qb.last_query());
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
						"SUM(`a_client_fee`) AS `unpaid`",
					],
					null,
					false
				)
				.join("clients", "a_client=c_ID", "inner")
				.where({
					a_is_paid: 0,
					"`a_date`<": Date.now(),
					a_needs_payment: 1,
					"`a_client_fee`>": 0,
				})
				.group_by("a_client")
				.order_by("unpaid", "desc")
				.get("appointments");

			console.log("Unpaid fees per client Query", qb.last_query());

			// console.log("Unpaid fees per client", response);
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

			// console.log("Query Ran: " + qb.last_query());

			return allTherapistsForSession;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAllContractClientsOnWaitingList() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			let apptmts = [];
			qb = await pool.get_connection();

			const appointments = await qb.select("a_client").get("appointments");

			for (let i = 0; i < appointments.length; i++) {
				apptmts.push(appointments[i].a_client);
			}

			const response = await qb

				.select([
					"c_ID",
					"c_first_name",
					"c_surname",
					"c_phone",
					"c_email",
					"c_enquiry_date",
					"c_low_cost_employment",
				])
				.join(
					"therapist_contract_types",
					"c_therapist=tct_therapist",
					"left"
				)
				.where("tct_contract_type", 3)
				.where_not_in("c_ID", apptmts)
				.order_by("c_enquiry_date", "desc")
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

	async getAllContractClients() {
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
					"c_low_cost_employment",
				])
				.join(
					"therapist_contract_types",
					"c_therapist=tct_therapist",
					"left"
				)
				.where("tct_contract_type", 3)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getLowCostTraineeClients() {
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
					"c_low_cost_employment",
				])
				.join(
					"therapist_qualifications",
					"c_therapist=tq_therapist",
					"left"
				)
				.where("tq_qualification", 7)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
	async getLowCostPrecredClients() {
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
					"c_low_cost_employment",
				])
				.join("therapist_qualifications", "c_therapist=tq_therapist")
				.where("tq_qualification", 8)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
	async getDeborahClients() {
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
					"c_low_cost_employment",
				])

				.where("c_therapist", process.env.DEBORAH)
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
	async getFionaClients() {
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
					"c_low_cost_employment",
				])
				.where("c_therapist", process.env.FIONA)
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
	async getCouplesOrFamiliesClients() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.distinct()
				.select([
					"c_ID",
					"c_first_name",
					"c_surname",
					"c_phone",
					"c_email",
					"c_enquiry_date",
				])
				.join(
					"client_therapy_types_requests",
					"cttr_client_id=c_ID",
					"left"
				)
				.where("cttr_therapy_type_requested", 5)
				.or_where("cttr_therapy_type_requested", 6)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			console.log("Couples and Families Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
	async getUnder18sClients() {
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
					"c_low_cost_employment",
				])
				.join(
					"therapist_qualifications",
					"c_therapist=tq_therapist",
					"left"
				)
				.where("tq_qualification", 12)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
	async getLowCostTraineeClientsOnWaitingList() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			let apptmts = [];

			const appointments = await qb.select("a_client").get("appointments");

			for (let i = 0; i < appointments.length; i++) {
				apptmts.push(appointments[i].a_client);
			}

			const response = await qb
				.select([
					"c_ID",
					"c_first_name",
					"c_surname",
					"c_phone",
					"c_email",
					"c_enquiry_date",
					"c_low_cost_employment",
				])
				.join(
					"therapist_qualifications",
					"c_therapist=tq_therapist",
					"left"
				)
				.where_not_in("c_ID", apptmts)
				.where("tq_qualification", 7)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getDeborahClientsOnWaitingList() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			let apptmts = [];
			qb = await pool.get_connection();

			const appointments = await qb.select("a_client").get("appointments");

			for (let i = 0; i < appointments.length; i++) {
				apptmts.push(appointments[i].a_client);
			}

			const response = await qb
				.select([
					"c_ID",
					"c_first_name",
					"c_surname",
					"c_phone",
					"c_email",
					"c_enquiry_date",
					"c_low_cost_employment",
				])
				.where_not_in("c_ID", apptmts)
				.where("c_therapist", process.env.DEBORAH)
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
	async getFionaClientsOnWaitingList() {
		let clients = [];
		let rv = false;

		let qb;

		try {
			let apptmts = [];
			qb = await pool.get_connection();

			const appointments = await qb.select("a_client").get("appointments");

			for (let i = 0; i < appointments.length; i++) {
				apptmts.push(appointments[i].a_client);
			}

			const response = await qb
				.select([
					"c_ID",
					"c_first_name",
					"c_surname",
					"c_phone",
					"c_email",
					"c_enquiry_date",
					"c_low_cost_employment",
				])
				.where_not_in("c_ID", apptmts)
				.where("c_therapist", process.env.FIONA)
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getOtherClients() {
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
					"c_low_cost_employment",
				])
				.join(
					"therapist_contract_types",
					"c_therapist=tct_therapist",
					"left"
				)
				.where("tct_contract_type", 3)
				.order_by("c_enquiry_date", "desc")
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getTherapistClients(therapistId) {
		let clients = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.join("therapists", "c_therapist=t_ID", "left")
				.where("c_therapist", therapistId)
				.get("clients");

			// console.log("Query Ran: " + qb.last_query());

			clients = JSON.parse(JSON.stringify(response));
			rv = clients;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async waitingListQuery(qualification) {
		let sql =
			"SELECT `c_ID`, `c_first_name`, `c_surname`, `c_phone`, `c_email`, `c_enquiry_date`, `c_low_cost_employment`, `cttr_therapy_type_requested` " +
			"FROM `clients` JOIN `client_therapy_types_requests` ON `c_ID`=`cttr_client_ID` " +
			"WHERE `c_ID` NOT IN(SELECT DISTINCT `a_client` FROM `appointments`) " +
			"AND `cttr_therapy_type_requested`=" +
			qualification +
			" ORDER BY `c_ID`,`cttr_therapy_type_requested`;";

		console.log("sql", sql);

		let qb;
		try {
			qb = await pool.get_connection();
			const response = await qb.query(sql);
			console.log("Query Ran: " + qb.last_query());

			return JSON.parse(JSON.stringify(response));
		} catch (error) {
			return console.error("waitingListQuery Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getRenterReferrals() {
		let qb;
		let rv = false;
		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.join("appointments", "a_client=c_ID", "left")
				.join("therapists", "a_therapist=t_ID", "left")
				.where("a_is_referral", 1)
				.get("clients");

			rv = JSON.parse(JSON.stringify(response));
			console.log("Referrals Query Ran: " + qb.last_query());

			return rv;
		} catch (error) {
			return console.error(
				"getRenterReferrals Query Pool Query Error: " + error
			);
		} finally {
			if (qb) qb.release();
		}
	}
}

module.exports = new ClientModel();
