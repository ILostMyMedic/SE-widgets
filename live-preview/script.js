// settings
let channel = "ilostmymedic",
	broadcaster = "ilostmymedic";

window.addEventListener("onWidgetLoad", function (obj) {
	broadcaster = obj["detail"]["channel"]["username"];
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
	if (userstate.badges.broadcaster) {
		// userstate.mod
		if (message.charAt(0) !== "!") {
			return;
		}

		if (message.startsWith("!setpreview")) {
			document.getElementById("container").style.display = "block";
			let newChannel = message.split(" ")[1];
			// if username starts with @, remove it
			if (newChannel.charAt(0) === "@") {
				newChannel = newChannel.substring(1);
			}
			if (newChannel) {
				channel = newChannel;
				document.getElementById("preview").innerHTML = "";
				// update the twitch.player instance
				new Twitch.Player("preview", {
					channel: channel,
					muted: true,
					controls: false,
					layout: "video",
					parent: ["streamelements.com"],
					width: "100%",
					height: "100%",
					autoplay: true,
				});

				previewDetails(channel);
			}
		}
		// stop preview
		if (message.startsWith("!stoppreview")) {
			document.getElementById("preview").innerHTML = "";
			document.getElementById("container").style.display = "none";
		}
	}
});

function html_encode(e) {
	return e.replace(/[\<\>\"\^]/g, function (e) {
		return "&#" + e.charCodeAt(0) + ";";
	});
}

function previewDetails(user) {
	let previewElement = `
		<div class="preview-details">
			<div class="preview-details__user">
				<span class="preview-details__user-name">https://twitch.tv/<strong>${user}</string></span>
			</div>
		</div>
	`;

	let details = document.getElementById("details");

	details.innerHTML = previewElement;
}

// TESTING ====================================================
// send !setpreview to start preview
function playtest() {
	let event = {
		detail: {
			listener: "message",
			event: {
				data: {
					text: "!setpreview @derna",
					displayName: "ilostmymedic",
					tags: {
						broadcaster: 1,
					},
				},
			},
		},
	};
	window.dispatchEvent(new CustomEvent("onEventReceived", event));
}

// send !stoppreview to stop preview
function stoptest() {
	let event = {
		detail: {
			listener: "message",
			event: {
				data: {
					text: "!stoppreview",
					displayName: "ilostmymedic",
					tags: {
						broadcaster: 1,
					},
				},
			},
		},
	};
	window.dispatchEvent(new CustomEvent("onEventReceived", event));
}

playtest();

// setTimeout(() => {}, 5000);
