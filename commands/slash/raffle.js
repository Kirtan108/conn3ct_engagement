const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')
const dotenv = require("dotenv")
dotenv.config()
const config = require("../../config.js")

const token = config.token
const brand_color = config.colors.brand

const { raffleModel } = require("../../models.js")

const profileRaffle = async (raffle, prize) => {
    let profileRaffle
    try {
      profileRaffle = await raffleModel.findOne({ raffle: raffle })
      if (!profileRaffle) {
        let profileRaffle = await raffleModel.create({
          raffle: raffle,
          prize: prize
        })
        profileRaffle.save()
      }
      return profileRaffle
    } catch (error) {
      console.log(error)
    }
}

const lastRaffle = async () => {
  try {
    const lastElement = await raffleModel.findOne().sort({ _id: -1 })
    if(!lastElement) return 1
    const raffleString = lastElement.raffle
    let raffleNumber = parseInt(raffleString.match(/\d+/)[0]);
    raffleNo = ++raffleNumber
    return raffleNo
  } catch (err) {
    console.log(err)
    return null
  }
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('raffle')
    .setDescription('Start a raffle')
    .addStringOption(option =>
		option.setName('prize')
			.setDescription('The prize of the raffle.')
            .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('The duration of the raffle.')
        .setRequired(true)
        .addChoices(
          // { name: 'Test End - 15s', value: `${15}` },
          { name: '24h', value: `${60 * 60 * 24}` },
          { name: '48h', value: `${60 * 60 * 48}` },
          { name: '3 Days', value: `${60 * 60 * 24 * 3}` },
          { name: '1 Week', value: `${60 * 60 * 24 * 7}` },
        ))
    .addStringOption(option =>
		option.setName('image')
			.setDescription('The link of the banner or image.')
            .setRequired(true))
    .addRoleOption(option =>
		option.setName('mention')
			.setDescription('Choose the role to mention')
            .setRequired(true))
    .addStringOption(option =>
		option.setName('winners')
			.setDescription('Choose the number of winners')
            .setRequired(true)),
    run: async ({ client, interaction }) => {
      await interaction.deferReply({ ephemeral: true })
      //console.log(interaction.options._hoistedOptions)
      const prize = interaction.options._hoistedOptions[0].value
      const duration = Number(interaction.options._hoistedOptions[1].value)
      const image = interaction.options._hoistedOptions[2].value
      const channel_id = process.env.RAFFLE_CHANNEL
      const channel = interaction.guild.channels.cache.get(`${channel_id}`)
      const mention = interaction.options._hoistedOptions[3]
      const winners = interaction.options._hoistedOptions[4].value
      
      if(isNaN(parseInt(winners))) return interaction.followUp({ content: "You need to choose a valid number for winners", ephemeral: true })
      
      //const mention = interaction.options._hoistedOptions[3]
      const raffleNo = await lastRaffle()
      const raffleNumber = `Raffle No. ${raffleNo}`
      const date = Math.floor(Date.now()/1000 + duration) //21600

      const raffleEmbed = new EmbedBuilder()
      .setImage(image)
      .setColor(brand_color)
      .setTitle("⸺ RAFFLE")
      .setDescription(`Enter the raffle interacting with the buttons bellow.\n\n**1 Ticket** = **10 ${token.emoji}**\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`)
      .addFields(
          { name: "• Prize", value: `> ${prize}`, inline: true },
          { name: `• Total entries`, value: `> 0`, inline: true },
          { name: `• Winners: ${winners}`, value: `\u200B` },
          { name: "End time", value: `<t:${date}:f>`, inline: false }
      )
      .setFooter({ text: `Raffle No. ${raffleNo}` })

      const buttonTickets = new ButtonBuilder()
	    .setCustomId('ticketsPanel')
	    .setLabel('Buy Tickets')
	    .setStyle(ButtonStyle.Success)
        .setEmoji('🏷️')
      const buttonEntries = new ButtonBuilder()
	    .setCustomId('raffleEntries')
	    .setLabel('View Entries')
	    .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔖')
      
        const row = new ActionRowBuilder().addComponents(buttonTickets, buttonEntries)

      await profileRaffle(raffleNumber, prize)
      await interaction.editReply({ content: `Aweee ${interaction.user}!\nRaffle started succesfully! Channel: <#${channel_id}>`, ephemeral: true })
      return channel.send({ content: `${mention.role}`, embeds: [raffleEmbed], components: [row] })
    },
};