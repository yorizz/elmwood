const appointmentsmodel = require("../models/appointmentsmodel");
const clientmodel = require("../models/clientmodel");
const therapistmodel = require("../models/therapistmodel");

const pexels = require("pexels");

const helpers = require("../utils/helpers");

class DashboardController {
	async buildDashboard(req, res) {
		if (!req.session.allTherapits || req.session.allTherapists.length <= 0) {
			console.log("getting Therapists for session");
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
					t_colour: allTherapistsForSession[i].t_colour,
				});
			}

			req.session.allTherapists = therapists4session;
		}

		if (!req.session.allClients || req.session.allClients.length <= 0) {
			console.log("getting clients for session");
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

		const appointments = await appointmentsmodel.getTodaysAppointments();

		let dashboardAppointments = [];

		for (let i = 0; i < appointments.length; i++) {
			let therapist = req.session.allTherapists.find(
				({ t_ID }) => t_ID === appointments[i].a_therapist
			);

			let client = req.session.allClients.find(
				({ c_ID }) => c_ID === appointments[i].a_client
			);

			let a = {
				a_ID: appointments[i].a_ID,
				a_date: appointments[i].a_date,
				a_start_time: appointments[i].a_start_time,
				a_end_time: appointments[i].a_end_time,
				c_first_name: client.c_first_name,
				c_surname: client.c_surname,
				a_therapist: appointments[i].a_therapist,
				t_first_name: therapist.t_first_name,
				t_surname: therapist.t_surname,
				t_colour: therapist.t_colour,
			};

			dashboardAppointments.push(a);
		}

		console.log("dashboardAppointments", dashboardAppointments);

		const waitinglistsize =
			await clientmodel.getNumberOfClientsOnWaitingList();

		const outstandingFeesPerTherapistFromModel =
			await therapistmodel.getTotalOutstandingTherapistFees();
		let outstandingFeesPerTherapist = outstandingFeesPerTherapistFromModel[0];

		const outstandingFeesPerClientFromModel =
			await clientmodel.getTotalOutstandingClientFees();
		let outstandingFeesPerClient = outstandingFeesPerClientFromModel[0];

		let lowCostClients = [];
		let lowCostTraineeClients = await clientmodel.getLowCostTraineeClients(5);
		let lowCostPrecredClients = await clientmodel.getLowCostPrecredClients(5);

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

		let totalNumberOfLowCostClients =
			await clientmodel.getNumberOfLowCostClients();

		console.log("totalNumberOfLowCostClients", totalNumberOfLowCostClients);

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
			appointments: dashboardAppointments,
			waitinglistsize: waitinglistsize,
			totalNumberOfLowCostClients: totalNumberOfLowCostClients,
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
