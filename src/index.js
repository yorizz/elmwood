require("dotenv").config();
const { waitUntil, TimeoutError } = require("async-wait-until");

const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");

const loginmodel = require("./models/loginmodel");

const bcrypt = require("bcrypt");

app.set("view-engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

app.get("/", isUserAuthenticated, (req, res) => {
	console.log("user", req.session.user);
	res.render("index.ejs", {
		name: req.session.user.u_name ? req.session.user.u_name : "Stranger",
	});
});

app.get("/login", async (req, res) => {
	res.render("login.ejs");
});

app.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/login");
});

/**
 * TODO: Set timeout for 3 missed logins
 */
app.post("/login", async (req, res) => {
	let authenticatedUser = await authenticateUser(req);
	console.log("authenticatedUser", authenticatedUser);
	req.session.user = authenticatedUser;
	let redirectPath = "/login";
	if (authenticatedUser) {
		redirectPath = "/";
	}
	res.redirect(redirectPath);
});

app.listen(port, () => {
	console.log(`Example app listening on port http://localhost:${port}`);
});

async function authenticateUser(req) {
	try {
		let authenticatedUser = await loginmodel.verifyUser(req);
		return authenticatedUser;
	} catch (error) {
		console.log("authenticateUser error", error);
	}
}

function isUserAuthenticated(req, res, next) {
	console.log("on session", req.session.user);
	if (req.session.user) {
		next();
	} else {
		res.redirect("/login");
	}
}
