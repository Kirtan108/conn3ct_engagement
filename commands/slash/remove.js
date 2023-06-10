const { SlashCommandBuilder, Events, EmbedBuilder } = require('discord.js')

const { claimToken, userInfo } = require("../../utils/connect")
const { format } = require("../../utils/functions")

const token = "<:dwood:1055600798756777984>"

module.exports = {
    data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes $WOOD from user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove amount')
              .setRequired(true))
    .addStringOption(option =>
      option.setName('amount')
        .setDescription('The amount to be removed')
              .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason to remove')
              .setRequired(true)),
    run: async ({ client, interaction }) => {
      await interaction.deferReply({ ephemeral: true })
      //console.log(interaction.options/*._hoistedOptions*/)
      const member = interaction.options._hoistedOptions[0].value
      const amount = interaction.options._hoistedOptions[1].value
      const reason = interaction.options._hoistedOptions[2].value
      const mention = interaction.options.getUser('user')
      const channel_id = await interaction.channel.id
      const channel = await interaction.guild.channels.cache.get(`${channel_id}`)

      await userInfo(member).then(async r => {
        const errorEmbed = new EmbedBuilder()
        .setColor(0x0a0a0a)
        .setTitle(`User not Connected to the App`)
        .setDescription(`• ${mention}`)
        .setThumbnail(`${mention.displayAvatarURL()}`)
        .setTimestamp()
        .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })

        if(r === undefined) return interaction.editReply({ embeds:[errorEmbed], ephemeral: true })
        if(r.error !== null) return interaction.editReply({  embeds:[errorEmbed], ephemeral: true })
        const wallet = r.user.public_key
        await claimToken(wallet, amount, reason).then(async d => {
         const balance = d.balance
         const total = d.total
         const infoEmbed = new EmbedBuilder()
            .setColor(0xBFF5A1)
            .setTitle(`${mention.username}'s earnings have been removed`)
            .setDescription(`**• Removed amount: ${format(amount)}** ${token}`)
            .setThumbnail(`${mention.displayAvatarURL()}`)
            .addFields(
              { name: 'Reason', value: `${reason}`, inline: false },
              //{ name: '\u200B', value: '\u200B', inline: true },
              { name: '• New balance:', value: `${format(balance)} ${token}`, inline: true },
              //{ name: '• All-time earned:', value: `${format(total)} ${token}`, inline: true },
            )            
            await channel.send({ content: `${mention}`, embeds: [infoEmbed] })
            return interaction.editReply({ content: "Success!", ephemeral: true })
        })
      })
    },
};