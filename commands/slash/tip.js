const { SlashCommandBuilder, Events, EmbedBuilder } = require('discord.js')

const dotenv = require('dotenv')
dotenv.config()
const fetch = require('node-fetch')

const { rewardUser, userInfo, claimToken } = require("../../utils/connect")
const { format } = require("../../utils/functions")
const { connectDiscord } = require("../../utils/discord/embeds")
const { linkRow } = require("../../utils/discord/buttons")

const config = require("../../config")
const brand_color = config.colors.brand
const token = config.token.emoji
const token_name = config.token.name


const UserTip = new Map()

setInterval(() => {
  UserTip.clear()
}, 1000 * 60 * 60 * 18)

module.exports = {
    data: new SlashCommandBuilder()
    .setName('tip')
    .setDescription(`Tip a user with $${token_name}`)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to tip')
              .setRequired(true))
    .addStringOption(option =>
      option.setName('amount')
        .setDescription('The amount you want to tip')
              .setRequired(true)
              .addChoices(
                { name: `25 $${token_name}`, value: '25' },
                { name: `50 $${token_name}`, value: '50' },
                { name: `75 $${token_name}`, value: '75' },
                { name: `100 $${token_name}`, value: '100' },
              )),
    run: async ({ client, interaction }) => {
      await interaction.deferReply({ ephemeral: true })
      await userInfo(interaction.user.id).then(async d => {
        // IN CASE THE USER IS NOT CONNECTED TO THE APP
        if (d === undefined || d.error !== null) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })
        //console.log(interaction.options/*._hoistedOptions*/)
        const member = interaction.options._hoistedOptions[0].value
        const amount = Number(interaction.options._hoistedOptions[1].value)
        const mention = interaction.options.getUser('user')
        const channel_id = await interaction.channel.id
        const channel = await interaction.guild.channels.cache.get(`${channel_id}`)
        const reason = `Tip from ${interaction.user.username} - <@${interaction.user.id}>`
        const reason1 = `Tip to <@${member}>`
        const maxTip = 100
        const authorWallet = d.user.public_key
        const author = interaction.guild.members.cache.get(interaction.user.id) 
        const hasPioneer = await author["_roles"].findIndex(r => r === process.env.PIONEER_ROLE)

        if(amount > d.user.reward.balance) return interaction.editReply("You don't have enough $WOOD to tip!")
        
        const quant = UserTip.get(`${interaction.user.id}`, amount) === undefined ? 0 : Number(UserTip.get(`${interaction.user.id}`, amount))
        
        if (interaction.user.id === member) return interaction.editReply("You can't tip yourself!")
        await userInfo(member).then(async r => {
          const errorEmbed = new EmbedBuilder().setColor(0x0a0a0a).setTitle(`User not Connected to the App`)
          .setDescription(`• ${mention}`)
          .setThumbnail(`${mention.displayAvatarURL()}`)

          if (r === undefined || r.error !== null) return interaction.editReply({ embeds: [errorEmbed], ephemeral: true })

          if (quant === maxTip) {
            return interaction.editReply(`You have already spent all of today's available tips`)
          }
          const limit = quant + amount

          if (limit > maxTip) {
            return interaction.editReply(`You only have ${maxTip - quant} $WOOD more to tip for today`)
          }
          if (hasPioneer === -1){
            UserTip.set(`${interaction.user.id}`, limit)
            await claimToken(authorWallet, amount, reason1)
          }

          const wallet = r.user.public_key

          await rewardUser(wallet, amount, reason).then(async d => {
            const balance = d.balance
            const total = d.total
            const infoEmbed = new EmbedBuilder()
              .setColor(0xBFF5A1)
              .setTitle(`${interaction.user.username} tipped ${mention.username}!`)
              .setDescription(`**• Amount:**\n> **${amount}** ${token}`)
              .setThumbnail("https://cdn.discordapp.com/attachments/1066021507865784430/1073260396259066047/Copia_de_Wood_Vibes.jpg")//.setThumbnail(`${mention.displayAvatarURL()}`)    
            await channel.send({ content: `${mention}`, embeds: [infoEmbed] })
            return interaction.editReply({ content: "Success!", ephemeral: true })
          })
        })
      })
    },
};