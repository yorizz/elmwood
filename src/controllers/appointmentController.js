const appointmentsmodel = require("../models/appointmentsmodel");
const therapistmodel = require("../models/therapistmodel");
const clientmodel = require("../models/clientmodel");

const { check, validationResult } = require("express-validator");

const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const helpers = require("../utils/helpers");

class AppointmentController {
	async allAppointments(req, res) {
		try {
			let allAppointments = [];
			let appointments = await appointmentsmodel.getAllAppointments();
			for (let appointment of appointments) {
				let appointmentDetails = {
					a_ID: appointment.a_ID,
					a_date: appointment.a_date,
					a_start_time: appointment.a_start_time,
					a_end_time: appointment.a_end_time,
					c_first_name: helpers.dataDecrypt(appointment.c_first_name),
					c_surname: helpers.dataDecrypt(appointment.c_surname),
					t_first_name: helpers.dataDecrypt(appointment.t_first_name),
					t_surname: helpers.dataDecrypt(appointment.t_surname),
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
			for (let appointment of appointments) {
				let appointmentDetails = {
					a_ID: appointment.a_ID,
					a_date: appointment.a_date,
					a_start_time: appointment.a_start_time,
					a_end_time: appointment.a_end_time,
					c_first_name: helpers.dataDecrypt(appointment.c_first_name),
					c_surname: helpers.dataDecrypt(appointment.c_surname),
					t_first_name: helpers.dataDecrypt(appointment.t_first_name),
					t_surname: helpers.dataDecrypt(appointment.t_surname),
					t_colour: appointment.t_colour,
				};
				allAppointments.push(appointmentDetails);
			}
			return res.send(allAppointments);
		} catch (error) {
			console.log("allAppointments error", error);
		}
	}

	async appointmentsList(req, res) {
		let allAppointments = [];

		try {
			let appointments =
				await appointmentsmodel.getAllAppointmentsAfterToday();

			return res.render("templates/template.ejs", {
				name: "Appointments",
				page: "allappointmentslist.ejs",
				title: "Appointments",
				calendar: false,
				sidebar: true,
				appointments: appointments,
			});
		} catch (error) {
			console.log("unable to retrieve appointments", error);
		}
	}

	async appointmentsListPast(req, res) {
		let allAppointments = [];

		try {
			let appointments =
				await appointmentsmodel.getAllAppointmentsBeforeToday();

			return res.render("templates/template.ejs", {
				name: "Appointments",
				page: "allappointmentslist.ejs",
				title: "Appointments",
				calendar: false,
				sidebar: true,
				appointments: appointments,
				isPast: true,
			});
		} catch (error) {
			console.log("unable to retrieve appointments", error);
		}
	}

	async addAppointmentForDate(req, res) {
		let therapists = await therapistmodel.getAllTherapists();
		let clients = await clientmodel.getAllClients();

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
			try {
				const appointment = {
					a_ID: Date.now(),
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
}
module.exports = new AppointmentController();
