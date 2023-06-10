const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')
const config = require("../../config")
const brand_name = config.brand_name
const color_brand = config.colors.brand
const color_void = config.colors.void
const token = config.token
const channel = config.channels
const image = config.designs

const embed2 = new EmbedBuilder()
.setColor(color_brand)
.setImage("https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png")
.setAuthor({ name: brand_name })
.setTitle("⸺ REWARDS")
.setDescription(`**${token.name} Opportunities**\n\nHere you can check the current tasks to complete with which you can earn $${token.name}. ${token.emoji}\n\n**Please note: These will only last for couple hours.**`)
.setFooter({ text: `powered by conn3ct`, iconURL: "https://cdn.discordapp.com/attachments/1067125336887795723/1087710150451802112/conn3ct_logo-2.png" })

const embed1 = !image.rewards ? null : new EmbedBuilder()
.setImage(image.rewards)
.setColor(color_void)

module.exports = {
    data: {
      name: "rewards",
      aliases: ['rewards'],
      description: "rewards",
    },
    run: async (client, message, args) => {
    await message.delete()
    const embeds = embed1 === null ? [embed2] : [embed1, embed2]
    await message.channel.send({ embeds: embeds })
    }
}