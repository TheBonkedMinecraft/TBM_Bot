const { Events, ActivityType } = require('discord.js');
const { FSDB } = require("file-system-db");
const usernames = new FSDB("./usernames.json", true);
let status = [
	{
		name: "to Wii Sports Bowling Sounds",
		type: ActivityType.Listening,
	},
	{
		name: "TBM missing 1st place by a pin",
		type: ActivityType.Watching,
	},
	{
		name: "Beth gobble entire box of kitkats",
		type: ActivityType.Watching,
	},
	{
		name: "Fake TBM OnlyFans Link",
		type: ActivityType.Watching,
	},
	{
		name: "with myself",
		type: ActivityType.Playing,
	},
	{
		name: "you : )",
		type: ActivityType.Watching,
	},
	{
		name: "The Bonked Minecraft",
		type: ActivityType.Watching
	},
	{
		name: "The Bonked Minecraft",
		type: ActivityType.Playing
	}
]

async function makeRequest(id, token, command) {
	let params = {}

	params["id"] = id
	params["token"] = token
	params["command"] = command

	const encodedparams = new URLSearchParams(params)
	const init = {
		method: 'POST',
		body: encodedparams,
	};
	return fetch(process.env.serverRequestURL, init)
}

function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time))
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		setInterval(() => {
			let random = Math.floor(Math.random() * status.length);
			client.user.setActivity(status[random]);
		}, 30000);
	}
};