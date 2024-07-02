require("dotenv").config();

module.exports = {
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT,
	secure: process.env.EMAIL_SECURE,
	requireTLS: true,
	tls: {
		ciphers: "SSLv3",
		rejectUnauthorized: false,
	},
	auth: {
		user: process.env.EMAIL_AUTH_USER,
		pass: process.env.EMAIL_AUTH_PASS,
	},
	debug: true,
	logger: true,
};
