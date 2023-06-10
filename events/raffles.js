const { EmbedBuilder } = require('discord.js');
const { raffleModel } = require("../models.js")

const { userInfo, claimToken } = require("../utils/connect")
const { updateRaffle, updateEntries } = require("../utils/mongo")

const { numberPanel } = require("../utils/functions")
const { connectDiscord, connectTickets1 } = require("../utils/discord/embeds")
const { linkRow, ticketsRow } = require("../utils/discord/buttons")

const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

const TicketPanel = {
    customId: 'number_',
    execute: async function (interaction) {
        await interaction.deferUpdate({ ephemeral: true })
        const message = await interaction.message//interaction.guild.channels.cache.get(interaction.channelId).messages.fetch()
        await numberPanel(interaction)
        return
    }
}

const BuyTickets = {
    customId: 'buyTickets',
    execute: async function (interaction) {
        await interaction.deferUpdate({ ephemeral: true })
        const data = await userInfo(interaction.user.id)

        if (data === undefined || !data.user.reward) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })
        const wallet = await data.user.public_key
        const balance = !data.user.reward ? 0 : data.user.reward.balance
        const raffle = await interaction.message.embeds[0].author.name
        const user_entries = Number(interaction.message.embeds[0].data.fields[1].value.substring(1))
        const amount = user_entries * 10

        if (user_entries === 0) return interaction.followUp({ content: "You must buy at least one ticket!", ephemeral: true })
        const match = raffle.match(/\d+/);
        const number = match ? parseInt(match[0]) : null
        const messages = await interaction.guild.channels.cache.get(interaction.channelId).messages.fetch()
        const raffleEmbed = messages.find(m => {
            if (!m.embeds[0].footer) return
            return m.embeds[0].footer.text === `${raffle}`
        })//.embeds[0].footer.text === `${raffle}`).values().next()

        const receivedEmbed = raffleEmbed.embeds[0];
        const entries = receivedEmbed.data.fields[1].value
        const match1 = entries.match(/\d+/);
        const previousEntries = match ? parseInt(match1[0]) : null
        const newEmbed = EmbedBuilder.from(receivedEmbed)
        const newEntries = previousEntries + user_entries
        newEmbed.data.fields[1] = { name: `• Total entries`, value: `> ${newEntries}`, inline: true }
        await raffleEmbed.edit({ embeds: [newEmbed] })
        const findRaffle = await raffleModel.findOne({ raffle: raffle })
        const findUser = await findRaffle.entries.findIndex(i => i.value === interaction.user.id)
        if (findUser === -1) await updateRaffle(raffle, { entries: { value: interaction.user.id, tickets: user_entries } })
        if (findUser !== -1) {
            const UserRaffle = findRaffle.entries.find(i => i.value === interaction.user.id)
            const newTickets = Number(UserRaffle.tickets) + user_entries
            await updateEntries(raffle, interaction.user.id, newTickets)
        }
        await interaction.editReply({ content: `Success! you have entered the raffle with ${user_entries} tickets`, embeds: [], components: [], ephemeral: true })
        await claimToken(wallet, amount, raffle)
        return
    }
}

const RaffleEntries = {
    customId: 'raffleEntries',
    execute: async function (interaction) {
        const member = interaction.guild.members.cache.get(interaction.user.id)
        await interaction.deferReply({ ephemeral: true })

        const Raffle = await interaction.message.embeds[0].footer.text
        const Entries = interaction.message.embeds[0].data.fields[1].value
        const match = Entries.match(/\d+/);
        const totalEntries = match ? parseInt(match[0]) : null
        const findRaffle = await raffleModel.findOne({ raffle: Raffle })
        const findUser = findRaffle.entries.find(i => i.value === interaction.user.id)
        const user_entries = findUser === undefined ? 0 : findUser.tickets
        const chance = user_entries === 0 ? 0 : (user_entries * 100) / totalEntries
        const userTickets = new EmbedBuilder()
            .setTitle("⸺ TICKETS")
            .addFields(
                { name: `• Tickets:`, value: `> **${user_entries}** 🏷️`, inline: true },
                { name: `• Chance of winning:`, value: `> **${chance.toFixed(1)}%**`, inline: false },
            )
            .setColor(0xBFF5A1)
            .setImage(`${downpage}`)
            .setThumbnail(`${member.displayAvatarURL({ size: 1024, format: 'png', dynamic: true })}`)
            .setFooter({ text: `Discord User: ${interaction.user.username + '#' + interaction.user.discriminator}` });

        return interaction.followUp({ embeds: [connectTickets1, userTickets], ephemeral: true })
    }
}

const UserEntries = {
    customId: 'ticketsPanel',
    execute: async function (interaction) {
        await interaction.deferReply({ ephemeral: true })
        const Raffle = await interaction.message.embeds[0].footer.text
        //const img = interaction.message.embeds[0].image.url
        const data = await userInfo(interaction.user.id)
        if (data === undefined || data.error !== null) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })
        const balance = !data.user.reward ? 0 : data.user.reward.balance
        if (balance === 0) return interaction.followUp({ content: "You have 0 balance!", ephemeral: true })
        const ticketsEmbed = new EmbedBuilder()
            .setAuthor({ name: Raffle })
            .setThumbnail('https://cdn.discordapp.com/attachments/1067125336887795723/1083491355466137650/ticket.png')
            .setColor(0x2f3136)
            .setTitle("⸺ TICKETS")
            //.setDescription(`Enter the raffle interacting with the buttons bellow.\n\n**1 Ticket** = **10 ${token}**\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`)
            .addFields(
                { name: "• Balance", value: `${balance}` },
                { name: `• Tickets`, value: `\u200B` },
                { name: `• New Balance`, value: `\u200B` },
            )

        return interaction.followUp({ embeds: [ticketsEmbed], components: ticketsRow, ephemeral: true })
    }
}

       

module.exports = { TicketPanel, BuyTickets, RaffleEntries, UserEntries }