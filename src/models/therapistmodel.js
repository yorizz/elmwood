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

			console.log("Query Ran: " + qb.last_query());

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

			console.log("Query Ran: " + qb.last_query());

			therapists = JSON.parse(JSON.stringify(response));
			therapists_rv = therapists;

			const tq_response = await qb
				.select("*")
				.join("qualifications", "q_ID=tq_qualification")
				.where("tq_therapist", therapistID)
				.get("therapist_qualifications");

			console.log("Query Ran: " + qb.last_query());

			therapist_qualifications = JSON.parse(JSON.stringify(tq_response));
			therapist_qualifications_rv = therapist_qualifications;

			const tct_response = await qb
				.select("*")
				.join("contract_types", "tct_contract_type=ct_ID")
				.join("therapists", "tct_therapist=t_ID")
				.where("t_ID", therapistID)
				.get("therapist_contract_types");

			console.log("Query Ran: " + qb.last_query());

			therapist_contracts = JSON.parse(JSON.stringify(tct_response));
			therapist_contracts_rv = therapist_contracts;

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
			};

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async addTherapist(therapist, qualifications, contract_types) {
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

						msg += ", contract types added";
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

	async updateTherapist(therapist, qualifications, contract_types) {
		let qb;
		let msg = "";
		console.log("UPDATE THERAPIST", therapist);

		try {
			const updatedTherapistData = {
				t_first_name: helpers.dataEncrypt(therapist.first_name),
				t_surname: helpers.dataEncrypt(therapist.surname),
				t_phone: helpers.dataEncrypt(therapist.phone),
				t_email: helpers.dataEncrypt(therapist.email),
				t_fq_fee: therapist.fee_fq,
				t_fee: therapist.fee,
			};

			qb = await pool.get_connection();

			const insertID = await qb.update("therapists", updatedTherapistData, {
				t_ID: therapist.therapist_ID,
			});

			console.log("UPDATING THERAPIST", qb.last_query());

			if (insertID.affectedRows == 1) {
				msg = "Therapist updated";

				//delete existing qualifications
				let deletedQualifications = await qb.delete(
					"therapist_qualifications",
					{
						tq_therapist: therapist.therapist_ID,
					}
				);

				console.log("Deleted ", deletedQualifications, qb.last_query());

				// insert the qualifications
				console.log("new qualifications", qualifications);
				if (qualifications.length >= 1) {
					for (let i = 0; i < qualifications.length; i++) {
						let tq_data = {
							tq_therapist: therapist.therapist_ID,
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
						tct_therapist: therapist.therapist_ID,
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
							tct_therapist: therapist.therapist_ID,
						};
						await qb.insert("therapist_contract_types", tct_data);

						console.log("added new contract types", qb.last_query());

						msg += ", contract types added";
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

			console.log("Query Ran: " + qb.last_query());
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

			console.log("Query Ran: " + qb.last_query());
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
			console.log("Query Ran: " + qb.last_query());
			return res.JSON({ msg: "added note to therapist" });
		} catch (error) {
			return console.error("Pool Query Error: " + error);
		} finally {
			if (qb) qb.release();
		}
	}

	async removeTherapist(therapistID) {}
}

module.exports = new TherapistModel();
