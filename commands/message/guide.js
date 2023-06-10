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
.setTitle("⸺ GUIDE")
.setDescription(`Connect with the community and become part of the **${brand_name}** journey. Using **CONN3CT** inspires you to engage with us and earn $${token.name} along the way. You can then use your $${token.name} to claim various rewards.\n\nYour first step is to connect your Twitter and follow the instructions in both channels below\n- rest is easy.\n\n${channel.rewards}\n${channel.dashboard}`)
.setFooter({ text: `powered by conn3ct`, iconURL: "https://cdn.discordapp.com/attachments/1067125336887795723/1087710150451802112/conn3ct_logo-2.png" })

const embed1 = !image.guide ? null : new EmbedBuilder()
.setImage(image.guide)
.setColor(color_void)

module.exports = {
    data: {
      name: "guide",
      aliases: ['guide'],
      description: "Basic Info",
    },
    run: async (client, message, args) => {
    await message.delete()
    const embeds = embed1 === null ? [embed2] : [embed1, embed2]
    await message.channel.send({ embeds: embeds})
    }
}