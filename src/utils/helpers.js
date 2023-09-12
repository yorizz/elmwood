require("dotenv").config();
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

class Helpers {
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
		return formattedPhoneNumber;
	}

	formatDate(date) {
		return new Date(date).toLocaleString("en-IE", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
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
		return cryptr.decrypt(encryptedData);
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
}

module.exports = new Helpers();
