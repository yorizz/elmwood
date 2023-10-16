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

	$(document).on("click", ".sidebar a", function () {
		$(this).append(
			'<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>'
		);
	});

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
		console.log("#therapist-activation clicked!");

		if ($("#therapist-activation").hasClass("btn-primary")) {
			console.log("yes remove primary");
			$("#therapist-activation").addClass("btn-secondary");
			$("#therapist-activation").removeClass("btn-primary");
		}
		if ($("#therapist-activation").hasClass("btn-secondary")) {
			// $("#therapist-activation").addClass("btn-primary");
			// $("#therapist-activation").removeClass("btn-secondary");
		}
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
		theAppointmentID = $(this).attr("data-appointment");
		console.log("APPOINTMENT-ID", theAppointmentID);
		let theAppointmentHTML = $(this).parent().parent()[0].innerHTML;

		$(".modal-title").text("Cancel Appointment");
		$(".modal-body").html(theAppointmentHTML);
		$(".modal-body .appointment-cancel-button ").remove();
		$(".modal-body").append(
			'<form action="/cancelappointment/' +
				theAppointmentID +
				'" method="POST" id="cancel-appointment-form">' +
				'<label for="cancellation_reason" class="form-label">Reason for cancelling this appointment</label>' +
				'<textarea class="form-control" id="cancellation_reason" name="cancellation_reason" rows="5" required="required"></textarea>' +
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

		theModal.toggle();
	});

	$(document).on("click", "#submit-cancel-appointment", function (event) {
		event.preventDefault();

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
					theModal.toggle();
					//find the row with the appointment ID
					$(`[data-appointment=${theAppointmentID}]`).addClass(
						"cancelled-appointment"
					);
					theAppointmentID = null;
				},
				error: function (error) {
					console.log("error", error);
				},
			});
		}
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
						window.location = "/calendar";
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
		$(".table .table-row").filter(function () {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
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
