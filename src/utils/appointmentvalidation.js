const { body } = require("express-validator");

const checkAppointmentInput = [
	body("clients")
		.isAlphanumeric()
		.withMessage("The client value cannot be a name")
		.trim()
		.escape(),
	body("date").isDate().withMessage("Please provide a date").trim().escape(),
	body("end_time")
		.isTime({ hourFormat: "hour24", mode: "default" })
		.withMessage("Please provide a start time")
		.trim()
		.escape(),
	body("start_time")
		.isTime({ hourFormat: "hour24", mode: "default" })
		.withMessage("Please provide an end time")
		.trim()
		.escape(),
	body("therapists")
		.isAlphanumeric()
		.withMessage("The therapist value cannot be a name")
		.trim()
		.escape(),
];

module.exports = checkAppointmentInput;
