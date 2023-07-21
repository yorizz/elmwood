require("dotenv").config();

const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const bcrypt = require("bcrypt");

const initializePassport = require("./passport-config");
initializePassport(
	passport,
	(username) => users.find((user) => user.username === username),
	(id) => users.find((user) => user.id === id)
);

async function fillUsers(req, res) {
	users.push({
		id: Date.now().toString(),
		username: "Joris",
		password: "$2b$10$WlW5qzJwnSCY/kdPI1pVLegO24lUJuIlbijkli9QVdDbNrfnN8oFW",
	});
}

const users = [];

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
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
	console.log(req.user);
	res.render("index.ejs", { name: req.user.username });
});

app.get("/login", async (req, res) => {
	await fillUsers(req, res);
	res.render("login.ejs");
});

app.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/login",
		failureFlash: true,
	})
);

app.listen(port, () => {
	console.log(`Example app listening on port http://localhost:${port}`);
});
