require("dotenv").config();

const fs = require("fs");
const { FSDB } = require("file-system-db");
const path = require("path");
const CronJob = require('cron').CronJob;

const usernames = new FSDB("./usernames.json", true);
const whitelisting = new FSDB("./whitelisting.json", true);

const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Registering Commands

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);



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

const eventsPath = path.join(__dirname, 'events');
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

const job = new CronJob('00 00 03 * * *', function () {
	var users = usernames.get("users")
	for (var i = 0; i < users.length; i++) {
		console.log(i)
		if (users[i].botSpawned == false) {
			const mcName = users[i].username
			users[i].botSpawned = true // DOESNT WORK
			makeRequest(1, process.env.serverRequestTOKEN, `player ${users[i].username} spawn in spectator`);
			delay(1000); // 1s delay for now
		}
	}
});
job.start();
client.login(process.env.TOKEN);