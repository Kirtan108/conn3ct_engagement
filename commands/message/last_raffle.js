const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const mfpage = "https://mindfolk.art/"

const { raffleModel } = require("../../models.js")

module.exports = {
    data: {
        name: "lastraffle",
        aliases: ['rno'],
        description: "Know the raffle number",
    },
    run: async (client, message, args) => {
        //await message.delete()

        const data = await raffleModel.find({})
        const lastRaffle = data.pop()
        const match = lastRaffle.raffle.match(/\d+/)
        const number = match ? parseInt(match[0]) : null
        return message.reply({ content: `The Last Raffle is No. ${number} so the next time you create a raffle use No. ${number + 1}` })
    },
  };