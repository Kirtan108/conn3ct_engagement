const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder, ButtonStyle } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format } = require("../../utils/functions")
// const { memberTransaction } = require("../../server.js")
const fs = require("fs")

const moment = require("moment")
const token = "<:dwood:1055600798756777984>"

const Pagination = require('customizable-discordjs-pagination');
const buttons = [
  { label: 'First', emoji: ':first:1090380307473121330', style: ButtonStyle.Secondary },
  { label: '\u200b', emoji: ':previous:1090380312174923896', style: ButtonStyle.Danger },
  { label: '\u200b', emoji: ':next:1090380310841139333', style: ButtonStyle.Success },
  { label: 'Last', emoji: ':last:1090380308920160336', style: ButtonStyle.Secondary },
]

module.exports = {
    data: new SlashCommandBuilder()
    .setName('check_tx')
    .setDescription('Check the transactions of specific User')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
              .setRequired(true)),
    run: async ({ client, interaction }) => {
      await interaction.deferReply({ ephemeral: true })
      //console.log(interaction.options/*._hoistedOptions*/)
      const channel_id = await interaction.channel.id
      const channel = await interaction.guild.channels.cache.get(`${channel_id}`)
      const member = interaction.options._hoistedOptions[0].value
      const mention = interaction.options.getUser('user')

      await userInfo(member).then(async r => {
        const errorEmbed = new EmbedBuilder()
        .setColor(0x0a0a0a)
        .setTitle(`User not Connected to the App`)
        .setDescription(`• ${mention}`)
        .setThumbnail(`${mention.displayAvatarURL()}`)
        .setTimestamp()
        .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })

        if(r === undefined) return interaction.editReply({ embeds:[errorEmbed], ephemeral: true })
        if(r.error !== null){
         return interaction.editReply({ embeds:[errorEmbed], ephemeral: true })
        }
        const discord = r.user.discord === null ? "Not Connected 🔴" : "Connected 🟢"
        const twitter = r.user.twitter === null ? "Not Connected 🔴" : "Connected 🟢"
        const infoEmbed = new EmbedBuilder()
        .setColor(0xBFF5A1)
        .setTitle(`${mention.username}#${mention.discriminator} Transactions`)
        .setDescription(`**• Balance:  **${format(r.user.reward.balance)}**\n• Total:   **${format(r.user.reward.total)}`)
        .setThumbnail(`${mention.displayAvatarURL()}`)
        .addFields(
            { name: '• Discord', value: `${discord}`, inline: true },
            { name: '• Twitter', value: `${twitter}`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
        )
        const recentToOld = r.user.reward.transactions.reverse()
        const tx = JSON.stringify(recentToOld, null, 4)
        const file = fs.writeFileSync('./transactions.csv', tx)
        const attachment = new AttachmentBuilder(
          './transactions.csv', 
          { 
            name: 'transactions.csv' 
          }
        )
        await channel.send({ content: `${mention}`, embeds: [infoEmbed] })
        await channel.send({ files: [attachment], ephemeral: false })
        await interaction.editReply({ content: "Success!", ephemeral: true })
        fs.unlinkSync('./transactions.csv')
      })
    },
};