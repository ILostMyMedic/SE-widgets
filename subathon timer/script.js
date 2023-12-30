// settings
let eventsLimit = 5,
	userLocale = "en-US",
	includeFollowers = true,
	includeRedemptions = true,
	includeHosts = true,
	minHost = 0,
	includeRaids = true,
	minRaid = 0,
	includeSubs = true,
	includeTips = true,
	minTip = 0,
	includeCheers = true,
	minCheer = 0;

// session data
let userCurrency,
	totalEvents = 0,
	totalLogs = 0;

// clock is a countdown in seconds starting at 10h
let clock = new Date(new Date().getTime() + 1 * 60 * 60 * 1000);

let outcomes = [
	{
		name: "subscriber",
		label: "Subscribed",
		chances: [
			{
				chance: 70,
				action: () => {
					addTime(100);
				},
			},
			{
				chance: 30,
				action: () => {
					removeTime(100);
				},
			},
		],
	},
	{
		name: "cheer",
		label: "Cheered",
		chances: [
			{
				chance: 70,
				action: () => {
					addTime(10);
				},
			},
			{
				chance: 30,
				action: () => {
					removeTime(10);
				},
			},
		],
	},
	{
		name: "tip",
		label: "Tipped",
		chances: [
			{
				chance: 70,
				action: () => {
					addTime(10);
				},
			},
			{
				chance: 30,
				action: () => {
					removeTime(10);
				},
			},
		],
	},
	{
		name: "raid",
		label: "Raided",
		chances: [
			{
				chance: 70,
				action: () => {
					addTime(10);
				},
			},
			{
				chance: 30,
				action: () => {
					removeTime(10);
				},
			},
		],
	},
	{
		name: "follower",
		label: "Followed",
		chances: [
			{
				chance: 70,
				action: () => {
					addTime(10);
				},
			},
			{
				chance: 30,
				action: () => {
					removeTime(10);
				},
			},
		],
	},
	{
		name: "redemption",
		label: "Redeemed",
		chances: [
			{
				chance: 70,
				action: () => {
					addTime(10);
				},
			},
			{
				chance: 29,
				action: () => {
					removeTime(10);
				},
			},
			{
				chance: 1,
				action: () => {
					addTime(1000);
				},
			},
		],
	},
];

function PerformAction(actions) {
	let total = 0;
	actions.forEach((action) => {
		total += action.chance;
	});

	let rand = Math.floor(Math.random() * total);
	let chance = 0;
	for (let i = 0; i < actions.length; i++) {
		chance += actions[i].chance;
		if (rand < chance) {
			actions[i].action();
			break;
		}
	}
}

function listenerAction(action) {
	let outcome = outcomes.find((outcome) => outcome.name === action);
	if (outcome) {
		PerformAction(outcome.chances);
	}
}

window.addEventListener("onEventReceived", function (obj) {
	if (!obj.detail.event) {
		return;
	}
	if (typeof obj.detail.event.itemId !== "undefined") {
		obj.detail.listener = "redemption-latest";
	}
	const listener = obj.detail.listener.split("-")[0];
	const event = obj.detail.event;

	// trigger listenerAction
	listenerAction(listener);

	if (listener === "follower") {
		if (includeFollowers) {
			addEvent("follower", "Followed", event.name);
		}
	} else if (listener === "redemption") {
		if (includeRedemptions) {
			addEvent("redemption", "Redeemed", event.name);
		}
	} else if (listener === "subscriber") {
		if (includeSubs) {
			if (event.gifted) {
				addEvent("sub", `Sub gift`, event.name);
			} else {
				addEvent("sub", `Sub X${event.amount}`, event.name);
			}
		}
	} else if (listener === "host") {
		if (includeHosts && minHost <= event.amount) {
			addEvent(
				"host",
				`Host ${event.amount.toLocaleString()}`,
				event.name
			);
		}
	} else if (listener === "cheer") {
		if (includeCheers && minCheer <= event.amount) {
			addEvent(
				"cheer",
				`${event.amount.toLocaleString()} Bits`,
				event.name
			);
		}
	} else if (listener === "tip") {
		if (includeTips && minTip <= event.amount) {
			if (event.amount === parseInt(event.amount)) {
				addEvent(
					"tip",
					event.amount.toLocaleString(userLocale, {
						style: "currency",
						minimumFractionDigits: 0,
						currency: userCurrency.code,
					}),
					event.name
				);
			} else {
				addEvent(
					"tip",
					event.amount.toLocaleString(userLocale, {
						style: "currency",
						currency: userCurrency.code,
					}),
					event.name
				);
			}
		}
	} else if (listener === "raid") {
		if (includeRaids && minRaid <= event.amount) {
			addEvent(
				"raid",
				`Raid ${event.amount.toLocaleString()}`,
				event.name
			);
		}
	}
});

window.addEventListener("onWidgetLoad", function (obj) {
	let recents = obj.detail.recents;
	recents.sort(function (a, b) {
		return Date.parse(a.createdAt) - Date.parse(b.createdAt);
	});
	userCurrency = obj.detail.currency;
	const fieldData = obj.detail.fieldData;
	eventsLimit = fieldData.eventsLimit;
	includeFollowers = fieldData.includeFollowers === "yes";
	includeRedemptions = fieldData.includeRedemptions === "yes";
	includeHosts = fieldData.includeHosts === "yes";
	minHost = fieldData.minHost;
	includeRaids = fieldData.includeRaids === "yes";
	minRaid = fieldData.minRaid;
	includeSubs = fieldData.includeSubs === "yes";
	includeTips = fieldData.includeTips === "yes";
	minTip = fieldData.minTip;
	includeCheers = fieldData.includeCheers === "yes";
	minCheer = fieldData.minCheer;
	direction = fieldData.direction;
	userLocale = fieldData.locale;
	fadeoutTime = fieldData.fadeoutTime;

	let eventIndex;
	for (eventIndex = 0; eventIndex < recents.length; eventIndex++) {
		const event = recents[eventIndex];

		if (event.type === "follower") {
			if (includeFollowers) {
				addEvent("follower", "Follower", event.name);
			}
		} else if (event.type === "redemption") {
			if (includeRedemptions) {
				addEvent("redemption", "Redeemed", event.name);
			}
		} else if (event.type === "subscriber") {
			if (!includeSubs) continue;
			if (event.amount === "gift") {
				addEvent("sub", `Sub gift`, event.name);
			} else {
				addEvent("sub", `Sub X${event.amount}`, event.name);
			}
		} else if (event.type === "host") {
			if (includeHosts && minHost <= event.amount) {
				addEvent(
					"host",
					`Host ${event.amount.toLocaleString()}`,
					event.name
				);
			}
		} else if (event.type === "cheer") {
			if (includeCheers && minCheer <= event.amount) {
				addEvent(
					"cheer",
					`${event.amount.toLocaleString()} Bits`,
					event.name
				);
			}
		} else if (event.type === "tip") {
			if (includeTips && minTip <= event.amount) {
				if (event.amount === parseInt(event.amount)) {
					addEvent(
						"tip",
						event.amount.toLocaleString(userLocale, {
							style: "currency",
							minimumFractionDigits: 0,
							currency: userCurrency.code,
						}),
						event.name
					);
				} else {
					addEvent(
						"tip",
						event.amount.toLocaleString(userLocale, {
							style: "currency",
							currency: userCurrency.code,
						}),
						event.name
					);
				}
			}
		} else if (event.type === "raid") {
			if (includeRaids && minRaid <= event.amount) {
				addEvent(
					"raid",
					`Raid ${event.amount.toLocaleString()}`,
					event.name
				);
			}
		}
	}
});

// adding element
function addEvent(type, text, username) {
	totalEvents += 1;
	let element = `
        <div class="event-container" id="event-${totalEvents}">
        <div class="username-container">${username}</div>
        <div class="details-container">${text}</div>
        <div class="event-image event-${type}"></div>
        </div>`;

	$("#events").removeClass("fadeOutClass").show().prepend(element);

	if (totalEvents > eventsLimit) {
		removeEvent(totalEvents - eventsLimit);
	}
}

// removing element
function removeEvent(eventId) {
	$(`#event-${eventId}`).animate(
		{
			height: 0,
			opacity: 0,
		},
		"slow",
		function () {
			$(`#event-${eventId}`).remove();
		}
	);
}

// add time to clock
function addTime(time) {
	// dont allow adding time if the clock is already at 0
	if (clock.getTime() < new Date().getTime()) {
		return;
	}

	// clock = new Date(clock.getTime() + time * 1000);
	timerLog(`+${time}s`, true);
}
// remove time from clock
function removeTime(time) {
	// if the time left is already less than 1h, don't remove time
	if (clock.getTime() - time * 1000 < new Date().getTime() + 60 * 60 * 1000) {
		console.log("less than 1h left");
		return;
	}

	// dont allow removing time if the clock is already at 0
	if (clock.getTime() - time * 1000 < new Date().getTime()) {
		return;
	}

	clock = new Date(clock.getTime() - time * 1000);
	timerLog(`-${time}s`, false);
}

function timerLog(log, added) {
	totalLogs += 1;
	$("#log")
		.removeClass("fadeOutClass")
		.show()
		.append(
			`<div class="timer-log ${
				added ? "added" : "removed"
			}" id="timeLog-${totalLogs}">${log}</div>`
		);

	setTimeout(() => {
		removeLog(totalLogs);
	}, 3000);
}

function removeLog(logId) {
	$(`#timeLog-${logId}`).animate(
		{
			height: 0,
			opacity: 0,
		},
		"slow",
		function () {
			$(`#timeLog-${logId}`).remove();
		}
	);
}

// generate timer
(() => {
	// timer element
	let element = `<div class="timer-container">
        <h1>
			<span id="days">0d</span>
            <span id="hours">0h</span>
            <span id="minutes">0m</span>
            <span id="seconds">0s</span>
        </h1>
    </div>`;

	// updates the clock
	const updateClock = () => {
		const diff = clock - new Date(); // in ms
		const total = Math.floor(diff / 1000); // in seconds
		const days = Math.floor(total / 86400); // in days
		const hours = Math.floor(total / 3600); // in hours
		const minutes = Math.floor((total / 60) % 60); // in minutes
		const seconds = Math.floor(total % 60); // in seconds

		// if no days, hide days
		if (days <= 0) {
			$("#days").hide();
		} else {
			$("#days").show();
			// set #days and add "d" to the end
			$("#days").text(days.toString().padStart(2, "0") + "d");
		}

		// if no hours, hide hours
		if (hours <= 0 && days <= 0) {
			$("#hours").hide();
		} else {
			$("#hours").show();
			$("#hours").text(hours.toString().padStart(2, "0") + "h");
		}

		// if no minutes, hide minutes
		if (minutes <= 0 && hours <= 0) {
			$("#minutes").hide();
		} else {
			$("#minutes").show();
			$("#minutes").text(minutes.toString().padStart(2, "0") + "m");
		}

		// always show seconds
		$("#seconds").text(seconds.toString().padStart(2, "0") + "s");
	};

	// append element to timer
	$("#timer").append(element);
	// update clock every second
	setInterval(updateClock, 1000);
})();

// ===================  TESTING  ===================
const testing = (username) => {
	const events = [
		{
			type: "follower",
			label: "Followed",
		},
		{
			type: "redemption",
			label: "Redeemed",
		},
		{
			type: "subscriber",
			label: "Subbed",
		},
		{
			type: "cheer",
			label: "Cheered",
		},
		{
			type: "tip",
			label: "Tipped",
		},
		{
			type: "raid",
			label: "Raided",
		},
	];

	setTimeout(() => {
		const event = events[Math.floor(Math.random() * events.length)];
		// trigger eventListener
		window.dispatchEvent(
			new CustomEvent("onEventReceived", {
				detail: {
					listener: event.type,
					event: {
						name: username,
						amount: Math.floor(Math.random() * 1000),
					},
				},
			})
		);

		// repeat
		testing(username);
	}, 3000);
};
// testing
testing("ILostMyMedic");
