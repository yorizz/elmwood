const appointmentsmodel = require("../models/appointmentsmodel");
const clientmodel = require("../models/clientmodel");

class DashboardController {
	async buildDashboard(req, res) {
		console.log("SESSION:", req.session);
		const clientsPerTherapist = await clientmodel.getClientsPerTherapist();
		const appointments = await appointmentsmodel.getTodaysAppointments();
		const waitinglistsize =
			await clientmodel.getNumberOfClientsOnWaitingList();

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
		});
	}
}
module.exports = new DashboardController();
