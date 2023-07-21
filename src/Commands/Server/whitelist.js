require("dotenv").config();

const { FSDB } = require("file-system-db");
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const usernames = new FSDB("./usernames.json", true);

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

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Whitelist a specified player.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addStringOption(option =>
			option.setName("username")
				.setDescription("Specify the Minecraft username to whitelist.")
				.setRequired(true)),
	async execute(interaction) {
		const mcName = interaction.options.getString("username", true)
		//usernames.set("users", []);
		usernames.push("users",{username: mcName, botSpawned: false, isWhitelisted: false}) // with the unwhitelist command, don't we need to both remove the user from the .json file and send the whitelist remove command in case they are already / not already whitelisted?
		//var username = mcName
		//await makeRequest(1, process.env.serverRequestTOKEN, `whitelist add //didnt work${username}`);
		await interaction.reply('Success');
	},
};