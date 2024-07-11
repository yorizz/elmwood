$(document).ready(function () {
	// Use the plugin once the DOM has been loaded.
	console.log("loading script");

	let loc = window.location.href;
	console.log("loc", loc, loc.indexOf("/newenquiry"));
	if (
		loc.indexOf("/newenquiry") >= 1 ||
		(loc.indexOf("client") >= 1 && loc.indexOf("edit") >= 1)
	) {
		$(function () {
			console.log("running the multi select function");
			// Apply the plugin
			var notifications = $("#notifications");

			function createNotification(event, label) {
				var n = $(document.createElement("span"))
					.text(event + " " + label + "  ")
					.addClass("notification")
					.appendTo(notifications)
					.fadeOut(3000, function () {
						n.remove();
					});
			}
			var newQueryTherapyTypeRequests = $(
				"#therapy_types_requested"
			).filterMultiSelect({
				// selectAllText: "all...",
				placeholderText: "Select one or more",
				filterText: "search",
				labelText: "",
				caseSensitive: false,
			});

			$("#form").on("keypress keyup", function (e) {
				var keyCode = e.keyCode || e.which;
				if (keyCode === 13) {
					e.preventDefault();
					return false;
				}
			});
		});
	}

	if (loc.indexOf("/addsupervisionsession") >= 1) {
		$(function () {
			console.log("running the multi select function");
			// Apply the plugin
			var notifications = $("#notifications");

			function createNotification(event, label) {
				var n = $(document.createElement("span"))
					.text(event + " " + label + "  ")
					.addClass("notification")
					.appendTo(notifications)
					.fadeOut(3000, function () {
						n.remove();
					});
			}
			var newQueryTherapyTypeRequests = $("#trainees").filterMultiSelect({
				// selectAllText: "all...",
				placeholderText: "Select one or more",
				filterText: "search",
				labelText: "",
				caseSensitive: false,
			});

			$("#form").on("keypress keyup", function (e) {
				var keyCode = e.keyCode || e.which;
				if (keyCode === 13) {
					e.preventDefault();
					return false;
				}
			});
		});
	}
});
