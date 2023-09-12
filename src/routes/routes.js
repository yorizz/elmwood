const path = require("path");
const fs = require("fs");
const express = require("express");

const router = express.Router();

const loginController = require("../controllers/loginController");
const dashboardController = require("../controllers/dashboardController");
const calendarController = require("../controllers/calendarController");
const appointmentController = require("../controllers/appointmentController");
const clientController = require("../controllers/clientController");
const therapistController = require("../controllers/therapistController");

const {
	checkAppointmentInput,
	checkCancelAppointmentInput,
} = require("../utils/validation/appointmentvalidation");
const checkAddTherapistValues = require("../utils/validation/therapistvalidation");
const checkNewEnquiryValidation = require("../utils/validation/clientvalidation");

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

function isUserAuthenticated(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect("/login");
	}
}

router.get("/", isUserAuthenticated, (req, res) => {
	res.redirect("/dashboard");
});

router
	.route("/login")
	.get(loginController.loginUser)
	.post(loginController.checkUser);

router.get("/logout");

router.get(
	"/dashboard",
	isUserAuthenticated,
	dashboardController.buildDashboard
);

router.get("/calendar", isUserAuthenticated, calendarController.buildCalendar);

router.get(
	"/allappointments",
	isUserAuthenticated,
	appointmentController.allAppointments
);

router.get(
	"/allappointmentslist",
	isUserAuthenticated,
	appointmentController.appointmentsList
);

router.get(
	"/addappointment/:date",
	isUserAuthenticated,
	appointmentController.addAppointmentForDate
);

router.post(
	"/cancelappointment/:id",
	isUserAuthenticated,
	checkCancelAppointmentInput,
	appointmentController.cancelAppointment
);

//TODO add validation
router.post(
	"/addappointment",
	checkAppointmentInput,
	isUserAuthenticated,
	appointmentController.addAppointment
);

router.get("/allclients", isUserAuthenticated, clientController.getAllClients);

router.get("/waitinglist", clientController.getWaitingList);

router.get(
	"/client/:id",
	isUserAuthenticated,
	clientController.getSingleClient
);

router
	.route("/newenquiry")
	.get(isUserAuthenticated, clientController.getNewEnquiry)
	.post(
		isUserAuthenticated,
		urlencodedParser,
		checkNewEnquiryValidation,
		clientController.postNewEnquiry
	);

router.post(
	"/gettherapistforclient",
	isUserAuthenticated,
	clientController.getTherapistForClient
);

router.get(
	"/alltherapists",
	isUserAuthenticated,
	therapistController.getAllTherapists
);

router.get(
	"/therapist/:id",
	isUserAuthenticated,
	therapistController.getSingleTherapist
);

router
	.route("/newtherapist")
	.get(isUserAuthenticated, therapistController.getNewTherapist)
	.post(
		isUserAuthenticated,
		checkAddTherapistValues,
		therapistController.postNewTherapist
	);

router.get("/file/:type/:owner/:filename", (req, res) => {
	console.log("baseurl", req.baseUrl);

	res.download(
		__dirname +
			"../../../public/uploads/" +
			req.params.type +
			"/" +
			req.params.owner +
			"/" +
			req.params.filename,
		function (err) {
			if (err) {
				console.log(err);
			}
		}
	);
});

module.exports = router;
