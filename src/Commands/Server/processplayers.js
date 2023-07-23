require("dotenv").config();

const { FSDB } = require("file-system-db");
const { Client, Events, GatewayIntentBits, Collection, SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const usernames = new FSDB("./usernames.json", true);

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

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

async function run(interval, amt) {
    console.log("User confirmed the processing, processing.")
    var users = usernames.get("users")
    makeRequest(1, process.env.serverRequestTOKEN, `say WARNING! Automatic whitelisting of players is about to commence, you will experience some lag.`);
    await delay(500)
    makeRequest(1, process.env.serverRequestTOKEN, `say This automatic whitelisting will last [${(((process.env.serverWhitelistingInterval * amt) + (amt * 60000)) / 1000) / 60}] minutes.`)
    await delay(30000)
    makeRequest(1, process.env.serverRequestTOKEN, `say WARNING! Automated Whitelisting is now commencing. You will experience lag.`)
    for (var i = 0; i < users.length; i++) {
        console.log(i)
        if (users[i].botSpawned == false) {
            console.log(`${users[i].username} is not spawned`)
            users[i].botSpawned = true
            makeRequest(1, process.env.serverRequestTOKEN, `player ${users[i].username} spawn in spectator`);
            console.log(`Spawned bot [${users[i].username}]`)
            await delay(interval);
            makeRequest(1, process.env.serverRequestTOKEN, `gamemode survival ${users[i].username}`);
            makeRequest(1, process.env.serverRequestTOKEN, `player ${users[i].username} kill`);
            makeRequest(1, process.env.serverRequestTOKEN, `whitelist add ${users[i].username}`);
            users[i].isWhitelisted = true
            console.log(`Killed and Whitelisted user [${users[i].username}]`)
            usernames.set("users", users);
            await delay(30000)
        }
    }
    makeRequest(1, process.env.serverRequestTOKEN, `say Automatic Whitelisting has completed, any lag should subside soon.`);
    console.log(`Completed whitelisting of [${amt}] users for [${(((process.env.serverWhitelistingInterval * amt) + (amt * 60000)) / 1000) / 60}] minutes.`)
    return true;
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("processplayers")
        .setDescription("Force-start the processing of to-whitelist players.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks),
    async execute(interaction) {
        const whitelistInterval = process.env.serverWhitelistingInterval;
        const whitelistAmount = returnAmount();

        // Buttons

        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Proceed")
            .setStyle(ButtonStyle.Success);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(confirm, cancel);

        const cancelEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("Processing Aborted")
            .setTimestamp()
            .setFooter({ text: "Made by Skullians and slowest____side", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" })

        const proceedingEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("Beginning Whitelisting...")
            .setDescription("Beginning the whitelisting now.")
            .addFields(
                { name: "Whitelist Count:", value: `${whitelistAmount} Players`, inline: true },
                { name: "ETA:", value: `${(((whitelistInterval * whitelistAmount) + (whitelistAmount * 60000)) / 1000) / 60} minutes`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: "Made by Skullians and slowest____side", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" })

        const confirmEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("Confirm Processing")
            .setDescription("Please confirm the whitelist you just requested.")
            .addFields(
                { name: "Whitelist Amount:", value: `${whitelistAmount} Players`, inline: true },
                { name: "Total Time:", value: `${(((whitelistInterval * whitelistAmount) + (whitelistAmount * 60000)) / 1000) / 60} minutes`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: "Made by Skullians and slowest____side", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" })

        if (whitelistAmount == 0) {
            const noneEmbed = new EmbedBuilder().setTitle("Error!").setDescription("There are no players that need to be whitelisted.").setTimestamp().setFooter({ text: "Made by Skullians and slowest____side", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" });
            await interaction.reply({ embeds: [noneEmbed] });
        } else {
            const response = await interaction.reply({
                embeds: [confirmEmbed],
                components: [row],
            });

            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                if (confirmation.customId === "confirm") {
                    await confirmation.update({ embeds: [proceedingEmbed], components: [] });
                    await run(whitelistInterval, whitelistAmount);
                    const successEmbed = new EmbedBuilder().setTitle("Processing Complete").setDescription("The processing has completed successfully!").setColor(Colors.Green).setTimestamp().setFooter({ text: "Made by Skullians and slowest____side", iconURL: "https://avatars.githubusercontent.com/u/132810763?s=400&u=e4ebe8faa9fc33b56ff347918c41e220233484b7&v=4" });
                    await interaction.editReply({ embeds: [successEmbed], components: [] });
                } else if (confirmation.customId === "cancel") {
                    cancelEmbed.setDescription("Whitelisting aborted due to user cancellation.");
                    await interaction.editReply({ embeds: [cancelEmbed], components: [] });
                }
            } catch (e) {
                console.log(e);
                cancelEmbed.setDescription("User failed to confirm whitelisting, or an unknown error occured:\n**Error:** ```" + e + "```")
                await interaction.editReply({ embeds: [cancelEmbed], components: [] })
            }
        }

    }
}