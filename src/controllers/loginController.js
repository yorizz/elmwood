const loginmodel = require("../models/loginmodel");

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
}

module.exports = new LoginController();
