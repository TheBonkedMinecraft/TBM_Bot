require("dotenv").config();

const { FSDB } = require("file-system-db"); // hai haiiii
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

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
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
		.addStringOption(option =>
			option.setName("username")
				.setDescription("Specify the Minecraft username to whitelist.")
				.setRequired(true))
		.addUserOption(option =>
			option.setName("discord")
				.setDescription("Specify the discord username to link to the whitelisted player.")
				.setRequired(true)),
	async execute(interaction) {

		const mcName = interaction.options.getString("username", true)
		const discordUser = interaction.options.getUser("discord", true)
		const discordId = discordUser?.id // for usernames.json

		const confirm = new ButtonBuilder()
			.setCustomId("confirm")
			.setLabel("Confirm")
			.setStyle(ButtonStyle.Success);

		const cancel = new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

		const confirmEmbed = new EmbedBuilder()
			.setColor(Colors.Red)
			.setTitle("Confirm Whitelist")
			.setDescription("Please confirm the whitelist you just requested.")
			.addFields(
				{ name: "Discord Username", value: `${discordUser}`, inline: true },
				{ name: "Minecraft Username", value: mcName, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: "Made by Skullians and slowest____side", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" })



		const response = await interaction.reply({
			embeds: [confirmEmbed],
			components: [row],
		});

		const collectorFilter = i => i.user.id === interaction.user.id;
		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation.customId === "confirm") {
				usernames.push("users", { username: mcName, botSpawned: false, isWhitelisted: false, discordUserId: discordId })
				await confirmation.update({ content: `✅** Successfully whitelisted *${mcName}*.**`, components: [], embeds: [] });
			} else if (confirmation.customId === "cancel") {
				await confirmation.update({ content: "❌** Aborted whitelist.**", components: [], embeds: [] });
			}
		} catch (e) {
			console.log(e);
            cancelEmbed.setDescription("User failed to confirm whitelisting, or an unknown error occured:\n**Error:** ```" + e + "```")
		}
	}
};