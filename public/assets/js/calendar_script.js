document.addEventListener("DOMContentLoaded", async function () {
	const response = await fetch("/allappointments");
	const appointments = await response.json();

	// console.log("The appoimtments are:", appointments);

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
				appointment.a_end_time,
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
			extendedProps: "",
			source: null,
		};
		events.push(newEvent);
	}

	// console.log("events", events);

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

	calendar.render();
});

function showSpinner(x, y) {
	$("body").append(
		'<div class="lds-spinner modal-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div>'
	);
	$(".modal-spinner").css("left", x - 40 + "px");
	$(".modal-spinner").css("top", y - 40 + "px");
}
