// Timezone data
const timezones = [
	{ name: "UTC", offset: 0 },
	{ name: "GMT", offset: 0 },
	{ name: "EST", offset: -5 },
	{ name: "EDT", offset: -4 },
	{ name: "CST", offset: -6 },
	{ name: "CDT", offset: -5 },
	{ name: "MST", offset: -7 },
	{ name: "MDT", offset: -6 },
	{ name: "PST", offset: -8 },
	{ name: "PDT", offset: -7 },
	{ name: "AKST", offset: -9 },
	{ name: "AKDT", offset: -8 },
	{ name: "HST", offset: -10 },
	{ name: "AST", offset: -4 },
	{ name: "NST", offset: -3.5 },
	{ name: "ART", offset: -3 },
	{ name: "BRT", offset: -3 },
	{ name: "WET", offset: 0 },
	{ name: "CET", offset: 1 },
	{ name: "CEST", offset: 2 },
	{ name: "EET", offset: 2 },
	{ name: "EEST", offset: 3 },
	{ name: "MSK", offset: 3 },
	{ name: "MSD", offset: 4 },
	{ name: "IST", offset: 5.5 },
	{ name: "PKT", offset: 5 },
	{ name: "BST", offset: 6 },
	{ name: "ICT", offset: 7 },
	{ name: "CST", offset: 8 },
	{ name: "SGT", offset: 8 },
	{ name: "AWST", offset: 8 },
	{ name: "JST", offset: 9 },
	{ name: "KST", offset: 9 },
	{ name: "ACST", offset: 9.5 },
	{ name: "AEST", offset: 10 },
	{ name: "AEDT", offset: 11 },
	{ name: "NZST", offset: 12 },
	{ name: "NZDT", offset: 13 },
	{ name: "CHST", offset: 10 },
	{ name: "SAST", offset: 2 },
	{ name: "WAT", offset: 1 },
	{ name: "CAT", offset: 2 },
	{ name: "EAT", offset: 3 },
];

const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

// Global variable for manual DST override
let manualDSTOverride = null;

// Function to manually set DST state
function setDaylightSaving(state) {
	manualDSTOverride = state;
	console.log(`Daylight Saving Time manually set to: ${state}`);
	const currentDate = new Date();
	const filteredTimezones = filterTimezones(currentDate);
	populateTimezoneDatalist(filteredTimezones);
}

// Expose the setDaylightSaving function globally
window.daySaving = setDaylightSaving;

// Helper function to get DST start date for a given year
function getDSTStartDate(year) {
	// Second Sunday in March for US
	return new Date(year, 2, 14 - new Date(year, 2, 1).getDay(), 2);
}

// Helper function to get DST end date for a given year
function getDSTEndDate(year) {
	// First Sunday in November for US
	return new Date(year, 10, 7 - new Date(year, 10, 1).getDay(), 2);
}

// Helper function to check if a date is within 2 weeks of another date
function isWithinTwoWeeks(date, targetDate) {
	const twoWeeks = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
	return Math.abs(date - targetDate) <= twoWeeks;
}

// Function to filter timezones based on DST rules
function filterTimezones(date) {
	const year = date.getFullYear();
	const dstStart = getDSTStartDate(year);
	const dstEnd = getDSTEndDate(year);

	let isDST;
	if (manualDSTOverride !== null) {
		isDST = manualDSTOverride;
	} else {
		isDST = date > dstStart && date < dstEnd;
	}

	const isNearDSTChange =
		isWithinTwoWeeks(date, dstStart) || isWithinTwoWeeks(date, dstEnd);

	return timezones.filter((tz) => {
		// Always show non-DST timezones
		if (!tz.name.endsWith("DT") && !tz.name.endsWith("ST")) {
			return true;
		}

		// Show both ST and DT versions during buffer periods, unless manually overridden
		if (isNearDSTChange && manualDSTOverride === null) {
			return true;
		}

		// Show DST versions during DST period, and standard versions outside DST period
		if (isDST) {
			return tz.name.endsWith("DT");
		} else {
			return tz.name.endsWith("ST");
		}
	});
}

// Populate timezone datalist
function populateTimezoneDatalist(filteredTimezones) {
	const timezoneList = document.getElementById("timezoneList");
	timezoneList.innerHTML = ""; // Clear existing options

	filteredTimezones.forEach((tz) => {
		const option = document.createElement("option");
		option.value = tz.name;
		timezoneList.appendChild(option);
	});
}

// Populate day datalist
function populateDayDatalist() {
	const dayList = document.getElementById("dayList");
	days.forEach((day) => {
		const option = document.createElement("option");
		option.value = day;
		dayList.appendChild(option);
	});
}

// Display user's timezone
function displayUserTimezone() {
	const userTimezone = Intl.DateTimeFormat("en-US", {
		timeZoneName: "long",
	}).format(new Date());

	const timezoneDiv = document.getElementById("userTimezone");
	timezoneDiv.textContent = `Your Timezone: ${userTimezone}`;
}

// Convert time and update display
function convertTime() {
	const selectedTimezone = document.getElementById("timezoneInput").value;
	const selectedDay = document.getElementById("dayInput").value;
	const hoursInput = document.getElementById("hoursInput").value;
	const minutesInput = document.getElementById("minutesInput").value;
	const amPm = document.getElementById("amPmToggle").textContent;

	if (!selectedTimezone || !selectedDay || !hoursInput || !minutesInput) {
		alert("Please fill in all fields");
		return;
	}

	let hours = parseInt(hoursInput);
	let minutes = parseInt(minutesInput);

	// Adjust hours based on AM/PM
	if (amPm === "PM" && hours !== 12) {
		hours += 12;
	} else if (amPm === "AM" && hours === 12) {
		hours = 0;
	}

	const inputDate = new Date();
	inputDate.setHours(hours);
	inputDate.setMinutes(minutes);

	const filteredTimezones = filterTimezones(inputDate);
	const convertedTimesDiv = document.getElementById("convertedTimes");
	convertedTimesDiv.innerHTML = "";

	// Calculate and display the converted time
	filteredTimezones.forEach((tz) => {
		const convertedTime = new Date(
			inputDate.getTime() +
				(tz.offset -
					filteredTimezones.find((t) => t.name === selectedTimezone)
						.offset) *
					3600000
		);
		const timeString = convertedTime.toLocaleTimeString([], {
			hour: "numeric",
			minute: "2-digit",
		});
		const dayOfWeek = days[convertedTime.getDay()]; // Get the day of the week
		const timezoneDiv = document.createElement("div");
		timezoneDiv.className = "timezone-item";
		timezoneDiv.textContent = `[${tz.name}] ${dayOfWeek}: ${timeString}`; // Include day of the week
		convertedTimesDiv.appendChild(timezoneDiv);
	});

	updateShareLink();
}

// Toggle AM/PM button text
function toggleAmPm() {
	const amPmToggle = document.getElementById("amPmToggle");
	amPmToggle.textContent = amPmToggle.textContent === "AM" ? "PM" : "AM";
}

// Update share link
function updateShareLink() {
	const shareLink = document.getElementById("shareLink");
	const params = new URLSearchParams(window.location.search);
	params.set("timezone", document.getElementById("timezoneInput").value);
	params.set("day", document.getElementById("dayInput").value);
	params.set("time", document.getElementById("timeInput").value);
	params.set("ampm", document.getElementById("amPmToggle").textContent);
	shareLink.value = `${window.location.origin}${
		window.location.pathname
	}?${params.toString()}`;
}

// Copy share link to clipboard
function copyShareLink() {
	const shareLink = document.getElementById("shareLink");
	shareLink.select();
	document.execCommand("copy");
	alert("Link copied to clipboard!");
}
// Display user's timezone in the desired format
// Display user's timezone in the desired format
function displayUserTimezone() {
	// Get the user's timezone short name
	const userTimezoneShort = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// Get the current date and time
	const now = new Date();

	// Format the current time (HH:MM AM/PM)
	const optionsTime = {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
		timeZone: userTimezoneShort,
	};
	const formattedTime = new Intl.DateTimeFormat("en-US", optionsTime).format(
		now
	);

	// Format the current date (DD/MM/YYYY)
	const optionsDate = {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: userTimezoneShort,
	};
	const formattedDate = new Intl.DateTimeFormat("en-GB", optionsDate).format(
		now
	);

	// Combine all parts into the final string
	const timezoneDiv = document.getElementById("userTimezone");
	timezoneDiv.textContent = `[${userTimezoneShort}] ${formattedTime} ${formattedDate}`;
}

// Initialize the page
function init() {
	manualDSTOverride = null; // Reset manual override on page load
	const currentDate = new Date();
	const filteredTimezones = filterTimezones(currentDate);
	populateTimezoneDatalist(filteredTimezones);
	populateDayDatalist();
	displayUserTimezone(); // Call to display user's timezone

	document
		.getElementById("convertBtn")
		.addEventListener("click", convertTime);
	document.getElementById("amPmToggle").addEventListener("click", toggleAmPm);
	document.getElementById("copyBtn").addEventListener("click", copyShareLink);

	// Check for shared link parameters
	const params = new URLSearchParams(window.location.search);
	if (
		params.has("timezone") &&
		params.has("day") &&
		params.has("time") &&
		params.has("ampm")
	) {
		document.getElementById("timezoneInput").value = params.get("timezone");
		document.getElementById("dayInput").value = params.get("day");
		document.getElementById("timeInput").value = params.get("time");
		document.getElementById("amPmToggle").textContent = params.get("ampm");
		convertTime();
	}
}

window.addEventListener("load", init);
