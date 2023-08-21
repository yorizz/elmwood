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
		initialDate: currentDate,
		headerToolbar: {
			left: "prev,next today",
			center: "title",
			right: "dayGridMonth,timeGridWeek,timeGridDay",
		},
		events: events,
		eventClick: function (info) {
			eventCLickHandler(info);
		},
		editable: true,
	});

	calendar.on("dateClick", function (info) {
		console.log("clicked on " + info.dateStr);

		let theModal = new bootstrap.Modal($("#theModal"), {});

		let url = "/addappointment/" + info.dateStr;

		console.log(
			$(".modal-body").load(url, () => {
				theModal.toggle();
			})
		);
	});

	calendar.render();
});

function eventCLickHandler(info) {
	console.log("info", info);
	console.log(
		"start",
		info.event._instance.range.start.toString().split(" ")[4]
	);
	console.log("Event: " + info.event.title);
	console.log("ID:", info.event.id);
	console.log("Coordinates: " + info.jsEvent.pageX + "," + info.jsEvent.pageY);
	console.log("View: " + info.view.type);
}
