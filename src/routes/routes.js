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
const checkClientNoteValidation = require("../utils/validation/clientnotevalidation");
const checkTherapistNoteValidation = require("../utils/validation/therapistnotevalidation");
const checkNewPasswordValidation = require("../utils/validation/loginvalidation");

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

function isUserAuthenticated(req, res, next) {
	if (req.session.user) {
		console.log("user:", req.session.user);
		next();
	} else {
		console.log("show the login page");
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

router.get("/logout", loginController.logout);

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
	"/allappointments/notcancelled",
	isUserAuthenticated,
	appointmentController.allAppointmentsNotCancelled
);

router.get(
	"/allappointments/notcancelled/:month",
	isUserAuthenticated,
	appointmentController.allAppointmentsNotCancelled
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

router.post(
	"/uncancelappointment/:id",
	isUserAuthenticated,
	appointmentController.uncancelAppointment
);

//TODO add validation
router.post(
	"/addappointment",
	checkAppointmentInput,
	isUserAuthenticated,
	appointmentController.addAppointment
);

router.post(
	"/appointment/paid/:id",
	isUserAuthenticated,
	appointmentController.appointmentPaid
);
router.post(
	"/appointment/referral-paid/:id",
	isUserAuthenticated,
	appointmentController.appointmentReferralPaid
);

/********************************************************************************************************
 *  CLIENTS
 ********************************************************************************************************/

router.get("/allclients", isUserAuthenticated, clientController.getAllClients);

router.get(
	"/waitinglist",
	isUserAuthenticated,
	clientController.getWaitingList
);

router.get(
	"/clients_contract",
	isUserAuthenticated,
	clientController.getContractClientsOnWaitingList
);
router.get(
	"/clients_low_cost_trainees",
	isUserAuthenticated,
	clientController.getLowCostTraineeClientsOnWaitingList
);
router.get(
	"/clients_low_cost_precreds",
	isUserAuthenticated,
	clientController.getLowCostPrecredClientsOnWaitingList
);
router.get(
	"/clients_deborah",
	isUserAuthenticated,
	clientController.getDeborahClientsOnWaitingList
);
router.get(
	"/clients_fiona",
	isUserAuthenticated,
	clientController.getFionaClientsOnWaitingList
);
router.get(
	"/clients_couples_families",
	isUserAuthenticated,
	clientController.getCouplesOrFamiliesClientsOnWaitingList
);
router.get(
	"/clients_under18s",
	isUserAuthenticated,
	clientController.getUnder18sClientsOnWaitingList
);

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

router.get(
	"/client/:id/edit",
	isUserAuthenticated,
	clientController.editClient
);

router
	.route("/updateclient/:id")
	.post(
		isUserAuthenticated,
		urlencodedParser,
		checkNewEnquiryValidation,
		clientController.updateClient
	);

router.get(
	"/client/deactivate/:id",
	isUserAuthenticated,
	clientController.deactivateClient
);

router.get(
	"/client/activate/:id",
	isUserAuthenticated,
	clientController.activateClient
);

router.get(
	"/client/activate/:id",
	isUserAuthenticated,
	clientController.getNoteModalContent
);

router
	.route("/client/note/:id")
	.post(
		isUserAuthenticated,
		urlencodedParser,
		checkClientNoteValidation,
		clientController.addNote
	);

router
	.route("/client/:id/addfile")
	.post(isUserAuthenticated, urlencodedParser, clientController.storeFile);

router.get(
	"/referrals",
	isUserAuthenticated,
	clientController.getRenterReferrals
);

/********************************************************************************************************
 *  THERAPISTS
 ********************************************************************************************************/

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

router.get(
	"/therapist/:id/edit",
	isUserAuthenticated,
	therapistController.editTherapist
);

router
	.route("/newtherapist")
	.get(isUserAuthenticated, therapistController.getNewTherapist)
	.post(
		isUserAuthenticated,
		checkAddTherapistValues,
		therapistController.postNewTherapist
	);

router.post(
	"/updatetherapist/:id",
	isUserAuthenticated,
	checkAddTherapistValues,
	therapistController.updateTherapist
);

router.get(
	"/clientspertherapist",
	isUserAuthenticated,
	therapistController.listClientsPerTherapist
);

router.get(
	"/therapist/deactivate/:id",
	isUserAuthenticated,
	therapistController.deactivateTherapist
);

router.get(
	"/therapist/activate/:id",
	isUserAuthenticated,
	therapistController.activateTherapist
);

router
	.route("/therapist/note/:id")
	.post(
		isUserAuthenticated,
		urlencodedParser,
		checkTherapistNoteValidation,
		therapistController.addTherapistNote
	);

router
	.route("/therapist/:id/addfile")
	.post(isUserAuthenticated, urlencodedParser, therapistController.storeFile);

router.get(
	"/profitpertherapist",
	isUserAuthenticated,
	therapistController.profitPerTherapist
);
router.get(
	"/profitpertherapist/:startDate/:endDate",
	isUserAuthenticated,
	therapistController.profitPerTherapist
);

router.get("/tmptp", isUserAuthenticated, dashboardController.testSodium);
router.get("/tmptp2", isUserAuthenticated, dashboardController.testSodiumD);

router.post(
	"/deleteavailability/:id",
	isUserAuthenticated,
	therapistController.deleteAvailability
);

router.get(
	"/availability/edit/:id",
	isUserAuthenticated,
	therapistController.getEditAvailability
);

router.get(
	"/addavailability/:id",
	isUserAuthenticated,
	therapistController.getAddAvailability
);

router.post(
	"/addavailability",
	isUserAuthenticated,
	therapistController.addAvailability
);

router.post(
	"/upateavailability",
	isUserAuthenticated,
	therapistController.updateAvailability
);
/**
 * end Therapists
 */

router.get(
	"/viewavailability/:id",
	isUserAuthenticated,
	therapistController.viewAvailability
);

router.get("/file/:type/:owner/:filename", (req, res) => {
	console.log("baseurl", req.baseUrl);

	res.download(
		__dirname +
			"../../.." +
			process.env.UPLOAD_PATH +
			"" +
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

router.get("/forgotpassword", loginController.forgotPassword);
router.post("/resetpassword", loginController.resetpassword);
router.get("/resetpassword/:token", loginController.checkToken);
router.post(
	"/updatepassword",
	checkNewPasswordValidation,
	loginController.updatePassword
);

/**
 * KEEP LAST for 404
 */

router.get("*", isUserAuthenticated, (req, res) => {
	res.status(404).render("templates/404.ejs", {
		name: "404 Page not found",
		title: "404 Page not found",
		message: req.session.error,
	});
});

module.exports = router;
