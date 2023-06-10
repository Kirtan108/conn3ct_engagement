const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format, getNFTWallet } = require("../../utils/functions")
// const { memberTransaction } = require("../../server.js")
const fs = require("fs")

const token = "<:dwood:1055600798756777984>"
const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

module.exports = {
  data: new ContextMenuCommandBuilder()
	.setName('NFTs Wallet')
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
        const discord = r.user.discord === null ? "Not Connected 🔴" : "Connected 🟢"
        const twitter = r.user.twitter === null ? "Not Connected 🔴" : "Connected 🟢"
        const b = "```"

        const chopList = r.user.chop_list === true ? "Approved" : "Pending"
        const whiteList = r.user.approved === true ? "Approved" : "Pending"
        const wallet = r.user.public_key

        const collectionNFT = await getNFTWallet(wallet)
        const counts = {};
        await collectionNFT.forEach(function (x) { 
          const collection = x.collectionTitle
          if (collection === undefined) return
          counts[collection] = (counts[collection] || 0) + 1; 
        });

        const NFTS = new EmbedBuilder().setColor(0xBFF5A1)
        .setTitle(`⸺ NFTS | ${mention.username}#${mention.discriminator}`).setImage(`${downpage}`)
        const NFTS2 = new EmbedBuilder().setColor(0xBFF5A1).setImage(`${downpage}`)
        const NFTS3 = new EmbedBuilder().setColor(0xBFF5A1).setImage(`${downpage}`)
        const NFTS4 = new EmbedBuilder().setColor(0xBFF5A1).setImage(`${downpage}`)
        
        let fields = []
        Object.keys(counts).forEach(key => {
          const collection = `${key}`
          const amount = `${counts[key]}`
          const format = { name: `•  ${collection}`, value: `> ${amount}`, inline: true}
          fields.push(format)
          return
        })
        const size = Object.keys(fields).length
        if(size <= 25) {
            NFTS.addFields(fields)
            return interaction.editReply({ embeds: [NFTS], ephemeral: false })
        }
        if(size > 25 && size <= 50) {
            const group1 = fields.slice(0,24)
            const group2 = fields.slice(25,49)
            NFTS.addFields(group1)
            NFTS2.addFields(group2)
            return interaction.editReply({ embeds: [NFTS, NFTS2], ephemeral: false })
        }
        if(size > 50 && size <= 75) {
            const group1 = fields.slice(0,24)
            const group2 = fields.slice(25,49)
            const group3 = fields.slice(50,74)
            NFTS.addFields(group1)
            NFTS2.addFields(group2)
            NFTS3.addFields(group3)
            return interaction.editReply({ embeds: [NFTS, NFTS2, NFTS3], ephemeral: false })
        }
        if(size > 75 && size <= 100) {
            const group1 = fields.slice(0,24)
            const group2 = fields.slice(25,49)
            const group3 = fields.slice(50,74)
            const group4 = fields.slice(75,99)
            NFTS.addFields(group1)
            NFTS2.addFields(group2)
            NFTS3.addFields(group3)
            NFTS4.addFields(group4)
            return interaction.editReply({ embeds: [NFTS, NFTS2, NFTS3, NFTS4], ephemeral: false })
        } else if( size > 100){
            return interaction.editReply({ content: "I'm sorry but this user has too many rugs for me to show. More than 100 different colletions, NGMI.", ephemeral: true })
        }        
      })
    },
};