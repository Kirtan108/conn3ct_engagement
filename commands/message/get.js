const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')
const config = require("../../config")
const link = config.url
const color_brand = config.colors.brand
const brand_name = config.brand_name

module.exports = {
    data: {
      name: "get",
      aliases: ['get'],
      description: "Information",
    },
    run: async (client, message, args) => {
      await message.delete()

      const embed = new EmbedBuilder()
      .setColor(color_brand)
      .setThumbnail(`${client.user.displayAvatarURL({ size: 4096, format: 'png', dynamic: true })}`)
      .setTitle('Link to the App')
      .setDescription(`Push button below`)

      const button2 = new ButtonBuilder()
      .setURL(link)
      .setLabel(`conn3ct with ${brand_name}`)
      .setStyle('Link')
      //.setEmoji(':logoapp:1065033438069002241')

      const buttonT = new ButtonBuilder()
      .setCustomId('follow')
      .setLabel(`conn3ct with ${brand_name}`)
      .setStyle(ButtonStyle.Secondary)
      //.setEmoji(':logoapp:1065033438069002241')
      const aa = new ButtonBuilder()
      .setCustomId(`hello_${message.author.id}_12345`)
      .setLabel(`conn3ct with ${brand_name}`)
      .setStyle(ButtonStyle.Secondary)
      //.setEmoji(':logoapp:1065033438069002241')

      const row = new ActionRowBuilder().addComponents(button2)

      await message.channel.send({ embeds: [embed], components: [row] })
    },
  };