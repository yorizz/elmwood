const therapistmodel = require("../models/therapistmodel");
const qualificationsmodel = require("../models/qualificationsmodel");
const contracttypesmodel = require("../models/contracttypesmodel");
const accreditationsmodel = require("../models/accreditationsmodel");
const helpers = require("../utils/helpers");
const { check, validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const { clientDeactivated } = require("../models/clientmodel");
const clientmodel = require("../models/clientmodel");
const session = require("express-session");

class TherapistController {
	async getAllTherapists(req, res) {
		try {
			let therapists = [];

			let allTherapists = await therapistmodel.getAllTherapists();

			if (
				req.session.allTherapists &&
				req.session.allTherapists.length >= 1
			) {
				for (let i = 0; i < allTherapists.length; i++) {
					let sessionTherapist = helpers.getPersonName(
						req.session.allTherapists,
						"therapist",
						allTherapists[i].t_ID
					);

					let therapist = {
						t_ID: allTherapists[i].t_ID,
						t_first_name: sessionTherapist.t_first_name,
						t_surname: sessionTherapist.t_surname,
						t_colour: allTherapists[i].t_colour,
						t_phone: sessionTherapist.t_phone,
						t_email: sessionTherapist.t_email,
						t_fq_fee: allTherapists[i].t_fq_fee,
						t_fee: allTherapists[i].t_fee,
						t_is_active: allTherapists[i].t_is_active,
					};

					therapists.push(therapist);
				}
			} else {
				therapists = allTherapists;
			}

			console.log(path.join(__dirname, "../public"));

			return res.render("templates/template.ejs", {
				name: "All Therapists",
				page: "alltherapists.ejs",
				title: "All Therapists",
				sidebar: true,
				therapists: therapists,
			});
		} catch (error) {
			console.log("authenticateUser error", error);
		}
	}

	async getSingleTherapist(req, res) {
		try {
			let therapist = {};
			console.log(path.join(__dirname, "../public"));

			let clients = [];
			if (!isNaN(parseInt(req.params.id))) {
				therapist = await therapistmodel.getTherapist(req.params.id);

				console.log("therapist", therapist.therapist);
				console.log("qualifications", therapist.therapist_qualifications);
				console.log("files", therapist.therapist_files);

				let allClientsForTherapist = await clientmodel.getTherapistClients(
					req.params.id
				);

				if (req.session.allClients && req.session.allClients.length >= 1) {
					for (let i = 0; i < allClientsForTherapist.length; i++) {
						let sessionClient = helpers.getPersonName(
							req.session.allClients,
							"client",
							allClientsForTherapist[i].c_ID
						);

						let therapist = {
							c_ID: allClientsForTherapist[i].c_ID,
							c_firsc_name: sessionClient.c_first_name,
							c_surname: sessionClient.c_surname,
							c_phone: sessionClient.c_phone,
							c_email: sessionClient.c_email,
						};

						clients.push(therapist);
					}
				}
				console.log("clients", clients);
			}

			return res.render("templates/template.ejs", {
				name: "Therapist",
				page: "therapist.ejs",
				title: "Therapist",
				sidebar: true,
				therapist: therapist.therapist,
				qualifications: therapist.therapist_qualifications,
				contracts: therapist.therapist_contracts,
				accreditations: therapist.therapist_accreditations,
				pathCorrection: "../",
				files: therapist.therapist_files,
				notes: therapist.therapist_notes,
				clients: clients,
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
			const accreditations =
				await accreditationsmodel.getAllAccreditations();
			console.log("contract_types", contract_types);

			return res.render("templates/template.ejs", {
				name: "New Therapist",
				page: "newtherapist.ejs",
				title: "New Therapist",
				sidebar: true,
				qualifications: qualifications,
				contract_types: contract_types,
				accreditations: accreditations,
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
			const accreditations =
				await accreditationsmodel.getAllAccreditations();
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
				accreditations: accreditations,
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
				const accreditations =
					await accreditationsmodel.getAllAccreditations();
				console.log("contract_types", contract_types);

				return res.render("templates/template.ejs", {
					name: "New Therapist",
					page: "newtherapist.ejs",
					title: "New Therapist",
					sidebar: true,
					qualifications: qualifications,
					contract_types: contract_types,
					post: req.body,
					accreditations: accreditations,
					errors: errors.errors,
				});
			} catch (error) {
				console.log("Unable to add a new therapist", error);
			}
		} else {
			// console.log("req.body", req.body);
			let qualifications = [];
			for (const [key, value] of Object.entries(req.body)) {
				if (key.indexOf("qualification_") >= 0) {
					qualifications.push(value);
				}
			}
			console.log("qualifications", qualifications, qualifications.length);

			let accreditations = [];
			for (const [key, value] of Object.entries(req.body)) {
				if (key.indexOf("accreditation") >= 0) {
					accreditations.push(value);
				}
			}
			console.log("accreditations", accreditations, accreditations.length);

			let contract_types = [];

			for (const [key, value] of Object.entries(req.body)) {
				if (key.indexOf("contract_type_") >= 0) {
					contract_types.push(value);
				}
			}

			console.log("contract_types", contract_types, contract_types.length);

			const addTherapistResult = await therapistmodel.addTherapist(
				req.body,
				qualifications,
				contract_types,
				accreditations
			);
			console.log("Add Therapist Result", addTherapistResult);

			let allTherapists = req.session.allTherapists;
			const newTherapist = {
				t_ID: addTherapistResult.insertID,
				t_first_name: req.body.first_name,
				t_surname: req.body.surname,
				t_phone: req.body.phone,
				t_email: req.body.email,
				t_insurance_expiry_date: req.body.insurance_expiry,
			};
			allTherapists.push(newTherapist);
			req.session.allTherapists = allTherapists;

			return res.redirect("/dashboard");
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
				const accreditations =
					await accreditationsmodel.getAllAccreditations();

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
					accreditations: accreditations,
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

			for (const [key, value] of Object.entries(req.body)) {
				if (key.indexOf("qualification_") >= 0) {
					qualifications.push(value);
				}
			}

			console.log("qualifications", qualifications, qualifications.length);

			let contract_types = [];
			for (const [key, value] of Object.entries(req.body)) {
				if (key.indexOf("contract_type") >= 0) {
					contract_types.push(value);
				}
			}

			console.log("contract_types", contract_types, contract_types.length);

			let accreditations = [];
			for (const [key, value] of Object.entries(req.body)) {
				if (key.indexOf("accreditation") >= 0) {
					accreditations.push(value);
				}
			}

			const data = {
				t_first_name: helpers.dataEncrypt(req.body.first_name),
				t_surname: helpers.dataEncrypt(req.body.surname),
				t_colour: helpers.generateColorHexCode(),
				t_phone: helpers.dataEncrypt(req.body.phone),
				t_email: helpers.dataEncrypt(req.body.email),
				t_fq_fee: req.body.fee_fq,
				t_fee: req.body.fee,
				t_insurance_expiry_date: req.body.insurance_expiry,
			};

			console.log("therapist data", data);
			const addTherapistResult = await therapistmodel.updateTherapist(
				req.params.id,
				data,
				qualifications,
				contract_types,
				accreditations
			);
			console.log("Update Therapist Result", addTherapistResult);

			return res.redirect("/therapist/" + req.params.id);
		}
	}

	async viewAvailability(req, res) {
		console.log("viewing Availability");
		try {
			let therapistID = req.params.id;

			let availability = await therapistmodel.getAvailability(therapistID);

			let therapist = helpers.getPersonName(
				req.session.allTherapists,
				"therapist",
				therapistID
			);

			return res.render("templates/template.ejs", {
				name: "Availibility",
				page: "viewavailability.ejs",
				title: "Availibility ",
				pathCorrection: "../../",
				sidebar: true,
				therapist: therapist,
				availability: availability,
			});
		} catch (error) {
			console.log("");
		}
	}

	async deleteAvailability(req, res) {
		let deleteId = await therapistmodel.deleteAvailability(req.params.id);
		console.log("deleted availability", deleteId);
		res.send(deleteId);
	}

	async getEditAvailability(req, res) {
		try {
			let availability = await therapistmodel.editAvailability(
				req.params.id
			);

			return res.render("templates/template.ejs", {
				name: "Edit Availability",
				page: "editavailability.ejs",
				title: "Edit Availability ",
				pathCorrection: "../../../",
				sidebar: true,
				availability: availability,
				therapist: helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					availability[0].ta_therapist
				),
			});
		} catch (error) {
			console.log("error", error);
		}
	}

	async getAddAvailability(req, res) {
		try {
			return res.render("templates/template.ejs", {
				name: "Add Availability",
				page: "newavailability.ejs",
				title: "Add Availability ",
				pathCorrection: "../../../",
				sidebar: true,
				therapistId: req.params.id,
				therapist: helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					req.params.id
				),
			});
		} catch (error) {
			console.log("error", error);
		}
	}

	async addAvailability(req, res) {
		try {
			let availabilityData = {
				ta_ID: Date.now(),
				ta_available_day: req.body.ta_day,
				ta_available_time: req.body.ta_time,
				ta_note: req.body.ta_note,
				ta_therapist: req.body.ta_therapist,
			};
			let addedAvailability = await therapistmodel.addAvailability(
				availabilityData
			);

			console.log("addedAvailability", addedAvailability);
			return res.redirect(`/viewavailability/${req.body.ta_therapist}`);
		} catch (error) {
			console.log("error", error);
		}
	}

	async updateAvailability(req, res) {
		console.log("req", req.body);
		try {
			let availabilityData = {
				ta_available_day: req.body.ta_day,
				ta_available_time: req.body.ta_time,
				ta_note: req.body.ta_note,
			};
			let updatedAvailability = await therapistmodel.updateAvailability(
				availabilityData,
				req.body.ta_id
			);

			console.log("updatedAvailability", updatedAvailability);
			return res.redirect(`/viewavailability/${req.body.ta_therapist}`);
		} catch (error) {
			console.log("error", error);
		}
	}

	async listClientsPerTherapist(req, res) {
		console.log("see clients per therapist");
		try {
			let clientsPerTherapist =
				await therapistmodel.listClientsPerTherapist();
			return res.render("templates/template.ejs", {
				name: "Clients per Therapist",
				page: "clientspertherapist.ejs",
				title: "Clients per Therapist ",
				pathCorrection: "../../",
				sidebar: true,
				clientsPerTherapist: clientsPerTherapist,
			});
		} catch (error) {
			console.log("error", error);
		}
	}

	async deactivateTherapist(req, res) {
		try {
			let therapistID = req.params.id;
			let therapistDeactivated = await therapistmodel.deactivateTherapist(
				therapistID
			);
			console.log("therapistDeactivated", therapistDeactivated);
			res.send(therapistDeactivated);
		} catch (error) {
			console.log("unable to deactivate therapist", error);
		}
	}

	async activateTherapist(req, res) {
		try {
			let therapistID = req.params.id;
			let therapistActivated = await therapistmodel.activateTherapist(
				therapistID
			);
			console.log("therapistActivated", therapistActivated);
			res.send(therapistActivated);
		} catch (error) {
			console.log("unable to deactivate therapist", error);
		}
	}
	async getNoteModalContent() {
		try {
			return res.render("pages/addtherapistnote.ejs");
		} catch (error) {
			console.log("getNoteModalContent error", error);
		}
	}
	async addTherapistNote(req, res) {
		try {
			// console.log(session.user);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.json(errors);
			} else {
				let data = {
					tn_ID: Date.now(),
					tn_note: helpers.dataEncrypt(req.body.therapist_note),
					tn_therapist: req.body.therapistId,
				};
				console.log("client note data", data);
				let storeTherapistNote = await therapistmodel.addTherapistNote(
					data,
					req.body.therapistId
				);

				res.json({ msg: "therapist note added: " + storeTherapistNote });
			}
		} catch (error) {
			console.log("post note error", error);
		}
	}

	async storeFile(req, res) {
		const therapistFile = req.files.therapist_file;
		console.log("StoreFile", therapistFile);

		const newDirPath =
			__dirname +
			`/../..${process.env.UPLOAD_PATH}therapists/${req.body.therapistID}/`;

		const therapistFileDestinationPath = newDirPath + `${therapistFile.name}`;
		let msg;
		try {
			if (!fs.existsSync(newDirPath)) {
				fs.mkdirSync(newDirPath, { recursive: true });
				console.log("Directory created:", newDirPath);
			} else {
				console.log("Directory exists!");
			}

			await therapistFile.mv(therapistFileDestinationPath);

			// store file data in database
			const therapistFileData = {
				tf_ID: Date.now(),
				tf_file_name: therapistFile.name,
				tf_therapist: req.body.therapistID,
			};
			if (therapistmodel.storeFileData(therapistFileData)) {
				msg = { msg: "File added to therapist dossier" };
				console.log("msg", msg);
			} else {
				msg = { msg: "Unable to add file to therapist dossier" };
				console.log("msg", msg);
			}
			return res.json(msg);
		} catch (error) {
			console.log("storing file went wrong", error);
		}
	}

	async profitPerTherapist(req, res) {
		console.log(">>>", req.params, req.params.length);

		let therapistId, rangeStartDate, rangeEndDate;

		try {
			let profitPerTherapist;
			if (
				req.params.therapistID != undefined ||
				(req.params.startDate != undefined &&
					req.params.endDate != undefined)
			) {
				therapistId = req.params.therapistID;
				rangeStartDate = req.params.startDate;
				rangeEndDate = req.params.endDate;

				console.log("therapistID", therapistId);
				console.log("rangeStartDate", rangeStartDate);
				console.log("rangeEndDate", rangeEndDate);

				profitPerTherapist = await therapistmodel.getProfitPerTherapist(
					therapistId,
					{ dateRangeStart: rangeStartDate, dateRangeEnd: rangeEndDate }
				);
			} else {
				profitPerTherapist = await therapistmodel.getProfitPerTherapist();
			}

			let profits = [];
			for (let i = 0; i < profitPerTherapist.length; i++) {
				let therapistName = helpers.getPersonName(
					req.session.allTherapists,
					"therapist",
					profitPerTherapist[i].a_therapist
				);

				console.log("therapist name:", therapistName);
				profits.push({
					therapist: therapistName,
					elmwoodfee: profitPerTherapist[i].elmwoodfee,
				});
			}

			let subtitle =
				rangeStartDate && rangeEndDate
					? "between " + rangeStartDate + " and " + rangeEndDate
					: "";

			return res.render("templates/template.ejs", {
				name: "Elmwood Profit per Therapist",
				page: "profitpertherapist.ejs",
				title: "Elmwood Profit per Therapist ",
				subtitle: subtitle,
				pathCorrection: "../../",
				sidebar: true,
				profitPerTherapist: profits,
			});
		} catch (error) {
			console.log("Can't show profit per therapist", error);
		}
	}

	async getOutstandingFeesPerTherapist(req, res) {
		const outstandingFeesPerTherapist =
			await therapistmodel.getOutstandingFeesPerTherapist();

		let ofTherapists = [];

		for (let i = 0; i < req.session.allTherapists.length; i++) {
			for (let j = 0; j < outstandingFeesPerTherapist.length; j++) {
				if (
					req.session.allTherapists[i].t_ID ==
					outstandingFeesPerTherapist[j].a_therapist
				) {
					let therapistToAdd = {
						t_ID: req.session.allTherapists[i].t_ID,
						t_first_name: req.session.allTherapists[i].t_first_name,
						t_surname: req.session.allTherapists[i].t_surname,
						unpaid: outstandingFeesPerTherapist[j].unpaid,
					};
					ofTherapists.push(therapistToAdd);
				}
			}
		}

		ofTherapists.sort((a, b) => b.unpaid - a.unpaid);

		console.log("ofTherapists", ofTherapists);

		return res.render("templates/template.ejs", {
			name: "Elmwood Outstanding Fees per Therapist",
			page: "outstandingfeespertherapist.ejs",
			title: "Elmwood Outstanding Fees per Therapist ",
			pathCorrection: "../../",
			sidebar: true,
			outstandingfees: ofTherapists,
		});
	}
}

module.exports = new TherapistController();
