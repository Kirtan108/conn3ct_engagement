const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const config = require("../../config")
const brand_name = config.brand_name
const color_brand = config.colors.brand
const color_void = config.colors.void
const token = config.token
const channel = config.channels
const image = config.designs

module.exports = {
    data: {
      name: "uiconnect",
      aliases: ['uiconnect'],
      description: "User Interface",
    },
    run: async (client, message, args) => {
      await message.delete()

      const embed1 = !image.dashboard ? null : new EmbedBuilder()
      .setImage(image.dashboard)
      .setColor(color_void)     

      const embed2 = new EmbedBuilder()
      .setColor(color_brand)
      .setAuthor({ name: brand_name })
      .setImage("https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png")
      .setTitle('⸺ DASHBOARD')
      .setDescription(`This is the user panel where you can access both the store and the information of your Discord $${token.name} account. ${token.emoji}
      \nInteract with the buttons below to perform the respective action.`)
      .setFooter({ text: `powered by conn3ct`, iconURL: "https://cdn.discordapp.com/attachments/1067125336887795723/1087710150451802112/conn3ct_logo-2.png" })
      
      const store = new ButtonBuilder()
        .setCustomId('store')
        .setLabel('Store')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(':store:1055660886188097659')

      const balance = new ButtonBuilder()
        .setCustomId('balance')
        .setLabel('Balance')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(':balance:1055660883130466314')

      const quests = new ButtonBuilder()
        .setCustomId('questboard')
        .setLabel('Quests')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(':quests:1067123538575773757')

      const leaderboard = new ButtonBuilder()
      .setCustomId('leaderboard')
      .setLabel('Leaderboard')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(':leaderboard:1055793477436317706')

      

      const row = new ActionRowBuilder().addComponents(store, balance, quests)
      const embeds = embed1 === null ? [embed2] : [embed1, embed2]

      await message.channel.send({ embeds: embeds, components: [row] })
    },
  };