const { check } = require("express-validator");

let checkNewEnquiryValidation = [
	check("nepvraag")
		.exists()
		.isString()
		.trim()
		.escape()
		.isLength({ max: 0 })
		.withMessage(
			"I think you are a bot. If this is not the case, please contact your admin"
		),
	check("first_name").exists().isString().trim().escape(),
	check("surname").exists().isString().trim().escape(),
	check("email")
		.optional({ nullable: true, checkFalsy: true })
		.isEmail()
		.trim()
		.withMessage("Check the email address"),
	check("phone")
		.optional()
		.isLength({ max: 25 })
		.withMessage("Check if this phone number is correct"),
	check("therapists").optional().isLength({ min: 13, max: 13 }),
	check("assessed_by").optional().isLength({ min: 13, max: 13 }),
	check("assessment_date").optional().trim().escape(),
	check("referred_by").optional().isNumeric(),
	check("low_cost").optional(),
	check("sent_to_claire").optional(),
	check("referred_by_other").optional().trim().escape(),
];

module.exports = checkNewEnquiryValidation;
