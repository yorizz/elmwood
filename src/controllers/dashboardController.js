const appointmentsmodel = require("../models/appointmentsmodel");
const clientmodel = require("../models/clientmodel");
const therapistmodel = require("../models/therapistmodel");

class DashboardController {
	async buildDashboard(req, res) {
		console.log("SESSION:", req.session);
		const clientsPerTherapist = await clientmodel.getClientsPerTherapist();
		const appointments = await appointmentsmodel.getTodaysAppointments();
		const waitinglistsize =
			await clientmodel.getNumberOfClientsOnWaitingList();

		const outstandingFeesPerTherapist =
			await therapistmodel.getOutstandingFeesPerTherapist();

		const outstandingFeesPerClient =
			await clientmodel.getOutstandingFeesPerClient();

		console.log("dashboard", [
			clientsPerTherapist,
			appointments,
			waitinglistsize,
		]);

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
