console.log("opening page", window.document.location.href);

$(document).ready(function () {
	console.log("page loaded");

	$(document).on("click", "#sidebarToggle", function () {
		let el = $(this);

		if (el.parent().parent().hasClass("toggled")) {
			slideOut(el);
		} else {
			slideIn(el);
		}
	});

	// console.log("events length", $(".fc-event-title").length);

	if (window.location.href.indexOf("/calendar") >= 1) {
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

	// this is the close modal button
	$(document).on("click", "button[data-bs-dismiss]", () => {
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
		}
	}, 100);
}

function errorMessage(error) {
	return '<div class="error">' + error + "</div>";
}
