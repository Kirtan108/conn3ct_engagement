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
.setTitle("⸺ ROLES")
.setDescription(`This is the place where you can select roles to be notified of new events. Please react accordingly in order to get the role assigned or removed.\n\n**REWARDS**\nThis role is for all the notifications in ${channel.rewards}\n\n💰 **⎯** <@&1029350303570608168>\n\n**SOCIAL**\nThis role is for all the notifications in ${channel.tweet_rush}\n\n🪶 **⎯** <@&1073242806430224444>\n\n**__BE AWARE__ the count will always stay in 1**\nRoles will be either assigned or removed accordingly.`)
.setFooter({ text: `powered by conn3ct`, iconURL: "https://cdn.discordapp.com/attachments/1067125336887795723/1087710150451802112/conn3ct_logo-2.png" })

const embed1 = !image.roles ? null : new EmbedBuilder()
.setImage(image.roles)
.setColor(color_void)

module.exports = {
    data: {
      name: "roles",
      aliases: ['roles'],
      description: "Roles",
    },
    run: async (client, message, args) => {
    await message.delete()
    const embeds = embed1 === null ? [embed2] : [embed1, embed2]
    await message.channel.send({ embeds: embeds })
    }
}