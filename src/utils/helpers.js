require("dotenv").config();
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

const sodium = require("sodium-native");

const he = require("he");

class Helpers {
	constructor() {
		this.nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
		this.key = sodium.sodium_malloc(sodium.crypto_secretbox_KEYBYTES); // secure buffer
	}

	formatPhoneNumber(phoneNumber) {
		let formattedPhoneNumber = "";
		for (let i = 0; i < phoneNumber.length; i++) {
			if (phoneNumber.indexOf("08") >= 0 && phoneNumber.indexOf("-") == -1) {
				if (i == 3) {
					formattedPhoneNumber += "-";
				}
				if (i == 6) {
					formattedPhoneNumber += " ";
				}
				formattedPhoneNumber += phoneNumber.charAt(i);
			}
		}
		return formattedPhoneNumber != " " ? formattedPhoneNumber : phoneNumber;
	}

	formatDate(date) {
		return new Date(date).toLocaleString("en-IE", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	}

	formatSQLDate(date) {
		return new Date(date).toISOString();
	}

	formatTime(time) {
		let rv = "";
		if (time.length > 5) {
			rv = time.slice(0, 5);
		}
		return rv;
	}

	formatAttribute(attribute) {
		let rv = attribute.toLowerCase();
		rv = rv.replaceAll(" ", "_");
		return rv;
	}

	padTo2Digits(num) {
		return num.toString().padStart(2, "0");
	}

	formatYYYYMMDDDate(date, separator) {
		return [
			date.getFullYear(),
			this.padTo2Digits(date.getMonth() + 1),
			this.padTo2Digits(date.getDate()),
		].join(separator);
	}

	formatDatePickerDate(date) {
		return [
			date.getFullYear(),

			(date.getMonth() + 1).toString().length == 1
				? 0 + (date.getMonth() + 1).toString()
				: (date.getMonth() + 1).toString(),
			date.getDate().toString().length == 1
				? "0" + date.getDate().toString()
				: date.getDate().toString(),
		].join("-");
	}

	formatFileType(fileName) {
		let fileTypeIcon = '<i class="bi bi-file-earmark"></i>';
		if (fileName.indexOf(".doc") >= 1) {
			fileTypeIcon = '<i class="bi bi-file-earmark-word"></i>';
		}
		if (fileName.indexOf(".pdf") >= 1) {
			fileTypeIcon = '<i class="bi bi-file-earmark-pdf"></i>';
		}
		if (fileName.indexOf(".txt") >= 1) {
			fileTypeIcon = '<i class="bi bi-file-text"></i>';
		}
		if (fileName.indexOf(".xls") >= 1) {
			fileTypeIcon = '<i class="bi bi-file-earmark-excel"></i>';
		}

		return fileTypeIcon;
	}

	formatCurrency(amount) {
		return amount.toLocaleString("ie-IE", {
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
		});
	}

	dataEncrypt(dataToEncrypt) {
		return cryptr.encrypt(dataToEncrypt);
	}

	dataDecrypt(encryptedData) {
		try {
			return cryptr.decrypt(encryptedData);
		} catch (error) {
			return error;
		}
	}

	nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
	key = sodium.sodium_malloc(sodium.crypto_secretbox_KEYBYTES); // secure buffer

	sodiumEncrypt(stringToEncrypt) {
		var message = Buffer.from(stringToEncrypt);
		var ciphertext = Buffer.alloc(
			message.length + sodium.crypto_secretbox_MACBYTES
		);

		sodium.randombytes_buf(this.nonce); // insert random data into nonce
		sodium.randombytes_buf(this.key); // insert random data into key

		// encrypted message is stored in ciphertext
		sodium.crypto_secretbox_easy(ciphertext, message, this.nonce, this.key);

		console.log("Encrypted message:", ciphertext);

		let plainText = Buffer.alloc(
			ciphertext.length - sodium.crypto_secretbox_MACBYTES
		);
		console.log("buff2str", ciphertext.toString(), plainText);
		// console.log("buff2str", ciphertext.toString());
		return ciphertext;
	}

	sodiumDecrypt(encryptedStringBuffer) {
		let rv = false;

		let plainText = Buffer.alloc(
			encryptedStringBuffer.length - sodium.crypto_secretbox_MACBYTES
		);

		if (
			!sodium.crypto_secretbox_open_easy(
				plainText,
				encryptedStringBuffer,
				this.nonce,
				this.key
			)
		) {
			console.log("Decryption failed!");
		} else {
			console.log(
				"Decrypted message:",
				plainText,
				"(" + plainText.toString() + ")"
			);
			rv = plainText.toString();
		}
		return rv;
	}

	htmlUnescape(escapedHTML) {
		return he.unescape(escapedHTML);
	}

	checkForFieldError(errors, fieldName) {
		let rv = false;
		let msg = null;
		for (let i = 0; i < errors.length; i++) {
			if (errors[i].path == fieldName) {
				rv = true;
				msg = errors[i].msg;
			}
		}
		return { rv: rv, msg: msg };
	}

	generateColorHexCode() {
		const colorHexValues = [
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			0,
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
		];
		let newColor = "#";
		for (let i = 0; i < 6; i++) {
			newColor +=
				colorHexValues[Math.floor(Math.random() * colorHexValues.length)];
		}
		return newColor;
	}

	add_week(currentWeekDate) {
		return new Date(currentWeekDate.setDate(currentWeekDate.getDate() + 7));
	}

	getPersonName(sessionParam, type, ID) {
		for (let i = 0; i < sessionParam.length; i++) {
			if (type == "client") {
				if (sessionParam[i].c_ID == ID) {
					return sessionParam[i];
				}
			}
			if (type == "therapist") {
				if (sessionParam[i].t_ID == ID) {
					return sessionParam[i];
				}
			}
		}
	}

	isChecked(checkedValue, valuesArray, key) {
		let rv = "";
		for (let i = 0; i < valuesArray.length; i++) {
			if (valuesArray[i][key] == checkedValue) {
				rv = "checked";
			}
		}
		return rv;
	}
}

module.exports = new Helpers();
