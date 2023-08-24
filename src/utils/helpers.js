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

	formatDate(date) {
		return new Date(date).toLocaleString("en-IE", {
			year: "numeric",
			month: "2-digit",
			day: "numeric",
		});
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
}

module.exports = new Helpers();
