const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js')

const { leaderBoard } = require("../../utils/connect")
const { claimToken, userInfo } = require("../../utils/connect")
// const { memberTransaction } = require("../../server.js")
const fs = require("fs")

const moment = require("moment")
const token = "<:dwood:1055600798756777984>"

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leadeboard')
    .setDescription('Leaderboard of the top 50 $WOOD holders')
    .addStringOption(option =>
      option.setName('from')
        .setDescription('The minimum amount to start counting the leaderboard')
              .setRequired(false))
    .addStringOption(option =>
      option.setName('to')
        .setDescription('The max amount to finish counting the leaderboard')
              .setRequired(false)),
    run: async ({ client, interaction }) => {
      await interaction.deferReply({ ephemeral: true })

      const channel_id = await interaction.channel.id
      const channel = await interaction.guild.channels.cache.get(`${channel_id}`)
      const min = !interaction.options._hoistedOptions[0] ? 0 : interaction.options._hoistedOptions[0].value
      const max = !interaction.options._hoistedOptions[1] ? 21_000_000 : interaction.options._hoistedOptions[1].value
      
      await leaderBoard().then(async r => {
        if(r.error !== null){
         return interaction.editReply({ content: "Something went wrong, fetching de data..." })
        }
        
        const leaderBoard = await r.leaderboard.filter(i => i.balance > min && i.balance < max)
        // const users = await leaderBoard.map(i => i.discord_id)
        // await users.forEach(e => {
        //   if (e === null) return
        //   return console.log("<@" + e + ">")
        // })
        // await leaderBoard.forEach(async e => {
        //   if(e.discord_id === null || e.discord_id === "726520866493693984" || e.discord_id === "883046016406945852") return console.log(e.discord_id)
        //   const resta = e.balance - 5000
        //   const wallet = e.public_key
        //   await claimToken(wallet, resta, 'WOOD PURGE').then(r => {
        //     return console.log("Done")
        //   })
          
        // })
        // return        
        const allUsers = leaderBoard.length
        const list = JSON.stringify(leaderBoard, null, 4)
        const file = fs.writeFileSync('./leaderboard.csv', list)
        const attachment = new AttachmentBuilder(
          './leaderboard.csv', 
          { 
            name: 'leaderboard.csv' 
          }
        )
        const infoEmbed = new EmbedBuilder()
        .setColor(0xBFF5A1)
        .setTitle(`There are ${allUsers} in the range amount you requested.`)
        await channel.send({ embeds: [infoEmbed], files: [attachment], ephemeral: false })
        await interaction.deleteReply()
        fs.unlinkSync('./leaderboard.csv')
      })
    },
};