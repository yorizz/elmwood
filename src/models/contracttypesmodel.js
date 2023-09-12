require("dotenv").config();

const QueryBuilder = require("node-querybuilder");

const express = require("express");
const app = express();

const db_config = require("../utils/dbconfig");
const helpers = require("../utils/helpers");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class ContractTypesModel {
	async getAllContractTypes() {
		let contract_types = [];
		let rv = false;

		let qb;

		try {
			qb = await pool.get_connection();

			const response = await qb
				.select("*")
				.from("contract_types")
				.order_by("ct_contract_type", "asc")
				.get();

			console.log("Query Ran: " + qb.last_query());
			console.log("db response for contract types", response);

			contract_types = JSON.parse(JSON.stringify(response));

			rv = contract_types;

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async addContractType(contractType) {
		console.log("contractType", contractType);
		let qb;

		try {
			//do something
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}
	async updateContractType(ContractTypeID) {}
	async removeContractType(ContractTypeID) {}
}

module.exports = new ContractTypesModel();
