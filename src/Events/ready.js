const { Events, ActivityType } = require('discord.js');

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

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		setInterval(() => {
			let random = Math.floor(Math.random() * status.length);
			client.user.setActivity(status[random]);
		}, 30000);
	}
};