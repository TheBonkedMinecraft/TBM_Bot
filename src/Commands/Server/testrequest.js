require("dotenv").config();
const { SlashCommandBuilder } = require('discord.js');

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
		.setName('testrequest')
		.setDescription('request'),
	async execute(interaction) {


		makeRequest(1, token, "whitelist Skulkians")
		await interaction.reply('Success');
	},
};