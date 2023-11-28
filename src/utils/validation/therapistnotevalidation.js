const { check } = require("express-validator");

let checkClientNoteValidation = [
	check("nepvraag")
		.exists()
		.isString()
		.trim()
		.escape()
		.isLength({ max: 0 })
		.withMessage(
			"I think you are a bot. If this is not the case, please contact your admin"
		),
	check("therapist_note").exists().notEmpty().trim().escape(),
];

module.exports = checkClientNoteValidation;
