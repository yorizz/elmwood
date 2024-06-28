require("dotenv").config();

const QueryBuilder = require("node-querybuilder");
const bcrypt = require("bcrypt");

const express = require("express");
const app = express();

const nodemailer = require("nodemailer");

const db_config = require("../utils/dbconfig");
const helpers = require("../utils/helpers");

const pool = new QueryBuilder(db_config, "mysql", "pool");

class LoginModel {
	async verifyUser(req) {
		let user = [];
		let rv = false;
		let name = req.body.username;
		let password = req.body.password;

		let qb;
		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("*")
				.where({ u_name: name })
				.get("users");

			console.log("Query Ran: " + qb.last_query());

			// console.log("Results:", response);

			user = JSON.parse(JSON.stringify(response));

			user = user[0];

			if (user.u_name == name) {
				if (await bcrypt.compare(password, user.u_password)) {
					console.log("found user", user);
					rv = user;
				} else {
					// console.log("not a valid password");
					rv = false;
				}
			}

			return rv;
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async checkEmailAddress(emailAddress) {
		let qb;

		try {
			qb = await pool.get_connection();
			const response = await qb.select("*").get("users");

			console.log("Query Ran: " + qb.last_query());

			console.log("Results:", response);
			let rv = false;
			for (let i = 0; i < response.length; i++) {
				console.log(
					helpers.dataDecrypt(response[i].u_email),
					">>",
					emailAddress
				);
				if (helpers.dataDecrypt(response[i].u_email) == emailAddress) {
					rv = response[i];
				}
			}

			console.log("email address found", JSON.parse(JSON.stringify(rv)));

			return JSON.parse(JSON.stringify(rv));
		} catch (err) {
			return console.error("Pool Query Error: " + err);
		} finally {
			if (qb) qb.release();
		}
	}

	async forgotPassword(emailAddress, token) {
		const EMAILCONFIG = require("../utils/emailconfig");
		const transporter = nodemailer.createTransport(EMAILCONFIG);

		const messageInfo = {
			from: '"Elmwood" <noreply@elmwoodcentre.com>',
			to: emailAddress,
			subject: "Reset your password",
			text: `To reset your password for the Elmwood Admin app please follow copy and paste the this address in your browser\'s address bar: http:localhost:8080/resetpassword/${token}`,
			html: `<p>To reset your password for the Elmwood Admin app please click on the link below:</p><p>http://localhost:8080/resetpassword/${token}</p><p>If that doesn\'t work, please follow copy and paste the this address in your browser\'s address bar: http:localhost:8080/resetpassword/${token}</p>`,
		};

		const sendEmail = await transporter.sendMail(
			messageInfo,
			(error, info) => {
				if (error) {
					return console.log(error);
				}
				console.log("Message %s sent: %s", info.messageId, info.response);
				return "Message sent: %s", info.messageId;
			}
		);
	}

	async setToken(userId) {
		const token = require("crypto").randomBytes(64).toString("hex");
		let qb;
		try {
			qb = await pool.get_connection();
			qb.where("u_id", userId).set({ u_token: token }).update("users");
			console.log("Query Ran: " + qb.last_query());
			console.log("token", token);
			return token;
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async checkToken(token) {
		let qb;
		try {
			qb = await pool.get_connection();
			const response = await qb
				.select("u_id")
				.where("u_token", token)
				.get("users");
			console.log("Query Ran: " + qb.last_query());

			let user = JSON.parse(JSON.stringify(response));

			user = user[0];
			return user;
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}

	async updatePassword(formData) {
		let userId = formData.userId;
		const saltRounds = 10;
		let newPassword = bcrypt.hashSync(formData.newpassword, saltRounds);
		let qb;
		try {
			qb = await pool.get_connection();
			const results = await qb
				.where("u_id", userId)
				.set({ u_password: newPassword })
				.update("users");

			console.log(
				"Query Ran: " + qb.last_query(),
				results,
				results.affected_rows
			);
			return results.affected_rows;
		} catch (error) {
			console.log(error);
		} finally {
			if (qb) qb.release();
		}
	}
}

module.exports = new LoginModel();
