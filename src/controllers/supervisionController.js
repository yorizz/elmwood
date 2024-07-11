const therapistmodel = require("../models/therapistmodel");
const supervisionmodel = require("../models/supervisionmodel");
const { check, validationResult } = require("express-validator");
const bodyParser = require("body-parser");
const helpers = require("../utils/helpers");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { waitUntil, TimeoutError } = require("async-wait-until");

class SupervisionController {
	async addSupervisionSession(req, res) {
		const traineeCategories = [
			process.env.TRAINEE_PSYCHOTHERAPIST,
			process.env.PRE_CRED,
		];
		const supervisorTherapists =
			await therapistmodel.getSupervisionTherapists(
				"exclude",
				traineeCategories
			);

		console.log("supervisorTherapists", supervisorTherapists);
		const traineeTherapists = await therapistmodel.getSupervisionTherapists(
			"only",
			traineeCategories
		);

		console.log("traineeTherapists", traineeTherapists);

		let supervisors = [];
		let trainees = [];

		for (let i = 0; i < supervisorTherapists.length; i++) {
			let supervisor = helpers.getPersonName(
				req.session.allTherapists,
				"therapist",
				supervisorTherapists[i].t_ID
			);
			supervisors.push(supervisor);
		}
		for (let i = 0; i < traineeTherapists.length; i++) {
			let trainee = helpers.getPersonName(
				req.session.allTherapists,
				"therapist",
				traineeTherapists[i].t_ID
			);
			trainees.push(trainee);
		}

		console.log("trainees", trainees);

		return res.render("templates/template.ejs", {
			name: "New Supervision Session",
			page: "newsupervisionsession.ejs",
			title: "New Supervision Session",
			supervisors: supervisors.sort(sortByFirstName),
			trainees: trainees.sort(sortByFirstName),
			sidebar: true,
		});
	}

	async viewSingleSupervisionSession(req, res) {
		const supervisionSession = await supervisionmodel.getSupervisionSession(
			req.params.id
		);

		let supervisionSessionData = [];

		for (let i = 0; i < supervisionSession.length; i++) {
			let ssData = {
				sup_ID: supervisionSession[i].sup_ID,
				ssm_ID: supervisionSession[i].ssm_ID,
				ssm_sup_ID: supervisionSession[i].ssm_sup_ID,
				ssm_attendee: helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					supervisionSession[i].ssm_attendee
				),
				ssm_attendee_present: supervisionSession[i].ssm_attendee_present,
				sup_date: supervisionSession[i].sup_date,
				sup_supervisor: helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					supervisionSession[i].sup_supervisor
				),
			};

			supervisionSessionData.push(ssData);
		}

		console.log("supervisionSessionData", supervisionSessionData);

		return res.render("templates/template.ejs", {
			name: "Supervision Session",
			page: "singlesupervisionsession.ejs",
			title: "Supervision Session",

			pathCorrection: "../",
			sessionData: supervisionSessionData.sort(sortByFirstName),
			sidebar: true,
		});
	}

	async updateAttendance(req, res) {
		let attendeeID = req.params.id;
		let present = req.params.present;

		try {
			const updatedAttendance = await supervisionmodel.updateAttendance(
				attendeeID,
				present
			);
		} catch (error) {
			console.log("error", error);
		}
		return res.json({ msg: "updated attendance" });
	}

	async updateSupervisionSession(req, res) {}

	async viewSupervisionSessionsList(req, res) {
		let numberOfSupervisionSessionAttendees =
			await supervisionmodel.getNumberOfSupervisionSessionAttendees();

		console.log(
			"numberOfSupervisionSessionAttendees",
			numberOfSupervisionSessionAttendees
		);

		let supervisorSessions = [];

		for (let i = 0; i < numberOfSupervisionSessionAttendees.length; i++) {
			let supervisionSession = {
				sup_ID: numberOfSupervisionSessionAttendees[i].sup_ID,
				sup_date: helpers.formatDateTime(
					numberOfSupervisionSessionAttendees[i].sup_date
				),
				sup_supervisor: helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					numberOfSupervisionSessionAttendees[i].sup_supervisor
				),
				present: numberOfSupervisionSessionAttendees[i].present,
				total: numberOfSupervisionSessionAttendees[i].total,
			};

			supervisorSessions.push(supervisionSession);
		}

		console.log("supervisorSessions", supervisorSessions);

		return res.render("templates/template.ejs", {
			name: "All Supervision Sessions",
			page: "allsupervisionsessions.ejs",
			title: "All Supervision Sessions",
			supervisorSessions: supervisorSessions,
			sidebar: true,
		});
	}

	async storeNewSupervisionSession(req, res) {
		const errors = await validationResult(req);
		if (!errors.isEmpty()) {
			console.log("errors", errors.errors);
			console.log("req.body", req.body);
			try {
				const traineeCategories = [
					process.env.TRAINEE_PSYCHOTHERAPIST,
					process.env.PRE_CRED,
				];
				const supervisorTherapists =
					await therapistmodel.getSupervisionTherapists(
						"exclude",
						traineeCategories
					);

				console.log("supervisorTherapists", supervisorTherapists);
				const traineeTherapists =
					await therapistmodel.getSupervisionTherapists(
						"only",
						traineeCategories
					);

				console.log("traineeTherapists", traineeTherapists);

				let supervisors = [];
				let trainees = [];

				for (let i = 0; i < supervisorTherapists.length; i++) {
					let supervisor = helpers.getPersonName(
						req.session.allTherapists,
						"therapist",
						supervisorTherapists[i].t_ID
					);
					supervisors.push(supervisor);
				}
				for (let i = 0; i < traineeTherapists.length; i++) {
					let trainee = helpers.getPersonName(
						req.session.allTherapists,
						"therapist",
						traineeTherapists[i].t_ID
					);
					trainees.push(trainee);
				}

				console.log("trainees", trainees);

				return res.render("templates/template.ejs", {
					name: "New Supervision Session",
					page: "newsupervisionsession.ejs",
					title: "New Supervision Session",
					supervisors: supervisors.sort(sortByFirstName),
					trainees: trainees.sort(sortByFirstName),
					sidebar: true,
				});
			} catch (error) {
				console.log("Unable to add a new supervision session", error);
			}
		} else {
			console.log(">>form fields", req.body);

			const newId = Date.now();

			const data = {
				sup_ID: newId,
				sup_date: req.body.date + " " + req.body.time,
				sup_supervisor: req.body.supervisor,
			};

			const supervisionSessionID =
				await supervisionmodel.storeNewSupervisionSession(data);

			const trainees = {
				ssm_sup_ID: newId,
				trainees: req.body.trainees,
			};

			let supervisionSessionsStored =
				await supervisionmodel.storeTraineesForSupervisionSession(trainees);
			console.log("supervisionSessionStored", supervisionSessionsStored);

			res.redirect("/supervisionsessionlist");
		}
	}
}

module.exports = new SupervisionController();

function sortByFirstName(a, b) {
	if (a.t_first_name < b.t_first_name) {
		return -1;
	}
	if (a.t_first_name > b.t_first_name) {
		return 1;
	}
	return 0;
}
