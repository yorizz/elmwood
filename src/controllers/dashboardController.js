const appointmentsmodel = require("../models/appointmentsmodel");
const clientmodel = require("../models/clientmodel");

class DashboardController {
	async buildDashboard(req, res) {
		console.log("SESSION:", req.session);
		const appointments = await appointmentsmodel.getTodaysAppointments();
		const waitinglistsize =
			await clientmodel.getNumberOfClientsOnWaitingList();

		return res.render("templates/template.ejs", {
			name: "Dashboard",
			page: "dashboard.ejs",
			title: "Dashboard",
			sidebar: true,
			appointments: appointments,
			waitinglistsize: waitinglistsize,
		});
	}
}
module.exports = new DashboardController();
