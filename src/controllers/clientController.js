const clientmodel = require("../models/clientmodel");
const therapistmodel = require("../models/therapistmodel");
const referrersmodel = require("../models/referrersmodel");
const qualificationsmodel = require("../models/qualificationsmodel");

const { check, validationResult } = require("express-validator");

const bodyParser = require("body-parser");
const helpers = require("../utils/helpers");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

class ClientController {
	async getAllClients(req, res) {
		try {
			let allclients = await clientmodel.getAllClients();

			return res.render("templates/template.ejs", {
				name: "All Clients",
				page: "allclients.ejs",
				title: "All Clients",
				sidebar: true,
				clients: allclients,
			});
		} catch (error) {
			console.log("allClients error", error);
		}
	}

	async getWaitingList(req, res) {
		try {
			let allclients = await clientmodel.getAllClientsOnWaitingList();

			return res.render("templates/template.ejs", {
				name: "All Clients on Waiting List",
				page: "waitinglist.ejs",
				title: "All Clients on Waiting List",
				sidebar: true,
				clients: allclients,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}

	async getSingleClient(req, res) {
		try {
			let t_client;
			if (!isNaN(parseInt(req.params.id))) {
				t_client = await clientmodel.getClient(req.params.id);

				console.log("client", t_client);
			}

			return res.render("templates/template.ejs", {
				name: "Client",
				page: "client.ejs",
				title: "Client",
				sidebar: true,
				pathCorrection: "../",
				t_client: t_client.t_client,
				t_client_assessed_by: t_client.client_assessed_by,
				files: t_client.client_files,
				notes: t_client.client_notes,
			});
		} catch (error) {
			console.log("unknown client error", error);
		}
	}

	async getNewEnquiry(req, res) {
		try {
			let therapists = await therapistmodel.getAllTherapists();
			let referrers = await referrersmodel.getAllReferrers();
			let qualifications = await qualificationsmodel.getAllQualifications();
			console.log("qualifications", qualifications);

			return res.render("templates/template.ejs", {
				name: "New Enquiry",
				page: "newenquiry.ejs",
				title: "New Enquiry",
				sidebar: true,
				pathCorrection: "../",
				therapists: therapists,
				referrers: referrers,
				qualifications: qualifications,
			});
		} catch (error) {
			console.log("can't open new enquiry", error);
		}
	}

	async postNewEnquiry(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.json(errors);
		} else {
			console.log("form payload", req.body);

			const current_date = new Date();
			const dateString = helpers.formatYYYYMMDDDate(current_date, "-");
			" " + helpers.formatTime(current_date);

			console.log("dateString", dateString);

			let clientData = {
				c_ID: Date.now(),
				c_first_name: helpers.dataEncrypt(req.body.first_name),
				c_surname: helpers.dataEncrypt(req.body.surname),
				c_phone: helpers.dataEncrypt(req.body.phone),
				c_email: helpers.dataEncrypt(req.body.email),
				c_therapist: req.body.therapists,
				c_assessed_by: req.body.assessed_by,
				c_enquiry_date: dateString,
				c_referred_by: req.body.referred_by,
				c_low_cost_employment: req.body.low_cost,
				c_details_sent_to_claire: req.body.sent_to_claire,
			};

			let storeNewEnquiry = await clientmodel.addClient(clientData);
			console.log("storeNewEnquiry", storeNewEnquiry);

			return res.redirect("/waitinglist");
		}
	}

	async getTherapistForClient(req, res) {
		let clientID = req.body.client;
		try {
			let therapist = await clientmodel.getTherapistIDForClient(clientID);
			if (therapist != null) {
				return res.json(therapist);
			}
		} catch (error) {
			console.log("/gettherapistforclient error", error);
		}
	}

	async editClient(req, res) {
		try {
			let t_client;
			if (!isNaN(parseInt(req.params.id))) {
				t_client = await clientmodel.getClient(req.params.id);

				console.log("t_client", t_client);
			}
			let therapists = await therapistmodel.getAllTherapists();
			let referrers = await referrersmodel.getAllReferrers();

			return res.render("templates/template.ejs", {
				name:
					"Edit " +
					helpers.dataDecrypt(t_client.t_client[0].c_first_name) +
					" " +
					helpers.dataDecrypt(t_client.t_client[0].c_surname),
				page: "newenquiry.ejs",
				title:
					"Edit " +
					helpers.dataDecrypt(t_client.t_client[0].c_first_name) +
					" " +
					helpers.dataDecrypt(t_client.t_client[0].c_surname),
				sidebar: true,
				t_client: t_client,
				pathCorrection: "../../",
				t_client: t_client,
				t_client_assessed_by: t_client.t_client[0].client_assessed_by,
				therapists: therapists,
				referrers: referrers,
				files: t_client.t_client[0].client_files,
				notes: t_client.t_client[0].client_notes,
				isEdit: true,
			});
		} catch (error) {
			console.log("unable to display edit therapist", error);
		}
	}
}

module.exports = new ClientController();
