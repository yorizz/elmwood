const { check } = require("express-validator");

let checkSupervisionSessionValidation = [
	check("nepvraag")
		.exists()
		.isString()
		.trim()
		.escape()
		.isLength({ max: 0 })
		.withMessage(
			"I think you are a bot. If this is not the case, please contact your admin"
		),
	check("date").exists().notEmpty().trim().escape(),
	check("time").exists().notEmpty().trim().escape(),
	check("supervisor").exists().notEmpty().trim().escape(),
];

module.exports = checkSupervisionSessionValidation;
