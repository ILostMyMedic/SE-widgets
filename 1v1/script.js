// settings
let broadcaster,
	teamAlias = [
		{ team: "blue", alias: ["medic"], score: 0 },
		{ team: "red", alias: ["omni"], score: 0 },
	];

const redElement = document.getElementById("red");
const blueElement = document.getElementById("blue");

window.addEventListener("onWidgetLoad", function (obj) {
	broadcaster = obj["detail"]["channel"]["username"];

	// load scores
	let redScore = teamAlias.find((t) => t.team === "red").score;
	let blueScore = teamAlias.find((t) => t.team === "blue").score;
	redElement.innerText = redScore;
	blueElement.innerText = blueScore;
});

window.addEventListener("onEventReceived", function (obj) {
	if (obj.detail.listener !== "message") return;
	let data = obj.detail.event.data;
	let message = html_encode(data["text"]);
	let user = data["displayName"].toLowerCase();
	let userstate = {
		mod: parseInt(data.tags.mod),
		badges: {
			broadcaster: user === broadcaster,
		},
	};
	if (userstate.badges.broadcaster || userstate.mod) {
		if (message.charAt(0) !== "!") return;
		if (message.startsWith("!vs")) {
			let args = message.split(" ");
			if (args.length < 2) return;
			// arg 1 is add|remove|clear
			let command = args[1].toLowerCase();
			// arg 2 is team or alias
			let team = args[2].toLowerCase();
			// arg 3 is points unless arg 1 is clear

			// get the team based on either name or alias
			let teamIndex = teamAlias.findIndex((t) => {
				return t.team === team || t.alias.includes(team);
			});

			if (teamIndex === -1) return;

			if (command === "add") {
				// arg 4 is points
				let points = parseInt(args[3]);
				if (isNaN(points)) return;
				teamAlias[teamIndex].score += points;

				// update the score
				if (teamAlias[teamIndex].team === "red") {
					redElement.innerText = teamAlias[teamIndex].score;
				} else {
					blueElement.innerText = teamAlias[teamIndex].score;
				}
			}

			if (command === "remove") {
				// arg 4 is points
				let points = parseInt(args[3]);
				if (isNaN(points)) return;
				teamAlias[teamIndex].score -= points;

				// update the score
				if (teamAlias[teamIndex].team === "red") {
					redElement.innerText = teamAlias[teamIndex].score;
				} else {
					blueElement.innerText = teamAlias[teamIndex].score;
				}
			}

			if (command === "clear") {
				teamAlias[teamIndex].score = 0;

				// update the score
				if (teamAlias[teamIndex].team === "red") {
					redElement.innerText = teamAlias[teamIndex].score;
				} else {
					blueElement.innerText = teamAlias[teamIndex].score;
				}
			}
		}
	}
});

function html_encode(e) {
	return e.replace(/[\<\>\"\^]/g, function (e) {
		return "&#" + e.charCodeAt(0) + ";";
	});
}
