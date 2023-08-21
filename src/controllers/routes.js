const path = require("path");
const express = require("express");
const router = express.Router();
const { checkInput, validationResult } = require("express-validator");
const loginmodel = require("../models/loginmodel");
const clientmodel = require("../models/clientmodel");
const therapistmodel = require("../models/therapistmodel");
const appointmentsmodel = require("../models/appointmentsmodel");
const checkAppointmentInput = require("../utils/appointmentvalidation");

async function authenticateUser(req) {
	try {
		let authenticatedUser = await loginmodel.verifyUser(req);
		return authenticatedUser;
	} catch (error) {
		console.log("authenticateUser error", error);
	}
}

function isUserAuthenticated(req, res, next) {
	// console.log("on session", req.session.user);
	if (req.session.user) {
		next();
	} else {
		res.redirect("/login");
	}
}

router.get("/", isUserAuthenticated, (req, res) => {
	res.redirect("/dashboard");
});

router.get("/login", async (req, res) => {
	console.log("Flash AHA", req.session.sessionFlash);
	if (req.session.sessionFlash != null) {
		res.locals.sessionFlash = req.session.sessionFlash;
		delete req.session.sessionFlash;
	}

	res.render("templates/template.ejs", {
		message: res.locals.sessionFlash,
		name: "Login",
		page: "login.ejs",
		title: "Login",
		sidebar: false,
	});
});

router.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/login");
});

router.get("/dashboard", isUserAuthenticated, (req, res) => {
	res.render("templates/template.ejs", {
		name: "Dashboard",
		page: "dashboard.ejs",
		title: "Dashboard",
		sidebar: true,
	});
});

router.get("/calendar", isUserAuthenticated, (req, res) => {
	res.render("templates/template.ejs", {
		name: req.session.user.u_name ? req.session.user.u_name : "Stranger",
		page: "calendar.ejs",
		title: "Calendar",
		calendar: true,
		sidebar: true,
	});
});

router.get("/allappointments", isUserAuthenticated, async (req, res) => {
	res.send(await appointmentsmodel.getAllAppointments());
});

router.get("/addappointment/:date", isUserAuthenticated, async (req, res) => {
	let therapists = await therapistmodel.getAllTherapists();
	let clients = await clientmodel.getAllClients();

	res.render("pages/addappointment.ejs", {
		date: req.params.date,
		clients: clients,
		therapists: therapists,
	});
});

//TODO add validation
router.post(
	"/addappointment",
	checkAppointmentInput,
	isUserAuthenticated,
	async (req, res) => {
		console.log("Form field for adding appointment", req.body);
		const result = validationResult(req);
		// console.log(result);
		if (result.isEmpty()) {
			//no errors, try to store it in the dbase
			try {
				const appointment = {
					a_ID: `'${Date.now()}'`,
					a_client: req.body.clients,
					a_date: req.body.date,
					a_start_time: req.body.start_time + ":00",
					a_end_time: req.body.end_time + ":00",
					a_is_paid: 0,
					a_therapist: req.body.therapists,
				};

				const insertId = await appointmentsmodel.addAppointment(
					appointment
				);

				res.send(req.body);
			} catch (error) {
				console.error(error);
			}
			// return res.send(`Hello, ${req.query.person}!`);
		} else {
			req.session.sessionFlash = {
				type: "error",
				message: "Your details are not correct.",
				errors: result.array(),
			};
		}
	}
);

router.get("/allclients", isUserAuthenticated, async (req, res) => {
	try {
		let allclients = await clientmodel.getAllClients();

		// console.log("allclients", allclients);

		res.render("templates/template.ejs", {
			name: "All Clients",
			page: "allclients.ejs",
			title: "All Clients",
			sidebar: true,
			clients: allclients,
		});
	} catch (error) {
		console.log("authenticateUser error", error);
	}
});

router.get("/alltherapists", isUserAuthenticated, async (req, res) => {
	try {
		let allTherapists = await therapistmodel.getAllTherapists();

		console.log(path.join(__dirname, "../public"));

		res.render("templates/template.ejs", {
			name: "All Therapists",
			page: "alltherapists.ejs",
			title: "All Therapists",
			sidebar: true,
			therapists: allTherapists,
		});
	} catch (error) {
		console.log("authenticateUser error", error);
	}
});

router.get("/therapist/:id", isUserAuthenticated, async (req, res) => {
	try {
		let therapist = {};
		console.log(path.join(__dirname, "../public"));

		if (!isNaN(parseInt(req.params.id))) {
			console.log("Found values!");
			therapist = await therapistmodel.getTherapist(req.params.id);

			console.log("therapist", therapist.therapist);
			console.log("qualifications", therapist.therapist_qualifications);
		}

		res.render("templates/template.ejs", {
			name: "Therapist",
			page: "therapist.ejs",
			title:
				therapist.therapist[0].t_first_name +
				" " +
				therapist.therapist[0].t_surname,
			sidebar: true,
			therapist: therapist.therapist,
			qualifications: therapist.therapist_qualifications,
			pathCorrection: "../",
		});
	} catch (error) {
		console.log("unknown therapist error", error);
	}
});

/**
 * TODO: Set timeout for 3 missed logins
 */
router.post("/login", async (req, res) => {
	let authenticatedUser = await authenticateUser(req);
	console.log("authenticatedUser", authenticatedUser);
	req.session.user = authenticatedUser;
	let redirectPath = "/login";
	if (authenticatedUser) {
		redirectPath = "/";
	} else {
		req.session.sessionFlash = {
			type: "error",
			message: "Your details are not correct.",
		};
	}
	res.redirect(redirectPath);
});

module.exports = router;
