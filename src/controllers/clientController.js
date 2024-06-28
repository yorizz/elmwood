const clientmodel = require("../models/clientmodel");
const therapistmodel = require("../models/therapistmodel");
const referrersmodel = require("../models/referrersmodel");
const qualificationsmodel = require("../models/qualificationsmodel");

const { check, validationResult } = require("express-validator");

const bodyParser = require("body-parser");
const helpers = require("../utils/helpers");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const path = require("path");
const fs = require("fs");
const { appointmentsList } = require("./appointmentController");
const appointmentsmodel = require("../models/appointmentsmodel");

class ClientController {
	async getAllClients(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.getAllClients();

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let sessionTherapist = helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					allclients[i].t_ID
				);

				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_therapist: allclients[i].c_therapist,
					c_assessed_by: allclients[i].c_assessed_by,
					c_assessment_date: allclients[i].c_assessment_date,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_referred_by: allclients[i].c_referred_by,
					c_research_participation: allclients[i].c_research_participation,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
					c_low_cost_suitable: allclients[i].c_low_cost_suitable,
					c_details_sent_to_claire: allclients[i].c_details_sent_to_claire,
					c_is_active: allclients[i].c_is_active,
					t_ID: allclients[i].t_ID,
					t_first_name:
						allclients[i].t_ID != null
							? sessionTherapist.t_first_name
							: allclients[i].t_first_name,
					t_surname:
						allclients[i].t_ID != null
							? sessionTherapist.t_surname
							: allclients[i].t_surname,
					t_colour: allclients[i].t_colour,
					t_phone:
						allclients[i].t_ID != null
							? sessionTherapist.phone
							: allclients[i].phone,
					t_email:
						allclients[i].t_ID != null
							? sessionTherapist.t_email
							: allclients[i].t_email,
					t_fq_fee: allclients[i].t_fq_fee,
					t_fee: allclients[i].t_fee,
					t_is_active: allclients[i].t_is_active,
				};
				clients.push(client);
			}

			return res.render("templates/template.ejs", {
				name: "All Clients",
				page: "allclients.ejs",
				title: "All Clients",
				sidebar: true,
				// clientNav: true,
				clients: clients,
			});
		} catch (error) {
			console.log("allClients error", error);
		}
	}

	async getWaitingList(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.getAllClientsOnWaitingList();

			console.log("allClientsOnWaitingList", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Clients on Waiting List",
				page: "waitinglist.ejs",
				title: "All Clients on Waiting List",
				sidebar: true,
				clients: clients,
				clientNav: true,
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
			let therapists = req.session.allTherapists;

			console.log("therapists*", therapists);
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
			console.log("new enquiry errors", errors);
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
				c_assessment_date:
					req.body.assessment_date != "" ? req.body.assessment_date : null,
				c_enquiry_date: dateString,
				c_referred_by: req.body.referred_by,
				c_research_participation:
					req.body.research_participation == 1 ? 1 : 0,
				c_low_cost_employment: req.body.low_cost == 1 ? 1 : 0,
				c_low_cost_suitable: req.body.low_cost_suitable == 1 ? 1 : 0,
				c_details_sent_to_claire: req.body.sent_to_claire == 1 ? 1 : 0,
			};

			let storeNewEnquiry = await clientmodel.addClient(clientData);
			console.log("storeNewEnquiry", storeNewEnquiry);

			let allClients = req.session.allClients;
			const newClient = {
				c_ID: newClientId,
				c_first_name: req.body.first_name,
				c_surname: req.body.surname,
				c_email: req.body.email,
				c_phone: req.body.phone,
			};
			allClients.push(newClient);
			req.session.allClients = allClients;

			let storeClientTherapyTypeRequests =
				await clientmodel.storeClientTherapyTypeRequests(
					newClientId,
					req.body.therapy_types_requested
				);

			let storeNewReferral = req.body.referred_by_other
				? await clientmodel.storeReferral(req.body.referred_by_other)
				: null;

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
			let therapistsFromModel = await therapistmodel.getAllTherapistNames();
			let referrers = await referrersmodel.getAllReferrers();
			let qualifications = await qualificationsmodel.getAllQualifications();
			let requestedTherapyTypes = await clientmodel.getRequestedTherapyTypes(
				t_client.t_client[0].c_ID
			);

			let therapists = req.session.allTherapists;

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
			let cancelAllFutureAppointments =
				await appointmentsmodel.cancelAllFutureAppointments(clientID);
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

	async storeFile(req, res) {
		const clientFile = req.files.client_file;
		console.log("StoreFile", clientFile);

		const newDirPath =
			__dirname +
			`/../..${process.env.UPLOAD_PATH}clients/${req.body.clientID}/`;

		const clientFileDestinationPath = newDirPath + `${clientFile.name}`;
		let msg;
		try {
			if (!fs.existsSync(newDirPath)) {
				fs.mkdirSync(newDirPath, { recursive: true });
				console.log("Directory created:", newDirPath);
			} else {
				console.log("Directory exists!");
			}

			await clientFile.mv(clientFileDestinationPath);

			// store file data in database
			const clientFileData = {
				cf_ID: Date.now(),
				cf_file_name: clientFile.name,
				cf_client: req.body.clientID,
			};
			if (clientmodel.storeFileData(clientFileData)) {
				msg = { msg: "File added to client dossier" };
				console.log("msg", msg);
			} else {
				msg = { msg: "Unable to add file to client dossier" };
				console.log("msg", msg);
			}
			return res.json(msg);
		} catch (error) {
			console.log("storing file went wrong", error);
		}
	}

	async getContractClients(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.getAllContractClients();

			console.log("allContractClients", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Contract Clients",
				page: "waitinglist.ejs",
				title: "All Contract Clients",
				sidebar: true,
				clients: clients,
				// clientNav: true,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}

	async getContractClientsOnWaitingList(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.getAllContractClientsOnWaitingList;

			console.log("allContractClients", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Contract Clients",
				page: "waitinglist.ejs",
				title: "All Contract Clients On Waitinglist",
				sidebar: true,
				clients: clients,
				clientNav: true,
				contract: true,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}

	async getLowCostTraineeClientsOnWaitingList(req, res) {
		try {
			let clients = [];
			let allclients =
				// await clientmodel.getLowCostTraineeClientsOnWaitingList();
				await clientmodel.waitingListQuery(
					process.env.TRAINEE_PSYCHOTHERAPIST
				);

			console.log("getLowCostTraineeClients", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Low Cost Trainee Clients",
				page: "waitinglist.ejs",
				title: "All Low Cost Trainee Clients On Waitinglist",
				sidebar: true,
				clients: clients,
				clientNav: true,
				trainee: true,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}
	async getLowCostPrecredClientsOnWaitingList(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.waitingListQuery(
				process.env.PRE_CRED
			);
			// await clientmodel.getLowCostPrecredClientsOnWaitingList();

			console.log("getLowCostPrecredClients", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Low Cost Precred Clients",
				page: "waitinglist.ejs",
				title: "All Low Cost Precred Clients On Waitinglist",
				sidebar: true,
				clients: clients,
				clientNav: true,
				precred: true,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}
	async getDeborahClientsOnWaitingList(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.getDeborahClientsOnWaitingList();

			console.log("getDeborahClients", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Deborah's Clients",
				page: "waitinglist.ejs",
				title: "All Deborah's Clients On Waitinglist",
				sidebar: true,
				clients: clients,
				clientNav: true,
				deborah: true,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}
	async getFionaClientsOnWaitingList(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.getFionaClientsOnWaitingList();

			console.log("getFionaClients", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Fiona's Clients",
				page: "waitinglist.ejs",
				title: "All Fiona's Clients On Waitinglist",
				sidebar: true,
				clients: clients,
				clientNav: true,
				fiona: true,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}
	async getCouplesOrFamiliesClientsOnWaitingList(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.waitingListQuery(
				process.env.PSYCHOTHERAPIST_COUPLES
			);
			// await clientmodel.getCouplesOrFamiliesClientsOnWaitingList();

			console.log("getCouplesOrFamiliesClients", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Couples/Families Clients",
				page: "waitinglist.ejs",
				title: "All Couples/Families Clients On Waitinglist",
				sidebar: true,
				clients: clients,
				clientNav: true,
				couples: true,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}
	async getUnder18sClientsOnWaitingList(req, res) {
		try {
			let clients = [];
			let allclients = await clientmodel.waitingListQuery(
				process.env.UNDER_18S
			);

			console.log("getUnder18sClients", allclients);

			for (let i = 0; i < allclients.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					allclients[i].c_ID
				);
				let client = {
					c_ID: allclients[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: allclients[i].c_enquiry_date,
					c_low_cost_employment: allclients[i].c_low_cost_employment,
				};
				clients.push(client);
			}

			console.log("CLIENTS", clients);

			return res.render("templates/template.ejs", {
				name: "All Under 18s Clients",
				page: "waitinglist.ejs",
				title: "All Under 18s Clients On Waitinglist",
				sidebar: true,
				clients: clients,
				clientNav: true,
				under18s: true,
			});
		} catch (error) {
			console.log("waitinglist error", error);
		}
	}

	async getRenterReferrals(req, res) {
		console.log("In RenterReferral");
		try {
			let referrals = [];
			let renterreferrals = await clientmodel.getRenterReferrals();

			console.log("getRenterReferrals", renterreferrals);

			for (let i = 0; i < renterreferrals.length; i++) {
				let sessionClient = helpers.getPersonName(
					req.session.allClients,
					"client",
					renterreferrals[i].c_ID
				);
				let client = {
					c_ID: renterreferrals[i].c_ID,
					c_first_name: sessionClient.c_first_name,
					c_surname: sessionClient.c_surname,
					c_phone: sessionClient.c_phone,
					c_email: sessionClient.c_email,
					c_enquiry_date: renterreferrals[i].c_enquiry_date,
					c_low_cost_employment: renterreferrals[i].c_low_cost_employment,
					a_ID: renterreferrals[i].a_ID,
					a_client: renterreferrals[i].a_client,
					a_therapist: renterreferrals[i].a_therapist,
					a_date: renterreferrals[i].a_date,
					a_start_time: renterreferrals[i].a_start_time,
					a_end_time: renterreferrals[i].a_end_time,
					a_room: renterreferrals[i].a_room,
					a_client_fee: renterreferrals[i].a_client_fee,
					a_therapist_fee: renterreferrals[i].a_therapist_fee,
					a_is_paid: renterreferrals[i].a_is_paid,
					a_is_cancelled: renterreferrals[i].a_is_cancelled,
					a_is_referral: renterreferrals[i].a_is_referral,
					a_is_referral_paid: renterreferrals[i].a_is_referral_paid,
					a_needs_payment: renterreferrals[i].a_needs_payment,
					a_cancellation_reason: renterreferrals[i].a_cancellation_reason,
					a_cancellation_date: renterreferrals[i].a_cancellation_date,
					a_is_therapist_paid: renterreferrals[i].a_is_therapist_paid,
					t_ID: renterreferrals[i].t_ID,
					t_first_name: renterreferrals[i].t_first_name,
					t_surname: renterreferrals[i].t_surname,
				};
				referrals.push(client);
			}

			console.log("Referrals", referrals);
			return res.render("templates/template.ejs", {
				name: "Renter Referrals",
				page: "renterreferrals.ejs",
				title: "Renter Referrals",
				sidebar: true,
				referrals: referrals,
			});
		} catch (error) {
			console.log("error rendering Renter Referrals", error);
		}
	}
}

module.exports = new ClientController();
