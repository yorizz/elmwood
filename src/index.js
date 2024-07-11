require("dotenv").config();
const { waitUntil, TimeoutError } = require("async-wait-until");

const express = require("express");
const app = express();
const port = process.env.PORT;
const path = require("path");
const flash = require("express-flash");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

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
app.locals.formatDatePickerDate = helper.formatDatePickerDate;
app.locals.formatTime = helper.formatTime;
app.locals.formatSessionTime = helper.formatSessionTime;
app.locals.formatFileType = helper.formatFileType;
app.locals.formatCurrency = helper.formatCurrency;
app.locals.formatAttribute = helper.formatAttribute;
app.locals.dataEncrypt = helper.dataEncrypt;
app.locals.dataDecrypt = helper.dataDecrypt;
app.locals.checkError = helper.checkForFieldError;
app.locals.generateColor = helper.generateColorHexCode;
app.locals.htmlUnescape = helper.htmlUnescape;
app.locals.isChecked = helper.isChecked;

const router = require("./routes/routes");

const bcrypt = require("bcrypt");

// const saltRounds = 10;
// const myPlaintextPassword = "ucv7qwh3REJ-ypj7pbr";

// const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
// console.log("bcrypting ", hash);

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

let min = 3600000 / 60;

let store = new MongoDBStore({
	uri: process.env.MONGO_CONNECT_URI,
	databaseName: process.env.MONGO_DATABASE,
	collection: process.env.MONGO_COLLECTION,
});
// console.log("store", store);

store.on("error", function (error) {
	console.log(error);
});

let maxAge = new Date(Date.now() + 10 * min);
console.log("maxAge", maxAge);

app.use(
	session({
		genid: (req) => {
			console.log("1. in genid req.sessionID: ", req.sessionID);
			return uuidv4();
		},
		store: store,
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		maxAge: maxAge,
		// cookie: { secure: true },
	})
);

app.use(router);

app.listen(port, () => {
	console.log(`Example app listening on port http://localhost:${port}`);
});
