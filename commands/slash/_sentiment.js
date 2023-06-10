const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js')

const { userInfo, getSentiment } = require("../../utils/connect")
const { format } = require("../../utils/functions")
// const { memberTransaction } = require("../../server.js")
const fs = require("fs")

const token = "<:dwood:1055600798756777984>"

module.exports = {
  data: new ContextMenuCommandBuilder()
	.setName('Vibe Check')
	.setType(ApplicationCommandType.User),
    run: async ({ client, interaction }) => {
      //console.log(interaction.options/*._hoistedOptions*/)
      await interaction.deferReply({ ephemeral: true })
      const member = interaction.targetUser.id
      const mention = interaction.targetUser

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
         return interaction.editReply({ embeds:[errorEmbed], ephemeral: false })
        }
        const publicKey = r.user.public_key
        return getSentiment(publicKey).then(async d => {
          const sentiment = d.sentiment
          const sentAvg = d.sentimentAvg
          const infoEmbed = new EmbedBuilder()
            .setColor(0xBFF5A1)
            .setTitle(`Vibe - ${sentiment}`)
            .setDescription(`**• Member: ${mention}**\n**⎯ AVG:** ${Math.floor(sentAvg * 100) / 100} `)
            .setThumbnail(`${mention.displayAvatarURL()}`)
            // .addFields(
            //   { name: '\u200b', value: '\u200b' },
            // )
            .setTimestamp()
            .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })

          await interaction.editReply({ embeds: [infoEmbed], ephemeral: false })          
        })
      })
    },
};