const loginmodel = require("../models/loginmodel");
const nodemailer = require("nodemailer");

const { check, validationResult } = require("express-validator");

class LoginController {
	async loginUser(req, res) {
		if (req.session.sessionFlash != null) {
			res.locals.sessionFlash = req.session.sessionFlash;
			delete req.session.sessionFlash;
		}

		return res.render("templates/template.ejs", {
			message: res.locals.sessionFlash,
			name: "Login",
			page: "login.ejs",
			title: "Login",
			sidebar: false,
		});
	}

	/**
	 * TODO: Set timeout for 3 missed logins
	 */
	async checkUser(req, res) {
		try {
			let authenticatedUser = await loginmodel.verifyUser(req);

			console.log("authenticatedUser", authenticatedUser);

			req.session.user = authenticatedUser;

			let redirectPath = "/login";
			if (authenticatedUser) {
				redirectPath = "/";
			} else {
				req.session.sessionFlash = {
					type: "error",
					message: "Your details are not correct.",
				};
			}
			return res.redirect(redirectPath);
		} catch (error) {
			console.log("Failed authentication in checkUser", error);
		}
	}

	logout(req, res) {
		req.session.destroy();
		return res.redirect("/login");
	}

	forgotPassword(req, res) {
		return res.render("templates/template.ejs", {
			name: "Reset Password",
			page: "resetpassword.ejs",
			title: "Reset Password",
			sidebar: false,
		});
	}

	async resetpassword(req, res) {
		let user = await loginmodel.checkEmailAddress(req.body.email);
		if (user) {
			// generate a token and store in the database
			console.log("user ID", user.u_id);
			const token = await loginmodel.setToken(user.u_id);

			if (token) {
				loginmodel.forgotPassword(req.body.email, token);
			}

			return res.render("templates/template.ejs", {
				name: "Email Sent",
				page: "resetpasswordemailsent.ejs",
				title: "Email Sent",
				sidebar: false,
				pathCorrection: "../",
			});
		}
	}

	async checkToken(req, res) {
		let user = await loginmodel.checkToken(req.params.token);

		return res.render("templates/template.ejs", {
			name: "Reset Password",
			page: "resetpasswordform.ejs",
			title: "Reset Password",
			sidebar: false,
			pathCorrection: "../",
		});
	}

	async updatePassword(req, res) {
		console.log("BODY", req.body);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log("new password errors", errors);
			return res.render("templates/template.ejs", {
				name: "Reset Password",
				page: "resetpasswordform.ejs",
				title: "Reset Password",
				sidebar: false,
				userID: user.u_id,
				pathCorrection: "../",
				errors: errors,
			});
		} else {
			if ((await loginmodel.updatePassword(req.body)) === 1) {
				res.redirect("/login");
			}
		}
	}
}

module.exports = new LoginController();
