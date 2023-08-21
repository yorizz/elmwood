require("dotenv").config();
const { waitUntil, TimeoutError } = require("async-wait-until");

const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");

app.use(express.json());

const router = require("./controllers/routes");

const bcrypt = require("bcrypt");

app.use(express.static(path.join(__dirname, "../public")));
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

app.use(router);

app.listen(port, () => {
	console.log(`Example app listening on port http://localhost:${port}`);
});
