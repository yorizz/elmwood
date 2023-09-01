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

	async addTherapist() {}
	async updateTherapist(therapistID) {}
	async removeTherapist(therapistID) {}
}

module.exports = new TherapistModel();
