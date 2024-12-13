require("dotenv").config();

const QueryBuilder = require("node-querybuilder");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");
const helpers = require("../utils/helpers");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class TherapistModel {
	async getAllTherapists() {
		let therapists = [];
		let rv = false;
		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb.select("*").get("therapists");

			// console.log("Query Ran: " + qb.last_query());

			therapists = JSON.parse(JSON.stringify(response));
			rv = therapists;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAllActiveTherapists() {
		let therapists = [];
		let rv = false;
		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.where("t_is_active", 1)
				.select("t_ID")
				.get("therapists");

			console.log("Query Ran: " + qb.last_query());

			therapists = JSON.parse(JSON.stringify(response));
			rv = therapists;

			console.log("All active therapists", rv);

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAllTherapistNames() {
		let therapists = [];
		let rv = false;
		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select(["t_ID", "t_first_name", "t_surname"])
				.get("therapists");

			// console.log("Query Ran: " + qb.last_query());

			therapists = JSON.parse(JSON.stringify(response));
			rv = therapists;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async getTherapist(therapistID) {
		let therapists = [];
		let therapists_rv = false;

		let therapist_qualifications = [];
		let therapist_qualifications_rv = false;

		let therapist_contracts = [];
		let therapist_contracts_rv = false;

		let therapist_accreditations = [];
		let therapist_accreditations_rv = false;

		let therapist_files = [];
		let therapist_files_rv = [];

		let therapist_notes = [];
		let therapist_notes_rv = false;

		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.where("t_ID", therapistID)
				.get("therapists");

			// console.log("Query Ran: " + qb.last_query());

			therapists = JSON.parse(JSON.stringify(response));
			therapists_rv = therapists;

			const tq_response = await qb
				.select("*")
				.join("qualifications", "q_ID=tq_qualification")
				.where("tq_therapist", therapistID)
				.get("therapist_qualifications");

			// console.log("Query Ran: " + qb.last_query());

			therapist_qualifications = JSON.parse(JSON.stringify(tq_response));
			therapist_qualifications_rv = therapist_qualifications;

			const tct_response = await qb
				.select("*")
				.join("contract_types", "tct_contract_type=ct_ID")
				.join("therapists", "tct_therapist=t_ID")
				.where("t_ID", therapistID)
				.get("therapist_contract_types");

			// console.log("Query Ran: " + qb.last_query());

			therapist_contracts = JSON.parse(JSON.stringify(tct_response));
			therapist_contracts_rv = therapist_contracts;

			const ta_response = await qb
				.select("*")
				.join("accreditations", "a_ID=ta_accreditation")
				.where("ta_therapist", therapistID)
				.get("therapist_accreditations");

			// console.log("Query Ran: " + qb.last_query());

			therapist_accreditations = JSON.parse(JSON.stringify(ta_response));
			therapist_accreditations_rv = therapist_accreditations;

			const ttf_response = await qb
				.select("tf_file_name,tf_file_upload_date")
				.join("therapists", "t_ID=tf_therapist")
				.where("tf_therapist", therapistID)
				.order_by("tf_file_upload_date", "desc")
				.get("therapist_files");

			console.log("Query Ran: " + qb.last_query(), ttf_response);

			therapist_files = JSON.parse(JSON.stringify(ttf_response));
			therapist_files_rv = therapist_files;

			const tn_response = await qb
				.select("tn_note,tn_date")
				.join("therapists", "t_ID=tn_therapist")
				.where("tn_therapist", therapistID)
				.order_by("tn_date", "desc")
				.get("therapist_notes");

			console.log("Query Ran: " + qb.last_query(), tn_response);

			therapist_notes = JSON.parse(JSON.stringify(tn_response));
			therapist_notes_rv = therapist_notes;

			let rv = {
				therapist: therapists_rv,
				therapist_qualifications: therapist_qualifications_rv,
				therapist_contracts: therapist_contracts_rv,
				therapist_files: therapist_files_rv,
				therapist_notes: therapist_notes_rv,
				therapist_accreditations: therapist_accreditations_rv,
			};

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async addTherapist(
		therapist,
		qualifications,
		contract_types,
		accreditations
	) {
		let qb;
		const newID = Date.now();
		let msg = "";

		try {
			const data = {
				t_ID: newID,
				t_first_name: helpers.dataEncrypt(therapist.first_name),
				t_surname: helpers.dataEncrypt(therapist.surname),
				t_colour: helpers.generateColorHexCode(),
				t_phone: helpers.dataEncrypt(therapist.phone),
				t_email: helpers.dataEncrypt(therapist.email),
				t_fq_fee: therapist.fee_fq,
				t_fee: therapist.fee,
				t_insurance_expiry_date: therapist.insurance_expiry,
			};

			qb = await pool.get_connection();

			const insertID = await qb.insert("therapists", data);
			if (insertID.affectedRows == 1) {
				msg = "Therapist added";

				// insert the qualifications
				if (qualifications.length >= 1) {
					for (let i = 0; i < qualifications.length; i++) {
						let tq_data = {
							tq_therapist: newID,
							tq_qualification: qualifications[i],
						};
						await qb.insert("therapist_qualifications", tq_data);

						msg += ", qualifications added";
					}
				}
				if (contract_types.length >= 1) {
					for (let i = 0; i < contract_types.length; i++) {
						let tct_data = {
							tct_contract_type: contract_types[i],
							tct_therapist: newID,
						};
						await qb.insert("therapist_contract_types", tct_data);
					}
					msg += ", contract types added";
				}
				if (accreditations.length >= 1) {
					for (let i = 0; i < accreditations.length; i++) {
						if (isNaN(accreditations[i])) {
							await qb.insert("accreditations", {
								a_accreditation: accreditations[i],
							});
						} else {
							let ta_data = {
								ta_accreditation: accreditations[i],
								ta_therapist: newID,
							};
							await qb.insert("therapist_accreditations", ta_data);
						}
					}
					msg += ", contract types added";
				}
			}

			return { msg: msg, insertID: newID };
		} catch (error) {
			console.log("Unable to save therapist", error);
			msg = "Error: " + error;
		} finally {
			if (qb) qb.release();
		}
	}

	async updateTherapist(
		therapist_ID,
		therapist,
		qualifications,
		contract_types,
		accreditations
	) {
		let qb;
		let msg = "";
		console.log("UPDATE THERAPIST", therapist);
		console.log("therapist_ID", therapist_ID);

		try {
			const updatedTherapistData = {
				t_first_name: therapist.t_first_name,
				t_surname: therapist.t_surname,
				t_phone: therapist.t_phone,
				t_email: therapist.t_email,
				t_fq_fee: therapist.t_fq_fee,
				t_fee: therapist.t_fee,
				t_insurance_expiry_date: therapist.t_insurance_expiry_date,
			};

			qb = await pool.get_connection();

			const insertID = await qb.update("therapists", updatedTherapistData, {
				t_ID: therapist_ID,
			});

			console.log("UPDATING THERAPIST", qb.last_query());

			if (insertID.affectedRows == 1) {
				msg = "Therapist updated";

				//delete existing qualifications
				let deletedQualifications = await qb.delete(
					"therapist_qualifications",
					{
						tq_therapist: therapist_ID,
					}
				);

				console.log("Deleted ", deletedQualifications, qb.last_query());

				// insert the qualifications
				console.log("new qualifications", qualifications);
				if (qualifications.length >= 1) {
					for (let i = 0; i < qualifications.length; i++) {
						let tq_data = {
							tq_therapist: therapist_ID,
							tq_qualification: qualifications[i],
						};
						await qb.insert("therapist_qualifications", tq_data);

						console.log("new qualifications entered", qb.last_query());

						msg += ", qualifications added";
					}
				}

				//delete existing contract types
				let deletedContractTypes = await qb.delete(
					"therapist_contract_types",
					{
						tct_therapist: therapist_ID,
					}
				);

				console.log(
					"Deleted Contract Types",
					deletedContractTypes,
					qb.last_query()
				);

				if (contract_types.length >= 1) {
					for (let i = 0; i < contract_types.length; i++) {
						let tct_data = {
							tct_contract_type: contract_types[i],
							tct_therapist: therapist_ID,
						};
						await qb.insert("therapist_contract_types", tct_data);

						console.log("added new contract types", qb.last_query());

						msg += ", contract types added";
					}
				}

				let deletedAccreditations = await qb.delete(
					"therapist_accreditations",
					{
						ta_therapist: therapist_ID,
					}
				);

				console.log(
					"Deleted Accreditations",
					deletedAccreditations,
					qb.last_query()
				);

				if (accreditations.length >= 1) {
					for (let i = 0; i < accreditations.length; i++) {
						let ta_data = {
							ta_accreditation: accreditations[i],
							ta_therapist: therapist_ID,
						};
						await qb.insert("therapist_accreditations", ta_data);

						console.log("added new accreditations", qb.last_query());

						msg += ", accreditations types added";
					}
				}
			}

			return msg;
		} catch (error) {
			console.log("Unable to save therapist", error);
			msg = "Error: " + error;
		} finally {
			if (qb) qb.release();
		}
	}

	async listClientsPerTherapist() {
		let qb;
		let msg = "";
		console.log("listClientsPerTherapist");

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select(
					[
						"t_ID",
						"t_first_name",
						"t_surname",
						"t_colour",
						"c_ID",
						"c_first_name",
						"c_surname",
						"c_low_cost_employment",
					],
					null,
					false
				)
				.join("clients", "c_therapist=t_ID", "inner")
				.where("c_is_active", 1)
				.order_by("t_surname")
				.get("therapists");

			console.log("Clients per Therapist Query", qb.last_query());

			console.log("clients per therapist", response);
			return JSON.parse(JSON.stringify(response));
		} catch (error) {
			console.log("Unable to list clients per therapist therapist", error);
			msg = "Error: " + error;
		} finally {
			if (qb) qb.release();
		}
	}

	async deactivateTherapist(therapistID) {
		let qb = await pool.get_connection();
		try {
			qb.update(
				"therapists",
				{ t_is_active: 0 },
				{ t_ID: therapistID },
				(err, res) => {
					if (err) return console.error(err);
					else return 1;
				}
			);

			// console.log("Query Ran: " + qb.last_query());
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}
	async activateTherapist(therapistID) {
		let qb = await pool.get_connection();
		try {
			qb.update(
				"therapists",
				{ t_is_active: 1 },
				{ t_ID: therapistID },
				(err, res) => {
					if (err) return console.error(err);
					else return 1;
				}
			);

			// console.log("Query Ran: " + qb.last_query());
			return { msg: "therapist activated" };
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async addTherapistNote(note, clientID) {
		let qb = await pool.get_connection();
		try {
			qb.insert("therapist_notes", note, (err, res) => {
				if (err) return console.error(err);
			});
			// console.log("Query Ran: " + qb.last_query());
			return res.JSON({ msg: "added note to therapist" });
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async storeFileData(clientFileData) {
		let qb = await pool.get_connection();
		try {
			qb.insert("therapist_files", clientFileData, (err, res) => {
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

	async getOutstandingFeesPerTherapist() {
		let qb;
		let msg = "";
		try {
			qb = await pool.get_connection();
			const response = await qb
				.select(
					[`a_therapist`, "SUM(`a_therapist_fee`) AS `unpaid`"],
					null,
					false
				)
				.where({
					a_is_paid: 0,
					"`a_date`<": Date.now(),
					a_needs_payment: 1,
					"`a_client_fee`>": 0,
				})
				.group_by("a_therapist")
				.order_by("unpaid", "desc")
				.get("appointments");

			console.log("Unpaid fees per Therapist Query", qb.last_query());

			// console.log("Unpaid fees per therapist", response);
			return JSON.parse(JSON.stringify(response));
		} catch (error) {
			console.log("Unable to list unpaid fees per  therapist", error);
			msg = "Error: " + error;
		} finally {
			if (qb) qb.release();
		}
	}

	async getTotalOutstandingTherapistFees() {
		let qb;
		let msg = "";
		try {
			qb = await pool.get_connection();
			const response = await qb
				.select(["SUM(`a_therapist_fee`) AS `unpaid`"], null, false)
				.join("therapists", "a_therapist=t_ID", "inner")
				.where({
					a_is_paid: 0,
					"`a_date`<": Date.now(),
					a_needs_payment: 1,
					"`a_client_fee`>": 0,
				})
				.get("appointments");

			console.log("Total Unpaid fees per Therapist Query", qb.last_query());

			return JSON.parse(JSON.stringify(response));
		} catch (error) {
			console.log("Unable to list unpaid fees per  therapist", error);
			msg = "Error: " + error;
		} finally {
			if (qb) qb.release();
		}
	}

	async allTherapistsForSession() {
		let qb;
		try {
			qb = await pool.get_connection();
			const allTherapistsForSession = await qb
				.select([
					"t_ID",
					"t_first_name",
					"t_surname",
					"t_email",
					"t_phone",
					"t_colour",
				])
				.get("therapists");

			// console.log("Query Ran: " + qb.last_query());

			return allTherapistsForSession;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async removeTherapist(therapistID) {}

	async encryptTherapist() {
		let qb;
		const newID = Date.now();
		let msg = "";
		try {
			qb = await pool.get_connection();

			const data = {
				t_ID: newID,
				t_first_name: helpers.sodiumEncrypt("Joris").toString(),
				t_surname: helpers.sodiumEncrypt("Vreeke").toString(),
			};

			const insertID = await qb.insert("temptp", data);

			console.log("ENCRYPTING TEMP THERAPIST", qb.last_query());

			return insertID;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async decryptTherapist() {
		let qb;
		try {
			qb = await pool.get_connection();
			const response = await qb.select("*").get("temptp");

			// console.log("Query Ran: " + qb.last_query());

			let therapists = JSON.parse(JSON.stringify(response));
			let rv = therapists;

			return rv;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async getExpiringInsurances() {
		let qb;
		try {
			qb = await pool.get_connection();
			//SELECT * FROM `therapists` WHERE DATEDIFF(DATE(`t_insurance_expiry_date`), NOW()) < 30;
			const response = await qb.query(
				"SELECT `t_ID`, `t_first_name`, `t_surname`, `t_insurance_expiry_date` FROM `therapists` WHERE DATEDIFF(DATE(`t_insurance_expiry_date`), NOW()) < 30 OR DATE(`t_insurance_expiry_date`) < NOW() ORDER BY `t_insurance_expiry_date` ASC"
			);

			let therapists = JSON.parse(JSON.stringify(response));
			let rv = therapists;

			console.log("insurance expiring", rv);

			return rv;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	//datesToCompare = {dateRangeStart:…, dateRangeEnd:…}
	async getProfitPerTherapist(therapistID, datesToCompare) {
		let qb;
		let query;

		console.log("datesToCompare", datesToCompare);
		try {
			qb = await pool.get_connection();

			query = `SELECT  (SUM(a_client_fee)-SUM(a_therapist_fee)) as elmwoodfee, a_therapist, t_email FROM appointments JOIN therapists ON a_therapist=t_ID  GROUP BY a_therapist ORDER BY elmwoodfee DESC;`;

			if (therapistID != null) {
				query = `SELECT  (SUM(a_client_fee)-SUM(a_therapist_fee)) as elmwoodfee, a_therapist, t_email FROM appointments JOIN therapists ON a_therapist=t_ID WHERE a_therapist=${therapistID} GROUP BY a_therapist ORDER BY elmwoodfee DESC;`;
			}

			if (datesToCompare != null) {
				query = `SELECT (SUM(a_client_fee)-SUM(a_therapist_fee)) as elmwoodfee, a_therapist, t_email FROM appointments JOIN therapists ON a_therapist=t_ID WHERE a_date BETWEEN DATE('${datesToCompare.dateRangeStart}') AND DATE('${datesToCompare.dateRangeEnd}') GROUP BY a_therapist ORDER BY elmwoodfee DESC;`;
			}

			if (therapistID != null && datesToCompare != null) {
				query = `SELECT (SUM(a_client_fee)-SUM(a_therapist_fee)) as elmwoodfee, a_therapist, t_email FROM appointments JOIN therapists ON a_therapist=t_ID WHERE a_date BETWEEN DATE('${datesToCompare.dateRangeStart}') AND DATE('${datesToCompare.dateRangeEnd}') GROUP BY a_therapist ORDER BY elmwoodfee DESC;`;
			}

			console.log("profit query:", query);

			const response = await qb.query(query);

			let therapists = JSON.parse(JSON.stringify(response));
			let rv = therapists;

			console.log("profits per therapist", rv);

			return rv;
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async getAvailability(therapistID) {
		let qb;
		let rv;
		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.where("ta_therapist", therapistID)
				.get("therapist_availability");

			// console.log("Query Ran: " + qb.last_query());

			const therapist = JSON.parse(JSON.stringify(response));
			rv = therapist;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async deleteAvailability(availabilityID) {
		let qb;
		try {
			qb = await pool.get_connection();
			const results = await qb.delete("therapist_availability", {
				ta_ID: availabilityID,
			});

			return { message: results.affected_rows };
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async editAvailability(availabilityID) {
		let qb, rv;

		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.where("ta_ID", availabilityID)
				.get("therapist_availability");

			// console.log("Query Ran: " + qb.last_query());

			rv = JSON.parse(JSON.stringify(response));

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async updateAvailability(availabilityData, availabilityID) {
		let qb = await pool.get_connection();
		try {
			qb.update(
				"therapist_availability",
				availabilityData,
				{ ta_ID: availabilityID },
				(err, res) => {
					if (err) return console.error(err);
					else return 1;
				}
			);

			// console.log("Query Ran: " + qb.last_query());
			return { msg: "availability updated" };
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async addAvailability(availabilityData) {
		let qb = await pool.get_connection();

		try {
			const insertID = await qb.insert(
				"therapist_availability",
				availabilityData
			);
			if (insertID.affectedRows == 1) {
			}

			// console.log("Query Ran: " + qb.last_query());
			return { msg: "availability added" };
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	/**
	 * @params type = 'exclude' || 'only'
	 * @params categories = the therapist qualification types to in- or exclude
	 */
	async getSupervisionTherapists(type, categories) {
		let therapists = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			let response;

			if (type == "only") {
				response = await qb
					.distinct()
					.select("t_ID, t_first_name, t_surname")
					.from("therapists")
					.join("therapist_qualifications", "t_ID=tq_therapist")
					.where_in("tq_qualification", categories)
					.get();
			} else if (type == "exclude") {
				response = await qb
					.distinct()
					.select("t_ID, t_first_name, t_surname")
					.from("therapists")
					.join("therapist_qualifications", "t_ID=tq_therapist")
					.where_not_in("tq_qualification", categories)
					.get();
			}

			console.log("Query Ran: " + qb.last_query());

			rv = JSON.parse(JSON.stringify(response));

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}
}

module.exports = new TherapistModel();
