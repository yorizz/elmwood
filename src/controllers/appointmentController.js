const appointmentsmodel = require("../models/appointmentsmodel");
const therapistmodel = require("../models/therapistmodel");
const clientmodel = require("../models/clientmodel");
const dayjs = require("dayjs");

const { check, validationResult, body } = require("express-validator");

const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const helpers = require("../utils/helpers");

class AppointmentController {
	async allAppointments(req, res) {
		try {
			let allAppointments = [];
			let appointments = await appointmentsmodel.getAllAppointments();
			for (let appointment of appointments) {
				let clientDetails = helpers.getPersonName(
					req.session.allClients,
					"client",
					appointment.c_ID
				);
				let therapistDetails = helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					appointment.t_ID
				);

				let appointmentDetails = {
					a_ID: appointment.a_ID,
					a_date: appointment.a_date,
					a_start_time: appointment.a_start_time,
					a_end_time: appointment.a_end_time,
					c_first_name: clientDetails.c_first_name,
					c_surname: clientDetails.c_surname,
					t_first_name: therapistDetails.t_first_name,
					t_surname: therapistDetails.t_surname,
					t_colour: appointment.t_colour,
				};
				allAppointments.push(appointmentDetails);
			}
			return res.send(allAppointments);
		} catch (error) {
			console.log("allAppointments error", error);
		}
	}

	async allAppointmentsNotCancelled(req, res) {
		try {
			let allAppointments = [];
			let selectedMonth = req.params.month ? req.params.month : null;
			let appointments = await appointmentsmodel.getAllAppointmentsForMonth(
				selectedMonth
			);

			console.log("appointments", appointments);
			if (appointments != undefined) {
				for (let appointment of appointments) {
					let clientDetails = helpers.getPersonName(
						req.session.allClients,
						"client",
						appointment.c_ID
					);
					let therapistDetails = helpers.getPersonName(
						req.session.allTherapists,
						"therapist",
						appointment.t_ID
					);

					let appointmentDetails = {
						a_ID: appointment.a_ID,
						a_date: appointment.a_date,
						a_start_time: appointment.a_start_time,
						a_end_time: appointment.a_end_time,
						c_first_name: clientDetails.c_first_name,
						c_surname: clientDetails.c_surname,
						t_first_name: therapistDetails.t_first_name,
						t_surname: therapistDetails.t_surname,
						t_colour: appointment.t_colour,
						a_room: appointment.a_room,
					};
					// console.log("appointmentDetails", appointmentDetails);
					allAppointments.push(appointmentDetails);
				}
				return res.send(allAppointments);
			}
		} catch (error) {
			console.log("allAppointments error", error);
		}
	}

	async appointmentsList(req, res) {
		let allAppointments = [];

		try {
			let appointments = await appointmentsmodel.getAllAppointments();
			console.log("appointments", appointments.length);

			console.log("session clients", req.session.allClients.length);

			for (let i = 0; i < appointments.length; i++) {
				let client = helpers.getPersonName(
					req.session.allClients,
					"client",
					appointments[i].a_client
				);
				let therapist = helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					appointments[i].a_therapist
				);
				const appointment = {
					a_ID: appointments[i].a_ID,
					a_client: appointments[i].a_client,
					a_therapist: appointments[i].a_therapist,
					a_date: appointments[i].a_date,
					a_start_time: appointments[i].a_start_time,
					a_end_time: appointments[i].a_end_time,
					a_client_fee: appointments[i].a_client_fee,
					a_therapist_fee: appointments[i].a_therapist_fee,
					a_is_paid: appointments[i].a_is_paid,
					a_is_cancelled: appointments[i].a_is_cancelled,
					a_needs_payment: appointments[i].a_needs_payment,
					a_cancellation_reason: appointments[i].a_cancellation_reason,
					a_cancellation_date: appointments[i].a_cancellation_date,
					c_ID: appointments[i].c_ID,
					c_first_name: client.c_first_name,
					c_surname: client.c_surname,
					c_phone: appointments[i].c_phone,
					c_email: appointments[i].c_email,
					c_therapist: appointments[i].c_therapist,
					c_assessed_by: appointments[i].c_assessed_by,
					c_assessment_date: appointments[i].c_assessment_date,
					c_enquiry_date: appointments[i].c_enquiry_date,
					c_referred_by: appointments[i].c_referred_by,
					c_research_participation:
						appointments[i].c_research_participation,
					c_low_cost_employment: appointments[i].c_low_cost_employment,
					c_low_cost_suitable: appointments[i].c_low_cost_suitable,
					c_details_sent_to_claire:
						appointments[i].c_details_sent_to_claire,
					c_is_active: appointments[i].c_is_active,
					t_ID: appointments[i].t_ID,
					t_first_name: therapist.t_first_name,
					t_surname: therapist.t_surname,
					t_colour: appointments[i].t_colour,
					t_phone: appointments[i].t_phone,
					t_email: appointments[i].t_email,
					t_fq_fee: appointments[i].t_fq_fee,
					t_fee: appointments[i].t_fee,
					t_is_active: appointments[i].t_is_active,
				};
				allAppointments.push(appointment);
			}

			// console.log("allAppointments", allAppointments);
			return res.render("templates/template.ejs", {
				name: "Appointments",
				page: "allappointmentslist.ejs",
				title: "Appointments",
				calendar: false,
				sidebar: true,
				appointments: allAppointments,
			});
		} catch (error) {
			console.log("unable to retrieve appointments", error);
		}
	}

	async addAppointmentForDate(req, res) {
		let therapists =
			req.session.allTherapists >= 1
				? req.session.allTherapists
				: await therapistmodel.getAllActiveTherapists();

		let clients =
			req.session.allClients >= 1
				? req.session.allClients
				: await clientmodel.getAllActiveClients();

		return res.render("pages/addappointment.ejs", {
			date: req.params.date,
			clients: clients,
			therapists: therapists,
		});
	}

	async addAppointment(req, res) {
		console.log("Form field for adding appointment", req.body);
		const errors = validationResult(req);

		if (errors.isEmpty()) {
			//no errors, try to store it in the dbase
			let currentDate = req.body.date;
			console.log("currentDate 1", currentDate);
			try {
				const appointment = {
					a_ID: Date.now(),
					a_client: req.body.clients,
					a_date: currentDate,
					a_start_time: req.body.start_time + ":00",
					a_end_time: req.body.end_time + ":00",
					a_room: req.body.room,
					a_is_paid: 0,
					a_client_fee: req.body.client_fee,
					a_therapist_fee: req.body.therapist_fee,
					a_therapist: req.body.therapists,
					a_is_referral: req.body.isreferral == "on" ? 1 : 0,
					a_needs_payment: req.body.needspayment == "on" ? 1 : 0,
				};
				let insertId = await appointmentsmodel.addAppointment(appointment);

				console.log("inserted appointment with ID", insertId);

				if (parseInt(req.body.repeat) >= 1) {
					// create a new date, based on the previous one.
					let repeatAppointments = [];

					for (let i = 0; i < parseInt(req.body.repeat); i++) {
						let newID = Date.now() + i;

						let date = dayjs(currentDate).add(7, "d");
						currentDate = date.format("YYYY-MM-DD");

						console.log(currentDate);

						// currentDate = new Date(
						// 	new Date().setDate(new Date(currentDate).getDate() + 7)
						// );

						console.log(`currentDate ${i}`, currentDate);

						repeatAppointments.push({
							a_ID: newID,
							a_client: req.body.clients,
							a_date: currentDate,
							a_start_time: req.body.start_time + ":00",
							a_end_time: req.body.end_time + ":00",
							a_room: req.body.room,
							a_client_fee: req.body.client_fee,
							a_therapist_fee: req.body.therapist_fee,
							a_is_paid: 0,
							a_therapist: req.body.therapists,
						});
					}

					console.log("repeatAppointments", repeatAppointments);
					await appointmentsmodel.addMultipleAppointments(
						repeatAppointments
					);
				}

				return res.send(req.body);
			} catch (error) {
				console.error(error);
			}
		} else {
			req.session.sessionFlash = {
				type: "error",
				message: "Your details are not correct.",
				errors: errors.array(),
			};
		}
	}

	async cancelAppointment(req, res) {
		console.log("id", req.params.id, "form vals", req.body);
		const currentTime =
			helpers.formatYYYYMMDDDate(new Date(Date.now()), "-") +
			" " +
			helpers.formatTime(new Date(Date.now()));
		try {
			const errors = validationResult(req);
			console.log("needs payment:", req.body.canceled_needs_payment);
			if (errors.isEmpty()) {
				let data = {
					a_is_cancelled: 1,
					a_cancellation_reason: helpers.dataEncrypt(
						req.body.cancellation_reason
					),
					a_needs_payment: req.body.canceled_needs_payment == 1 ? 1 : 0,
					a_cancellation_date: currentTime,
				};

				console.log("");
				const updateAppointment = await appointmentsmodel.updateAppointment(
					req.params.id.toString(),
					data
				);

				console.log(
					"updated appointment ",
					req.params.id,
					"with:",
					req.body.cancellation_reason
				);
			}
		} catch (error) {}

		return res.json({ msg: "cancelled" });
	}

	async uncancelAppointment(req, res) {
		try {
			const uncanceledAppointment =
				await appointmentsmodel.uncancelAppointment(req.params.id);
		} catch (error) {
			console.log("error", error);
		}
		return res.json({ msg: "uncancelled" });
	}

	async appointmentPaid(req, res) {
		try {
			const paidAppointment = await appointmentsmodel.payAppointment(
				req.params.id
			);
		} catch (error) {
			console.log("error", error);
		}
		return res.json({ msg: `appointment ${req.params.id} paid` });
	}

	async appointmentReferralPaid(req, res) {
		try {
			const paidAppointment = await appointmentsmodel.payAppointmentReferral(
				req.params.id
			);
		} catch (error) {
			console.log("error", error);
		}
		return res.json({ msg: `appointment referral ${req.params.id} paid` });
	}
}
module.exports = new AppointmentController();

function formatToSQLDate(appointmentDate) {
	// console.log("appointmentDate", appointmentDate);
	let year = appointmentDate.getFullYear();
	let month = ("0" + (appointmentDate.getMonth() + 1)).slice(-2);
	let day = ("0" + appointmentDate.getDate()).slice(-2);

	return `${year}-${month}-${day}`;
}
