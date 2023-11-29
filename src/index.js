require("dotenv").config();
const { waitUntil, TimeoutError } = require("async-wait-until");

const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const compression = require("compression");
const morgan = require("morgan");
const winston = require("winston");

const { format } = winston;

const helper = require("./utils/helpers");

app.use(express.json());
app.use(fileUpload());

app.use(compression());

app.locals.formatPhoneNumber = helper.formatPhoneNumber;
app.locals.formatDate = helper.formatDate;
app.locals.formatTime = helper.formatTime;
app.locals.formatFileType = helper.formatFileType;
app.locals.formatCurrency = helper.formatCurrency;
app.locals.formatAttribute = helper.formatAttribute;
app.locals.dataEncrypt = helper.dataEncrypt;
app.locals.dataDecrypt = helper.dataDecrypt;
app.locals.checkError = helper.checkForFieldError;
app.locals.generateColor = helper.generateColorHexCode;
app.locals.htmlUnescape = helper.htmlUnescape;

const router = require("./routes/routes");

const bcrypt = require("bcrypt");

const logger = winston.createLogger({
	format: format.combine(
		format.colorize(),
		format.timestamp(),
		format.printf((msg) => {
			return `${msg.timestamp} [${msg.level}] ${msg.message}`;
		})
	),
	transports: [new winston.transports.Console({ level: "http" })],
});

const morganMiddleware = morgan(
	":method :url :status :res[content-length] - :response-time ms",
	{
		stream: {
			write: (message) => logger.http(message.trim()),
		},
	}
);

app.use(morganMiddleware);

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
