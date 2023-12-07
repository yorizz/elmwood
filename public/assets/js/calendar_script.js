let viewedMonths = [];

document.addEventListener("DOMContentLoaded", async function () {
	let response = await fetch("/allappointments/notcancelled");
	let appointments = await response.json();

	console.log("The appointments are:", appointments);

	let events = await buildAppointments(appointments);

	console.log("events", events);

	var calendarEl = document.getElementById("calendar");

	const currentDate = new Date().toISOString().split("T")[0];
	var calendar = new FullCalendar.Calendar(calendarEl, {
		locale: "ie",
		initialView: "dayGridMonth",
		firstDay: 1,
		initialDate: currentDate,
		headerToolbar: {
			left: "prev,next today",
			center: "title",
			right: "dayGridMonth,timeGridWeek,timeGridDay",
		},
		events: events,
		editable: true,
	});

	calendar.on("dateClick", function (info) {
		console.log("clicked on " + info.dateStr, $(this), info.jsEvent.clientX);

		showSpinner(info.jsEvent.clientX, info.jsEvent.clientY);

		let theModal = new bootstrap.Modal($("#theModal"), {
			backdrop: "static",
		});

		let url = "/addappointment/" + info.dateStr;

		console.log(
			"toggling",
			$(".modal-body").load(
				url,
				() => {
					theModal.toggle();
				},
				() => {
					$(".modal-spinner").remove();
				}
			)
		);
	});

	$(document).on("click", ".fc-prev-button, .fc-next-button", async (info) => {
		let months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		let monthElement = $("h2.fc-toolbar-title");
		let currentMonthAndYear = monthElement.text().split(" ");

		console.log(
			"currentMonthAndYear",
			currentMonthAndYear,
			"viewedMonths",
			viewedMonths
		);
		if (viewedMonths.indexOf(monthElement.text()) <= -1) {
			showSpinner($(document).width() / 2, $(document).height() / 2);
			console.log("Not in viewedMonths");

			let currentmonth = currentMonthAndYear[0];
			let currentyear = currentMonthAndYear[1];

			let constructedDate =
				currentyear +
				"" +
				(months.indexOf(currentmonth) + 1 < 10
					? "0" + (months.indexOf(currentmonth) + 1)
					: months.indexOf(currentmonth) + 1) +
				"01";
			console.log("constructedDate", constructedDate);

			response = await fetch(
				"/allappointments/notcancelled/" + constructedDate
			);

			appointments = await response.json();
			let events = await buildAppointments(appointments);
			console.log("events", events);

			calendar.addEventSource(events);
			$(".modal-spinner").remove();
			viewedMonths.push(monthElement.text());

			let tooltipTriggerList = document.querySelectorAll(
				'[data-bs-toggle="tooltip"]'
			);
			let tooltipList = [...tooltipTriggerList].map(
				(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
			);

			getTooltip();
		}
		calendar.refetchEvents();
	});

	calendar.render();
	try {
		viewedMonths.push($("h2.fc-toolbar-title").text());
	} catch (error) {
		console.log("error", error);
	}

	calendar.on("eventClick", function (info) {
		console.log("event", info.event._def);

		let theModal = new bootstrap.Modal($("#theModal"), {
			backdrop: "static",
		});
		let theAppointmentID = info.event._def.publicId;

		let theAppointmentHTML = info.event._def.title;

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
				"</form>"
		);
		$("#submit-new-appointment")
			.attr("id", "submit-cancel-appointment")
			.text("Save");

		$("#submit-cancel-appointment").attr(
			"data-appointment-id",
			theAppointmentID
		);

		// console.log("id changed to ", theAppointmentID);

		theModal.toggle();
	});
});

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

function showSpinner(x, y) {
	$("body").append(
		'<div class="lds-spinner modal-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div>'
	);
	$(".modal-spinner").css("left", x - 40 + "px");
	$(".modal-spinner").css("top", y - 40 + "px");
}

async function buildAppointments(appointments) {
	let events = [];
	for (let i = 0; i < appointments.length; i++) {
		let appointment = appointments[i];

		let newEvent = {
			id: appointment.a_ID,
			groupId: "",
			allDay: false,
			start:
				appointment.a_date.split("T")[0] + " " + appointment.a_start_time,
			end: appointment.a_date.split("T")[0] + " " + appointment.a_end_time,
			startStr: "",
			endStr: "",
			title:
				appointment.c_first_name +
				" " +
				appointment.c_surname +
				" - " +
				appointment.t_first_name +
				" " +
				appointment.t_surname +
				" | " +
				appointment.a_start_time +
				" - " +
				appointment.a_end_time +
				" | Room " +
				appointment.a_room,
			url: "",
			classNames: "",
			editable: true,
			startEditable: true,
			durationEditable: true,
			resourceEditable: true,
			display: "auto",
			overlap: true,
			constraint: "",
			backgroundColor: appointment.t_colour,
			borderColor: "",
			textColor: "",
			extendedProps: {
				appointment: appointment.a_ID,
			},
			source: null,
		};

		events.push(newEvent);
	}
	return events;
}
