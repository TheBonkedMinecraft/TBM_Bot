require("dotenv").config();

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('unwhitelist')
		.setDescription('Removes a specified player from the whitelist.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addStringOption(option =>
			option.setName("username")
				.setDescription("Specify the Minecraft username to remove from the whitelist.")
				.setRequired(true)),

    async execute(interaction) {
        const mcName = interaction.options.getString("username", true)
        // need to do the .json remove
        var username = mcName
		await makeRequest(1, process.env.serverRequestTOKEN, `whitelist remove ${username}`);
    }
}