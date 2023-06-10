const { EmbedBuilder } = require('discord.js')
require('dotenv').config()

const { userInfo } = require("../utils/connect")
const { format } = require("../utils/functions.js")
const { connectDiscord, connectBalance1 } = require("../utils/discord/embeds")
const { linkRow } = require("../utils/discord/buttons")
const config = require("../config")
const token = config.token
const colors = config.colors

const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

const Balance = {
  customId: 'balance',
  execute: async function (interaction) {

    const member = interaction.guild.members.cache.get(interaction.user.id)

    await interaction.deferReply({ ephemeral: true })
    await userInfo(interaction.user.id).then(async data => {
      if (!data || !data.user || data.error !== null) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })
      const balanceA = !data.user.reward ? 0 : data.user.reward.balance
      const balance = format(balanceA)
      const twitter = data.user.twitter === null ? `Twitter User: Not Connected` : `Twitter User: @${data.user.twitter.username}`
      const wallet = data.user.public_key
      const wallet1 = wallet.slice(0, 13)
      const wallet2 = wallet.slice(-13)
      const b = "```"
      const a = "`"
      const userWallets = data.user.wallet.filter(i => i.is_primary === false).map(r => r.public_key.slice(0, 13) + "....." + r.public_key.slice(-13))

      const balanceEmb = new EmbedBuilder()
        .setTitle("⸺ BALANCE")
        .addFields(
          { name: `• Balance:`, value: `>  ${balance} ${token.emoji}`, inline: false },
          { name: `• Main Wallet:`, value: `${b}${wallet1 + "....." + wallet2}${b}`, inline: false },
          { name: `• Linked Wallets:`, value: `${a}${userWallets.toString().replace(",", "\n")}${a}`, inline: false },
        )
        .setColor(colors.brand)
        .setImage(`${downpage}`)
        .setThumbnail(`${member.displayAvatarURL({ size: 1024, format: 'png', dynamic: true })}`)
        .setFooter({ text: `Discord User: ${interaction.user.username + '#' + interaction.user.discriminator} ⸺ ${twitter}` });

      return interaction.followUp({ embeds: [connectBalance1, balanceEmb], ephemeral: true })
    })

  }
}

module.exports = Balance