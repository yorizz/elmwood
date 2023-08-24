require("dotenv").config();
const { waitUntil, TimeoutError } = require("async-wait-until");

const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const helper = require("./utils/helpers");

app.use(express.json());
app.use(fileUpload());

app.locals.formatPhoneNumber = helper.formatPhoneNumber;
app.locals.formatDate = helper.formatDate;
app.locals.formatFileType = helper.formatFileType;

const router = require("./controllers/routes");

const bcrypt = require("bcrypt");

app.use(express.static(path.join(__dirname, "../public")));
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
