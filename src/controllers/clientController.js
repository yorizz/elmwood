const clientmodel = require("../models/clientmodel");
const therapistmodel = require("../models/therapistmodel");
const referrersmodel = require("../models/referrersmodel");
const qualificationsmodel = require("../models/qualificationsmodel");
const upload = multer(process.env.MULTEROPTIONS);

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
			let requestedTherapyTypes;
			if (!isNaN(parseInt(req.params.id))) {
				t_client = await clientmodel.getClient(req.params.id);
				requestedTherapyTypes = await clientmodel.getRequestedTherapyTypes(
					req.params.id
				);
				console.log("client", t_client);
				console.log("requested therapy types", requestedTherapyTypes);
			}

			return res.render("templates/template.ejs", {
				name: "Client",
				page: "client.ejs",
				title: "Client",
				sidebar: true,
				pathCorrection: "../",
				t_client: t_client.t_client,
				t_client_assessed_by: t_client.client_assessed_by,
				requestedTherapyTypes: requestedTherapyTypes,
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
			const dateString =
				helpers.formatYYYYMMDDDate(current_date, "-") +
				" " +
				helpers.formatTime(current_date);

			console.log("dateString", dateString);

			let newClientId = Date.now();

			let clientData = {
				c_ID: newClientId,
				c_first_name: helpers.dataEncrypt(req.body.first_name),
				c_surname: helpers.dataEncrypt(req.body.surname),
				c_phone: helpers.dataEncrypt(req.body.phone),
				c_email: helpers.dataEncrypt(req.body.email),
				c_therapist: req.body.therapists,
				c_assessed_by: req.body.assessed_by,
				c_enquiry_date: dateString,
				c_referred_by: req.body.referred_by,
				c_research_participation:
					req.body.research_participation == 1 ? 1 : 0,
				c_low_cost_employment: req.body.low_cost == 1 ? 1 : 0,
				c_details_sent_to_claire: req.body.sent_to_claire == 1 ? 1 : 0,
			};

			let storeNewEnquiry = await clientmodel.addClient(clientData);
			console.log("storeNewEnquiry", storeNewEnquiry);

			let storeClientTherapyTypeRequests =
				await clientmodel.storeClientTherapyTypeRequests(
					newClientId,
					req.body.therapy_types_requested
				);

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
			let qualifications = await qualificationsmodel.getAllQualifications();
			let requestedTherapyTypes = await clientmodel.getRequestedTherapyTypes(
				t_client.t_client[0].c_ID
			);

			console.log("requestedTherapyTypes", requestedTherapyTypes);

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
				qualifications: qualifications,
				requestedTherapyTypes: requestedTherapyTypes,
				files: t_client.t_client[0].client_files,
				notes: t_client.t_client[0].client_notes,
				isEdit: true,
			});
		} catch (error) {
			console.log("unable to display edit therapist", error);
		}
	}

	async updateClient(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.json(errors);
		} else {
			console.log("form payload", req.body);

			let clientData = {
				c_first_name: helpers.dataEncrypt(req.body.first_name),
				c_surname: helpers.dataEncrypt(req.body.surname),
				c_phone: helpers.dataEncrypt(req.body.phone),
				c_email: helpers.dataEncrypt(req.body.email),
				c_therapist: req.body.therapists,
				c_assessed_by: req.body.assessed_by,
				c_referred_by: req.body.referred_by,
				c_research_participation:
					req.body.research_participation == 1 ? 1 : 0,
				c_low_cost_employment: req.body.low_cost == 1 ? 1 : 0,
				c_details_sent_to_claire: req.body.sent_to_claire == 1 ? 1 : 0,
			};

			let updateClient = await clientmodel.updateClient(
				clientData,
				req.params.id
			);

			let removeExistingTherapyRequestsForClient =
				await clientmodel.removeExistingTherapyRequestsForClient(
					req.params.id
				);
			let storeClientTherapyTypeRequests =
				await clientmodel.storeClientTherapyTypeRequests(
					req.params.id,
					req.body.therapy_types_requested
				);

			return res.redirect("/waitinglist");
		}
	}

	async getNoteModalContent() {
		try {
			return res.render("pages/addclientnode.ejs");
		} catch (error) {
			console.log("getNoteModalContent error", error);
		}
	}

	async addNote(req, res) {
		console.log("ADDING NOTE");
		try {
			// console.log(session.user);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.json(errors);
			} else {
				let data = {
					cn_ID: Date.now(),
					cn_note: helpers.dataEncrypt(req.body.client_note),
					cn_client: req.body.clientId,
				};
				console.log("client note data", data);
				let storeClientNote = await clientmodel.addNote(
					data,
					req.body.clientId
				);

				res.json({ msg: "client note added: " + storeClientNote });
			}
		} catch (error) {
			console.log("post note error", error);
		}
	}

	async deactivateClient(req, res) {
		try {
			let clientID = req.params.id;
			let clientDeactivated = await clientmodel.clientDeactivated(clientID);
			res.json({ msg: "client " + clientID + " deactivated" });
		} catch (error) {
			console.log("unable to deactivate client", error);
		}
	}
	async activateClient(req, res) {
		try {
			let clientID = req.params.id;
			let clientActivated = await clientmodel.clientActivated(clientID);
			res.json({ msg: "client " + clientID + " activated" });
		} catch (error) {
			console.log("unable to deactivate client", error);
		}
	}
}

module.exports = new ClientController();
