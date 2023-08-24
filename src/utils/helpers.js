class Helpers {
	formatPhoneNumber(phoneNumber) {
		let formattedPhoneNumber = "";
		for (let i = 0; i < phoneNumber.length; i++) {
			if (phoneNumber.indexOf("08") >= 0) {
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
}

module.exports = new Helpers();
