require("dotenv").config();

const fs = require("fs");
const { FSDB } = require("file-system-db");
const path = require("path");
const CronJob = require('cron').CronJob;

const usernames = new FSDB("./usernames.json", true);

const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Registering Commands

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'Commands');
const commandFolders = fs.readdirSync(foldersPath);

const errorChannelId = process.env.errorReportChannelId;



for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Event Handling

const eventsPath = path.join(__dirname, 'Events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Error Handling

process.on("unhandledRejection", async (reason, promise) => {
	console.error("Unhandled promise rejection:", reason, promise);
	const newEmbed = new EmbedBuilder()
		.setTitle("Anti-Crash System")
		.setColor("Red")
		.setTimestamp()
		.setFooter({ text: "TBM Bot - The Bonked Minecraft", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" })
		.setTitle("Error Encountered");
	const Channel = client.channels.cache.get(errorChannelId);
	if (!Channel) return;
	Channel.send({
		embeds: [
			newEmbed.setDescription(
				"**Unhandled Rejection/Catch:\n\n** ```" + reason + "```"
			),
		],
	});
});

process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err);
	const Embed = new EmbedBuilder()
		.setTitle("Anti-Crash System")
		.setColor("Red")
		.setTimestamp()
		.setFooter({ text: "TBM Bot - The Bonked Minecraft", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" })
		.setTitle("Error Encountered");
	const Channel = client.channels.cache.get(errorChannelId);
	if (!Channel) return;
	Channel.send({
		embeds: [
			Embed.setDescription(
				"**Uncaught Exception:\n\n** ```" + err + "```"
			),
		],
	});
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
	console.error("Uncaught Exception:", err);
	const Embed = new EmbedBuilder()
		.setTitle("Anti-Crash System")
		.setColor("Red")
		.setTimestamp()
		.setFooter({ text: "TBM Bot - The Bonked Minecraft", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" })
		.setTitle("Error Encountered");
	const Channel = client.channels.cache.get(errorChannelId);
	if (!Channel) return;
	Channel.send({
		embeds: [
			Embed.setDescription(
				"**Uncaught Exception:\n\n** ```" + err + "``` -- Origin: ```" + origin + "```"
			),
		],
	});
});

// Logging in, status, etc

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
	return new Promise(resolve => setTimeout(resolve, time));
}

function returnAmount() {
	var users = usernames.get("users")
	let amount = 0
	for (var i = 0; i < users.length; i++) {
		if (users[i].botSpawned == false) {
			amount++;
		}
	}
	return amount;
}

const job = new CronJob('00 00 03 * * *', function () {
	async function run(interval, amt) {
		var users = usernames.get("users")
		makeRequest(5, process.env.serverRequestTOKEN, `say WARNING! Automatic whitelisting of players is about to commence, you will experience some lag.`);
		await delay(500)
		makeRequest(5, process.env.serverRequestTOKEN, `say This automatic whitelisting will last [${(((process.env.serverWhitelistingInterval * amt) + (amt * 30000)) / 1000) / 60}] minutes.`)
		await delay(30000)
		makeRequest(5, process.env.serverRequestTOKEN, `say WARNING! Automated Whitelisting is now commencing. Y`)
		for (var i = 0; i < users.length; i++) {
			console.log(i)
			if (users[i].botSpawned == false) {
				console.log(`${users[i].username} is not spawned`)
				users[i].botSpawned = true
				makeRequest(5, process.env.serverRequestTOKEN, `player ${users[i].username} spawn in spectator`);
				console.log(`Spawned bot [${users[i].username}]`)
				await delay(interval);
				makeRequest(5, process.env.serverRequestTOKEN, `gamemode survival ${users[i].username}`);
				makeRequest(5, process.env.serverRequestTOKEN, `player ${users[i].username} kill`);
				makeRequest(5, process.env.serverRequestTOKEN, `whitelist add ${users[i].username}`);
				users[i].isWhitelisted = true
				console.log(`Killed and Whitelisted user [${users[i].username}]`)
				usernames.set("users", users);
				await delay(30000)
			}
		}
		makeRequest(5, process.env.serverRequestTOKEN, `say Automatic Whitelisting has completed, any lag should subside soon.`);
		console.log("Finished cron job (auto whitelisting).")
	}

	run(process.env.serverWhitelistingInterval, returnAmount());
});
job.start();
client.login(process.env.TOKEN);
