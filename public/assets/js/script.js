console.log("opening page", window.document.location.href);

$(document).ready(function () {
	console.log("page loaded");

	$(".table").tablesorter();

	if ($("#therapists-table").length == 1) {
		console.log("sort the #therapists-table");
		$("#therapists-table").tablesorter();
	}

	let tooltipTriggerList = document.querySelectorAll(
		'[data-bs-toggle="tooltip"]'
	);
	let tooltipList = [...tooltipTriggerList].map(
		(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
	);

	$(document).on("click", "#sidebarToggle", function () {
		let el = $(this);

		if (el.parent().parent().hasClass("toggled")) {
			slideOut(el);
		} else {
			slideIn(el);
		}
	});

	if (
		window.location.href.indexOf("/calendar") >= 1 ||
		window.location.href.indexOf("/therapist") >= 1
	) {
		console.log("calling tooltip");
		getTooltip();
	}

	$(document).on(
		"click",
		".sidebar a, .bi-pencil, .form-save-button, .appointments-link, .login-button",
		function () {
			let elipsisClass =
				$(this).hasClass("bi-pencil") ||
				$(this).hasClass("form-save-button") ||
				$(this).hasClass("appointments-link")
					? "main-content-section"
					: "";
			console.log("elipsisClass", elipsisClass);
			$(this).append(
				`<div class="lds-ellipsis ${elipsisClass}"><div></div><div></div><div></div><div></div></div>`
			);
		}
	);

	$(document).on(
		"click",
		".fc-timeGridWeek-button, .fc-next-button, .fc-prev-button",
		function () {
			getTooltip();
		}
	);

	$(document).on("click", "#availability", function (event) {
		event.preventDefault();

		window.location.href =
			"/viewavailability/" + $(this).attr("data-therapist");
	});

	$(document).on("click", "#therapist-activation", function (event) {
		event.preventDefault();
		activateDeactivate($(this), "therapist");
	});

	$(document).on("click", "#client_active", function (event) {
		event.preventDefault();
		activateDeactivate($(this), "client");
	});

	// this is the close modal button
	$(document).on("click", "button[data-bs-dismiss]", () => {
		$(".modal-backdrop").remove();
		$(".modal-spinner").remove();
	});

	let theModal = new bootstrap.Modal($("#theModal"), {
		backdrop: "static",
	});

	let theAppointmentID;
	$(document).on("click", ".cancel-appointment", function () {
		let clickedButton = $(this);

		let isRecycledButtonClicked = clickedButton
			.find("i")
			.hasClass("bi-arrow-counterclockwise");

		console.log("clicked button has a recycle icon", isRecycledButtonClicked);

		theAppointmentID = clickedButton.attr("data-appointment");
		console.log("APPOINTMENT-ID", theAppointmentID);

		if (isRecycledButtonClicked) {
			//uncancel

			$.ajax({
				url: `/uncancelappointment/${theAppointmentID}`,
				type: "POST",
				dataType: "JSON",
				success: function (data) {
					console.log("data", data);

					clickedButton
						.find("i")
						.removeClass("bi-arrow-counterclockwise")
						.addClass("bi-trash3");

					clickedButton
						.parent()
						.parent()
						.removeClass("cancelled-appointment");

					$("#appointmentsModal").hide();
					$(".modal-backdrop").hide();
				},
				error: function (error) {
					console.log("error", error);
				},
			});
		} else {
			let theAppointmentHTML = clickedButton.parent().parent()[0].innerHTML;
			$(".modal-title").text("Cancel Appointment");
			$(".modal-body").html(theAppointmentHTML);
			$(".modal-body .appointment-cancel-button ").remove();
			$(".modal-body").append(
				'<form action="/cancelappointment/' +
					theAppointmentID +
					'" method="POST" id="cancel-appointment-form">' +
					'<label for="cancellation_reason" class="form-label">Reason for cancelling this appointment</label>' +
					'<textarea class="form-control" id="cancellation_reason" name="cancellation_reason" rows="5" required="required"></textarea>' +
					'<input type="checkbox" value="1" id="canceled_needs_payment" name="canceled_needs_payment" checked> <label for="canceed_needs_payment">Needs payment</label>' +
					'<input type="checkbox" value="1" id="cancel_all_future_appointments" name="cancel_all_future_appointments"> <label for="cancel_all_future_appointments">Cancel all future appointments</label>' +
					"</form>"
			);
			$("#submit-new-appointment")
				.attr("id", "submit-cancel-appointment")
				.text("Save");

			$("#submit-cancel-appointment").attr(
				"data-appointment-id",
				theAppointmentID
			);

			console.log("id changed to ", theAppointmentID);
		}
	});

	$(document).on("click", "#submit-cancel-appointment", function (event) {
		event.preventDefault();

		console.log("We really want to cancel the appointment");

		$(".error").remove();
		let appointmentID = $(this).attr("data-appointment-id");
		let url = "/cancelappointment/" + appointmentID;
		console.log("to url", url);

		if (
			$("#cancellation_reason").val() == null ||
			$("#cancellation_reason").val().trim() == ""
		) {
			$(".modal-body label").prepend(
				'<p class="error">Please provide a reason for cancelling this appointment</p>'
			);
		} else {
			$.ajax({
				url: url,
				type: "post",
				data: $("#cancel-appointment-form").serialize(),
				success: function (data) {
					console.log("data", data);

					//find the row with the appointment ID
					$(`[data-appointment=${theAppointmentID}]`).addClass(
						"cancelled-appointment"
					);
					$(`[data-appointment=${theAppointmentID}]`)
						.find("i")
						.removeClass("bi-trash3")
						.addClass("bi-arrow-counterclockwise");
					theAppointmentID = null;
				},
				error: function (error) {
					console.log("error", error);
				},
			});
		}
		$(".modal-backdrop").remove();
	});

	$(document).on("click", "#submit-new-appointment", function (event) {
		event.preventDefault();
		$(".error").remove();

		if ($("#clients").val() == -1) {
			console.log("Don't do it!");
			$("#clients").before(errorMessage("Please select a client"));
		} else if ($("#therapists").val() == -1) {
			$("#therapists").before(errorMessage("Please select a therapist"));
		} else {
			$.ajax({
				url: "/addappointment",
				type: "post",
				data: $("#new-appointment-form").serialize(),
				success: function (data) {
					console.log(data);
					if (data != "Don't do it!") {
						console.log(data.clients);
						setTimeout(() => {
							window.location = "/calendar";
						}, 500);
					} else {
						console.log("argh");
					}
				},
				error: (error) => {
					console.error(error);
				},
			});
		}
	});

	$(document).on("change", "#new-appointment-form #clients", function () {
		$.ajax({
			url: "/gettherapistforclient",
			data: { client: $(this).val() },
			type: "post",
			dataType: "JSON",
			success: function (data) {
				if (data[0].c_therapist.length > 1) {
					console.log("therapist:", data[0].c_therapist);
					$("#new-appointment-form #therapists").val(data[0].c_therapist);
					$("#new-appointment-form #client_fee").val(data[0].t_fee);
				} else {
					console.log("no therapist assigned");
				}
			},
			error: (error) => {
				console.log("error", error);
			},
		});
	});

	$(document).on(
		"focus",
		"#therapists, #assessed-by, #referred-by",
		function () {
			sortSelect($(this));
		}
	);

	$(document).on("keyup", "#search", function () {
		var value = $(this).val().toLowerCase();
		console.log("searching", value);
		$(".table .table-row").filter(function () {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
		});
	});

	$(document).on("click", "#open-note-modal", function (event) {
		event.preventDefault();
		console.log("clicked edit button");
		if ($("#clientId").length == 1) {
			$("#clientId").val($(this).attr("href"));
		}
		if ($("#therapistId").length == 1) {
			$("#therapistId").val($(this).attr("href"));
		}
	});
	$(document).on("click", "#open-file-modal", function (event) {
		event.preventDefault();
		console.log("clicked add open file modal button", $(this).attr("href"));
		if ($("#clientID").length == 1) {
			$("#clientID").val($(this).attr("href"));
			console.log("clientID updated", $("#clientID").val());
		}
		if ($("#therapistID").length == 1) {
			$("#therapistID").val($(this).attr("href"));
			console.log("therapistID updated", $("#therapistID").val());
		}
	});

	$(document).on("click", "#save-client-note", function (event) {
		event.preventDefault();

		$.ajax({
			url: `/client/note/${$("#clientId").val()}`,
			data: $("#add-client-note").serialize(),
			dataType: "json",
			method: "POST",
			success: (data) => {
				console.log("note added:", data);
				window.location.href = `/client/${$("#clientId").val()}`;
			},
			error: (error) => console.log("error"),
		});
	});

	$(document).on("click", "#save-therapist-note", function (event) {
		event.preventDefault();

		$.ajax({
			url: `/therapist/note/${$("#therapistId").val()}`,
			data: $("#add-therapist-note").serialize(),
			dataType: "json",
			method: "POST",
			success: (data) => {
				console.log("note added:", data);
				window.location.href = `/therapist/${$("#therapistId").val()}`;
			},
			error: (error) => console.log("error"),
		});
	});

	$(document).on("click", "#save-client-file", function (event) {
		event.preventDefault();

		let formData = new FormData();
		formData.append("file", $("#client_file")[0].files[0]);
		console.log("formData", formData);

		$.ajax({
			url: `/client/${$("#clientID").val()}/addfile`,
			type: "POST",

			data: new FormData($("#add-client-file")[0]),

			cache: false,
			contentType: false,
			processData: false,
			success: (data) => {
				console.log("file added:", data);
				window.location.href = `/client/${$("#clientID").val()}`;
			},
			error: (error) => console.log("error"),

			xhr: function () {
				var myXhr = $.ajaxSettings.xhr();
				if (myXhr.upload) {
					myXhr.upload.addEventListener(
						"progress",
						function (e) {
							if (e.lengthComputable) {
								$("progress").attr({
									value: e.loaded,
									max: e.total,
								});
							}
						},
						false
					);
				}
				return myXhr;
			},
		});
	});

	$(document).on("click", ".appointment-paid", function () {
		let theSpan = $(this).find("span");
		console.log("paid clicked", theSpan.hasClass("not-paid"));
		if (theSpan.hasClass("not-paid")) {
			$.ajax({
				url: `/appointment/paid/${theSpan.attr("data_id")}`,
				type: "POST",
				dataType: "json",
				success: function (data) {
					console.log("data", data);
					theSpan.removeClass("not-paid").addClass("paid");
				},
				error: function (error) {
					console.log("error changing appointment to paid");
				},
			});
		}
	});

	$(document).on("click", "#save-therapist-file", function (event) {
		event.preventDefault();

		let formData = new FormData();
		formData.append("file", $("#therapist_file")[0].files[0]);
		console.log("formData", formData);

		$.ajax({
			url: `/therapist/${$("#therapistID").val()}/addfile`,
			type: "POST",

			data: new FormData($("#add-therapist-file")[0]),

			cache: false,
			contentType: false,
			processData: false,
			success: (data) => {
				console.log("file added:", data);
				window.location.href = `/therapist/${$("#therapistID").val()}`;
			},
			error: (error) => console.log("error"),

			xhr: function () {
				var myXhr = $.ajaxSettings.xhr();
				if (myXhr.upload) {
					myXhr.upload.addEventListener(
						"progress",
						function (e) {
							if (e.lengthComputable) {
								$("progress").attr({
									value: e.loaded,
									max: e.total,
								});
							}
						},
						false
					);
				}
				return myXhr;
			},
		});
	});
});

function slideIn(el) {
	el.parent().parent().addClass("toggled");
	$(".sidebar-heading").addClass("toggled");
	$(".nav-item span").hide();
	$(".sidebar-brand-text").hide();
	el.html('<i class="bi bi-arrow-right-circle"></i>');
}

function slideOut(el) {
	el.parent().parent().removeClass("toggled");
	$(".sidebar-heading").removeClass("toggled");
	$(".nav-item span").show();
	$(".sidebar-brand-text").show();
	el.html('<i class="bi bi-arrow-left-circle"></i>');
}

function getTooltip() {
	let eventsInterval = setInterval(() => {
		if ($(".fc-event-title").length > 0) {
			$(".fc-event-title").each(function () {
				$(this).attr("title", $(this).text());
				$(this).addClass("tt");
			});
			$(".fc-event-title").tooltip();
			clearInterval(eventsInterval);
		} else {
			$("button").tooltip();
			clearInterval(eventsInterval);
		}
	}, 100);
}

function errorMessage(error) {
	return '<div class="error">' + error + "</div>";
}

function sortSelect(selectToSort) {
	selectToSort.html(
		selectToSort.find("option").sort(function (x, y) {
			return $(x).text() > $(y).text() ? 1 : -1;
		})
	);
}

function activateDeactivate(el, activationType) {
	if (el.hasClass("btn-primary")) {
		el.addClass("btn-secondary");
		el.removeClass("btn-primary");
		let d_url = "/" + activationType + "/deactivate/" + el.val();
		console.log("url", d_url);
		$.ajax({
			url: d_url,
			success: function (d_data) {
				console.log("d_data", d_data);
				el.attr("title", "Activate");
				el.html('<i class="bi bi-person-x"></i> Inactive');
			},
		});
	} else {
		el.addClass("btn-primary");
		el.removeClass("btn-secondary");
		let a_url = "/" + activationType + "/activate/" + el.val();
		console.log("url", a_url);
		$.ajax({
			url: a_url,
			success: function (a_data) {
				console.log("a_data", a_data);
				el.attr("title", "Deactivate");
				el.html('<i class="bi bi-person-fill-check"></i> Active');
			},
		});
	}
}
