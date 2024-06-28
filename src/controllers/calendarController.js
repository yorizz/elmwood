class CalendarController {
	buildCalendar(req, res) {
		return res.render("templates/template.ejs", {
			name: req.session.user.u_name ? req.session.user.u_name : "Stranger",
			page: "calendar.ejs",
			title: "Calendar",
			calendar: true,
			sidebar: true,
		});
	}
}

module.exports = new CalendarController();
