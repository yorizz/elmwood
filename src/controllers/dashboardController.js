const appointmentsmodel = require("../models/appointmentsmodel");
const clientmodel = require("../models/clientmodel");
const therapistmodel = require("../models/therapistmodel");

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

		// console.log(
		// 	"getOutstandingFeesPerTherapist",
		// 	outstandingFeesPerTherapist
		// );

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
		// console.log("getOutstandingFeesPerClient", outstandingFeesPerClient);

		// console.log("dashboard", [
		// 	clientsPerTherapist,
		// 	appointments,
		// 	waitinglistsize,
		// ]);

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
		});
	}
}
module.exports = new DashboardController();
