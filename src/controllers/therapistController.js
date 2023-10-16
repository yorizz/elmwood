const therapistmodel = require("../models/therapistmodel");
const qualificationsmodel = require("../models/qualificationsmodel");
const contracttypesmodel = require("../models/contracttypesmodel");
const helpers = require("../utils/helpers");
const { check, validationResult } = require("express-validator");
const path = require("path");

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

class TherapistController {
	async getAllTherapists(req, res) {
		try {
			let allTherapists = await therapistmodel.getAllTherapists();

			console.log(path.join(__dirname, "../public"));

			return res.render("templates/template.ejs", {
				name: "All Therapists",
				page: "alltherapists.ejs",
				title: "All Therapists",
				sidebar: true,
				therapists: allTherapists,
			});
		} catch (error) {
			console.log("authenticateUser error", error);
		}
	}

	async getSingleTherapist(req, res) {
		try {
			let therapist = {};
			console.log(path.join(__dirname, "../public"));

			if (!isNaN(parseInt(req.params.id))) {
				therapist = await therapistmodel.getTherapist(req.params.id);

				console.log("therapist", therapist.therapist);
				console.log("qualifications", therapist.therapist_qualifications);
				console.log("files", therapist.therapist_files);
			}

			return res.render("templates/template.ejs", {
				name: "Therapist",
				page: "therapist.ejs",
				title: "Therapist",
				sidebar: true,
				therapist: therapist.therapist,
				qualifications: therapist.therapist_qualifications,
				contracts: therapist.therapist_contracts,
				pathCorrection: "../",
				files: therapist.therapist_files,
				notes: therapist.therapist_notes,
			});
		} catch (error) {
			console.log("unknown therapist error", error);
		}
	}

	async getNewTherapist(req, res) {
		try {
			const qualifications =
				await qualificationsmodel.getAllQualifications();
			const contract_types = await contracttypesmodel.getAllContractTypes();
			console.log("contract_types", contract_types);

			return res.render("templates/template.ejs", {
				name: "New Therapist",
				page: "newtherapist.ejs",
				title: "New Therapist",
				sidebar: true,
				qualifications: qualifications,
				contract_types: contract_types,
			});
		} catch (error) {
			console.log("Unable to add a new therapist", error);
		}
	}

	async editTherapist(req, res) {
		try {
			let therapist = {};
			console.log(path.join(__dirname, "../public"));

			if (!isNaN(parseInt(req.params.id))) {
				therapist = await therapistmodel.getTherapist(req.params.id);
				console.log("therapist info", therapist);
			}

			let qualifications = await qualificationsmodel.getAllQualifications();
			let contract_types = await contracttypesmodel.getAllContractTypes();
			console.log("contract types>", contract_types);

			return res.render("templates/template.ejs", {
				name:
					"Edit " +
					helpers.dataDecrypt(therapist.therapist[0].t_first_name) +
					" " +
					helpers.dataDecrypt(therapist.therapist[0].t_surname),
				page: "newtherapist.ejs",
				title:
					"Edit " +
					helpers.dataDecrypt(therapist.therapist[0].t_first_name) +
					" " +
					helpers.dataDecrypt(therapist.therapist[0].t_surname),
				sidebar: true,
				therapist: therapist,
				qualifications: qualifications,
				contract_types: contract_types,
				pathCorrection: "../../",
				files: therapist.therapist_files,
				notes: therapist.therapist_notes,
				isEdit: true,
			});
		} catch (error) {
			console.log("unable to display edit therapist", error);
		}
	}

	async postNewTherapist(req, res) {
		const errors = await validationResult(req);
		if (!errors.isEmpty()) {
			console.log("errors", errors.errors);
			console.log("req.body", req.body);
			try {
				const qualifications =
					await qualificationsmodel.getAllQualifications();
				const contract_types =
					await contracttypesmodel.getAllContractTypes();
				console.log("contract_types", contract_types);

				return res.render("templates/template.ejs", {
					name: "New Therapist",
					page: "newtherapist.ejs",
					title: "New Therapist",
					sidebar: true,
					qualifications: qualifications,
					contract_types: contract_types,
					post: req.body,
					errors: errors.errors,
				});
			} catch (error) {
				console.log("Unable to add a new therapist", error);
			}
		} else {
			let qualifications = [];

			if (req.body.qualification_clinical_psychologist) {
				qualifications.push(req.body.qualification_clinical_psychologist);
			}
			if (req.body.qualification_counceling_psychologist) {
				qualifications.push(req.body.qualification_counceling_psychologist);
			}
			if (req.body.qualification_psychologist) {
				qualifications.push(req.body.qualification_psychologist);
			}
			if (req.body.qualification_psychotherapist_couples) {
				qualifications.push(req.body.qualification_psychotherapist_couples);
			}
			if (req.body.qualification_psychotherapist_family) {
				qualifications.push(req.body.qualification_psychotherapist_family);
			}
			if (req.body.qualification_psychotherapist_ind) {
				qualifications.push(req.body.qualification_psychotherapist_ind);
			}
			if (req.body.qualification_cbt) {
				qualifications.push(req.body.qualification_cbt);
			}
			if (req.body.qualification_dbt) {
				qualifications.push(req.body.qualification_dbt);
			}
			if (req.body.qualification_emdr) {
				qualifications.push(req.body.qualification_emdr);
			}
			if (req.body.qualification_pre_cred) {
				qualifications.push(req.body.qualification_pre_cred);
			}
			if (req.body.qualification_trainee_psychotherapist) {
				qualifications.push(req.body.qualification_trainee_psychotherapist);
			}

			console.log("qualifications", qualifications, qualifications.length);

			let contract_types = [];
			if (req.body.contract_type_contract) {
				contract_types.push(req.body.contract_type_contract);
			}
			if (req.body.contract_type_offers_online) {
				contract_types.push(req.body.contract_type_offers_online);
			}

			if (req.body.contract_type_renter) {
				contract_types.push(req.body.contract_type_renter);
			}

			console.log("contract_types", contract_types, contract_types.length);

			const addTherapistResult = await therapistmodel.addTherapist(
				req.body,
				qualifications,
				contract_types
			);
			console.log("Add Therapist Result", addTherapistResult);

			return res.send(req.body);
		}
	}

	async updateTherapist(req, res) {
		const errors = await validationResult(req);
		if (!errors.isEmpty()) {
			console.log("errors", errors.errors);
			console.log("req.body", req.body);
			try {
				let therapist = {};
				console.log(path.join(__dirname, "../public"));

				if (!isNaN(parseInt(req.params.id))) {
					therapist = await therapistmodel.getTherapist(req.params.id);
					console.log("therapist info", therapist);
				}
				const qualifications =
					await qualificationsmodel.getAllQualifications();
				const contract_types =
					await contracttypesmodel.getAllContractTypes();
				console.log("contract_types", contract_types);

				return res.render("templates/template.ejs", {
					name:
						"Edit " +
						helpers.dataDecrypt(therapist.therapist[0].t_first_name) +
						" " +
						helpers.dataDecrypt(therapist.therapist[0].t_surname),
					page: "newtherapist.ejs",
					title:
						"Edit " +
						helpers.dataDecrypt(therapist.therapist[0].t_first_name) +
						" " +
						helpers.dataDecrypt(therapist.therapist[0].t_surname),
					sidebar: true,
					therapist: therapist,
					qualifications: qualifications,
					contract_types: contract_types,
					pathCorrection: "../../",
					files: therapist.therapist_files,
					notes: therapist.therapist_notes,
					errors: errors.errors,
					isEdit: true,
				});
			} catch (error) {
				console.log("Unable to update therapist", error);
			}
		} else {
			let qualifications = [];

			if (req.body.qualification_clinical_psychologist) {
				qualifications.push(req.body.qualification_clinical_psychologist);
			}
			if (req.body.qualification_counceling_psychologist) {
				qualifications.push(req.body.qualification_counceling_psychologist);
			}
			if (req.body.qualification_psychologist) {
				qualifications.push(req.body.qualification_psychologist);
			}
			if (req.body.qualification_psychotherapist_couples) {
				qualifications.push(req.body.qualification_psychotherapist_couples);
			}
			if (req.body.qualification_psychotherapist_family) {
				qualifications.push(req.body.qualification_psychotherapist_family);
			}
			if (req.body.qualification_psychotherapist_ind) {
				qualifications.push(req.body.qualification_psychotherapist_ind);
			}
			if (req.body.qualification_cbt) {
				qualifications.push(req.body.qualification_cbt);
			}
			if (req.body.qualification_dbt) {
				qualifications.push(req.body.qualification_dbt);
			}
			if (req.body.qualification_emdr) {
				qualifications.push(req.body.qualification_emdr);
			}
			if (req.body.qualification_pre_cred) {
				qualifications.push(req.body.qualification_pre_cred);
			}
			if (req.body.qualification_trainee_psychotherapist) {
				qualifications.push(req.body.qualification_trainee_psychotherapist);
			}

			console.log("qualifications", qualifications, qualifications.length);

			let contract_types = [];
			if (req.body.contract_type_contract) {
				contract_types.push(req.body.contract_type_contract);
			}
			if (req.body.contract_type_offers_online) {
				contract_types.push(req.body.contract_type_offers_online);
			}

			if (req.body.contract_type_renter) {
				contract_types.push(req.body.contract_type_renter);
			}

			console.log("contract_types", contract_types, contract_types.length);

			const addTherapistResult = await therapistmodel.updateTherapist(
				req.body,
				qualifications,
				contract_types
			);
			console.log("Update Therapist Result", addTherapistResult);

			return res.redirect("/therapist/" + req.params.id);
		}
	}

	async viewAvailability(req, res) {
		console.log("viewing Availability");
		try {
			let therapistID = req.params.id;
			let therapist = await therapistmodel.getTherapist(therapistID);
			return res.render("templates/template.ejs", {
				name: "Availibility",
				page: "availability.ejs",
				title: "Availibility ",
				pathCorrection: "../../",
				sidebar: true,
				therapist: therapist,
			});
		} catch (error) {
			console.log("");
		}
	}
}

module.exports = new TherapistController();
