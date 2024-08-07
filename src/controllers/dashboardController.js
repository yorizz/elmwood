const appointmentsmodel = require("../models/appointmentsmodel");
const clientmodel = require("../models/clientmodel");
const therapistmodel = require("../models/therapistmodel");

const pexels = require("pexels");

const helpers = require("../utils/helpers");

class DashboardController {
	async buildDashboard(req, res) {
		if (!req.session.allTherapits || req.session.allTherapists.length <= 0) {
			const allTherapistsForSession =
				await therapistmodel.allTherapistsForSession();

			let therapists4session = [];
			for (let i = 0; i < allTherapistsForSession.length; i++) {
				therapists4session.push({
					t_ID: allTherapistsForSession[i].t_ID,
					t_first_name: helpers.dataDecrypt(
						allTherapistsForSession[i].t_first_name
					),
					t_surname: helpers.dataDecrypt(
						allTherapistsForSession[i].t_surname
					),
					t_phone: helpers.dataDecrypt(allTherapistsForSession[i].t_phone),
					t_email: helpers.dataDecrypt(allTherapistsForSession[i].t_email),
				});
			}

			req.session.allTherapists = therapists4session;
		}

		if (!req.session.allClients || req.session.allClients.length <= 0) {
			const allClientsForSession = await clientmodel.allClientsForSession();

			let clients4sesion = [];
			for (let i = 0; i < allClientsForSession.length; i++) {
				clients4sesion.push({
					c_ID: allClientsForSession[i].c_ID,
					c_first_name: helpers.dataDecrypt(
						allClientsForSession[i].c_first_name
					),
					c_surname: helpers.dataDecrypt(
						allClientsForSession[i].c_surname
					),
					c_phone: helpers.dataDecrypt(allClientsForSession[i].c_phone),
					c_email: helpers.dataDecrypt(allClientsForSession[i].c_email),
				});
			}

			req.session.allClients = clients4sesion;
		}

		// console.log("SESSION:", req.session);

		let clientsPerTherapist = [];
		const clientsPerTherapistFromModel =
			await clientmodel.getClientsPerTherapist();
		for (let i = 0; i < clientsPerTherapistFromModel.length; i++) {
			let sessionTherapist = helpers.getPersonName(
				req.session.allTherapists,
				"therapist",
				clientsPerTherapistFromModel[i].t_ID
			);

			let therapist = {
				t_ID: clientsPerTherapistFromModel[i].t_ID,
				t_first_name: sessionTherapist.t_first_name,
				t_surname: sessionTherapist.t_surname,
				NumberOfClients: clientsPerTherapistFromModel[i].NumberOfClients,
			};
			clientsPerTherapist.push(therapist);
		}
		//console.log("cpt", clientsPerTherapist);

		const appointments = await appointmentsmodel.getTodaysAppointments();
		// console.log("appts", appointments);
		const waitinglistsize =
			await clientmodel.getNumberOfClientsOnWaitingList();

		let outstandingFeesPerTherapist = [];
		const outstandingFeesPerTherapistFromModel =
			await therapistmodel.getOutstandingFeesPerTherapist();

		for (let i = 0; i < outstandingFeesPerTherapistFromModel.length; i++) {
			let sessionTherapist = helpers.getPersonName(
				req.session.allTherapists,
				"therapist",
				outstandingFeesPerTherapistFromModel[i].a_therapist
			);

			let therapist = {
				a_therapist: outstandingFeesPerTherapistFromModel[i].a_therapist,
				t_first_name: sessionTherapist.t_first_name,
				t_surname: sessionTherapist.t_surname,
				unpaid: outstandingFeesPerTherapistFromModel[i].unpaid,
			};
			outstandingFeesPerTherapist.push(therapist);
		}

		let outstandingFeesPerClient = [];

		const outstandingFeesPerClientFromModel =
			await clientmodel.getOutstandingFeesPerClient();

		for (let i = 0; i < outstandingFeesPerClientFromModel.length; i++) {
			let sessionClient = helpers.getPersonName(
				req.session.allClients,
				"client",
				outstandingFeesPerClientFromModel[i].a_client
			);

			let client = {
				a_client: outstandingFeesPerClientFromModel[i].a_client,
				c_first_name: sessionClient.c_first_name,
				c_surname: sessionClient.c_surname,
				unpaid: outstandingFeesPerClientFromModel[i].unpaid,
			};
			outstandingFeesPerClient.push(client);
		}

		let lowCostClients = [];
		let lowCostTraineeClients = await clientmodel.getLowCostTraineeClients();
		let lowCostPrecredClients = await clientmodel.getLowCostPrecredClients();

		for (let i = 0; i < lowCostTraineeClients.length; i++) {
			lowCostClients.push(lowCostTraineeClients[i]);
		}

		for (let i = 0; i < lowCostPrecredClients.length; i++) {
			lowCostClients.push(lowCostPrecredClients[i]);
		}

		let lcClients = [];
		for (let i = 0; i < lowCostClients.length; i++) {
			let sessionClient = helpers.getPersonName(
				req.session.allClients,
				"client",
				lowCostClients[i].c_ID
			);

			let client = {
				c_ID: lowCostClients[i].c_ID,
				c_first_name: sessionClient.c_first_name,
				c_surname: sessionClient.c_surname,
			};
			lcClients.push(client);
		}

		console.log("lowCostClients", lowCostClients);

		let expiringInsurancesPerTherapist = [];
		const expiringInsurances = await therapistmodel.getExpiringInsurances();

		for (let i = 0; i < expiringInsurances.length; i++) {
			let sessionTherapist = helpers.getPersonName(
				req.session.allTherapists,
				"therapist",
				expiringInsurances[i].t_ID
			);

			let therapist = {
				t_ID: expiringInsurances[i].t_ID,
				t_first_name: sessionTherapist.t_first_name,
				t_surname: sessionTherapist.t_surname,
				t_insurance_expiry_date: helpers.formatDate(
					expiringInsurances[i].t_insurance_expiry_date
				),
			};
			expiringInsurancesPerTherapist.push(therapist);
		}

		// console.log(">>> SESSION", req.session);

		let photos = [
			"assets/img/photos/photo_1.jpg",
			"assets/img/photos/photo_2.jpg",
			"assets/img/photos/photo_3.jpg",
			"assets/img/photos/photo_4.jpg",
			"assets/img/photos/photo_5.jpg",
			"assets/img/photos/photo_6.jpg",
			"assets/img/photos/photo_7.jpg",
			"assets/img/photos/photo_8.jpg",
			"assets/img/photos/photo_9.jpg",
			"assets/img/photos/photo_10.jpg",
		];

		let photo = photos[Math.floor(Math.random() * photos.length)];

		return res.render("templates/template.ejs", {
			name: "Dashboard",
			page: "dashboard.ejs",
			title: "Dashboard",
			sidebar: true,
			appointments: appointments,
			waitinglistsize: waitinglistsize,
			clientsPerTherapist: clientsPerTherapist,
			outstandingFeesPerTherapist: outstandingFeesPerTherapist,
			outstandingFeesPerClient: outstandingFeesPerClient,
			expiringInsurances: expiringInsurancesPerTherapist,
			photo: photo,
			lowCostClients: lcClients,
		});
	}

	async testSodium(req, res) {
		console.log("inTestSodium");
		try {
			let encryptTherapist = await therapistmodel.encryptTherapist();
			console.log(">>>>", encryptTherapist);

			return res.render("templates/template.ejs", {
				name: "ENCRYPT THERAPIST",
				page: "tptmp.ejs",
				title: "ENCRYPT THERAPIST",
				sidebar: true,
			});
		} catch (error) {
			console.log("encrypt therapist error", error);
		}
	}

	async testSodiumD(req, res) {
		console.log("in Test Sodium D");
		try {
			let encryptTherapist = await therapistmodel.decryptTherapist();
			console.log("++++", encryptTherapist);

			return res.render("templates/template.ejs", {
				name: "DECRYPT THERAPIST",
				page: "tptmp.ejs",
				title: "DECRYPT THERAPIST",
				therapists: encryptTherapist,
				sidebar: true,
			});
		} catch (error) {
			console.log("decrypt therapist error", error);
		}
	}
}
module.exports = new DashboardController();
