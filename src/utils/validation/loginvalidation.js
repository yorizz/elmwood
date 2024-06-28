const { check } = require("express-validator");

let checkNewPasswordValidation = [
	check("nepvraag")
		.exists()
		.isString()
		.trim()
		.escape()
		.isLength({ max: 0 })
		.withMessage(
			"I think you are a bot. If this is not the case, please contact your admin"
		),
	check("newpassword").isStrongPassword({
		minLength: 8,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	}),
	check("confirmnewpassword")
		.custom((value, { req }) => value === req.body.newpassword)
		.withMessage("passwords do not match"),
];

module.exports = checkNewPasswordValidation;
