const { check } = require("express-validator");

let checkNewThreapistValidation = [
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
	check("email").isEmail().trim(),
	check("phone")
		.isLength({ max: 25 })
		.withMessage("Check if this phone number is correct"),
	check("fee_fq").isFloat(),
	check("fee").isFloat(),
	check("qualification_clinical_psychologist").optional(),
	check("qualification_counceling_psychologist").optional(),
	check("qualification_psychologist").optional(),
	check("qualification_psychotherapist_couples").optional(),
	check("qualification_psychotherapist_family").optional(),
	check("qualification_psychotherapist_ind").optional(),
	check("qualification_cbt").optional(),
	check("qualification_dbt").optional(),
	check("qualification_emdr").optional(),
	check("qualification_pre_cred").optional(),
	check("qualification_trainee_psychotherapist").optional(),
	check("contract_type_contract").optional(),
	check("contract_type_offers_online").optional(),
	check("contract_type_renter").optional(),
];

module.exports = checkNewThreapistValidation;
