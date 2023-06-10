const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js')
require('dotenv').config()

const { userInfo, claimToken, bankDrop } = require("../utils/connect")
const { format } = require("../utils/functions")
const { connectDiscord, connectTwitter, connectStore1, connectStore2 } = require("../utils/discord/embeds")
const { linkRow } = require("../utils/discord/buttons")

const config = require("../config")
const token = config.token
const colors = config.colors

const Store = {
  customId: 'store',
  execute: async function (interaction) {
    await interaction.deferReply({ ephemeral: true })

    const items = new StringSelectMenuBuilder()
      .setCustomId('items')
      .setPlaceholder('Select an item...')
      .addOptions(
        // {
        //   label: '🎟️ Ticket to enter Raffles',
        //   description: 'Price: 3,000$',
        //   value: 'raffle_ticket',
        // },
        {
          label: '🪵 15K $WOOD Drop',
          description: 'Price: 15,000$',
          value: 'wood_drop',
        },
        {
          label: '📤 Withdraw to the Bank',
          description: 'Only if you have the $15K WOOD Drop',
          value: 'withdraw',
        },
      )
    const shop = new ActionRowBuilder().addComponents(items)
    return interaction.followUp({ embeds: [connectStore1, connectStore2], components: [shop], ephemeral: true })
  }
}

const StoreItems = {
  customId: 'items',
  execute: async function (interaction) {
    return interaction.followUp({ content: "All transactions are being reviewed for legitimacy so this service is currently unavailable, please await until further notification. It will be available again soon! - *Estimated time: 12-24h*", ephemeral: true })

    const member = interaction.guild.members.cache.get(interaction.user.id)
    const claimRole = interaction.guild.roles.cache.get(process.env.CLAIM_ROLE)
    const claimRole2K = interaction.guild.roles.cache.get(process.env.TWOCLAIM_ROLE)
    const weeklyRole = interaction.guild.roles.cache.get(process.env.WEEKLY_ROLE)

    await interaction.deferReply({ ephemeral: true })
    const selected = await interaction.values[0]

    await userInfo(interaction.user.id).then(async r => {
      if (r === undefined || r.error !== null) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })

      const wallet = await r.user.public_key
      const balance = !r.user.reward ? 0 : r.user.reward.balance
      const total = !r.user.reward ? 0 : r.user.reward.total

      // TICKET ROLE
      // if (selected === 'raffle_ticket') {
      //   const hasRole = await member["_roles"].findIndex(r => r === process.env.TICKET_ROLE)
      //   const reason = 'storeItem: raffle ticket'
      //   if (hasRole !== -1) return interaction.followUp({ content: "You already have a ticket!", ephemeral: true })

      //   await claimToken(wallet, 3000, reason).then(async r => {
      //     if (r === undefined) return interaction.editReply({ content: "To many ongoing requests, please wait 5s and try again!", ephemeral: true })
      //     // If user has balance vs if user doesn't have balance
      //     if (r.error === null) {
      //       member.roles.add(ticketRole).catch(err => console.log(err))
      //       return interaction.followUp({ content: "Congratulations, item purchased! You are now able to enter the raffles.", components: [], ephemeral: true })
      //     } else {
      //       return interaction.followUp({ content: "Not enought funds!", components: [], ephemeral: true })
      //     }
      //   })
      // }
      // WOOD DROP ROLE
      if (selected === 'wood_drop') {
        const amount = 15000
        //return interaction.followUp({ content: "All transactions are being reviewed for legitimacy so this service is currently unavailable, please await until further notification. It will be available again soon! - *Estimated time: 12-24h*", ephemeral: true })
        const hasRole = await member["_roles"].findIndex(r => r === process.env.CLAIM_ROLE)
        const hasRole2 = await member["_roles"].findIndex(r => r === process.env.WEEKLY_ROLE)
        const reason = 'storeItem: 15k wood drop'
        if (hasRole !== -1) return interaction.followUp({ content: "You already have the item!", ephemeral: true })
        if (hasRole2 !== -1) return interaction.followUp({ content: "You need to wait until next week to request more $WOOD.", ephemeral: true })
        if (balance < amount) return interaction.followUp({ content: "Not enought funds!", ephemeral: true })

        await claimToken(wallet, amount, reason).then(async r => {
          //if (r === undefined) return interaction.followUp({ content: "To many ongoing requests, please wait 5s and try again!", ephemeral: true })
          // If user has balance vs if user doesn't have balance
          if (r.error === null) {
            //bankDrop(wallet)
            member.roles.add(claimRole).catch(err => console.log(err))
            return interaction.followUp({ content: "Item purchased! To withdraw choose the option **Withdraw to the Bank** in the Store.", components: [], ephemeral: true })
          } else {
            return interaction.followUp({ content: "Not enought funds!", components: [], ephemeral: true })
          }
        })
      }
      // WITHDRAWAL
      if (selected === 'withdraw') {
        //return interaction.followUp({ content: "All transactions are being reviewed for legitimacy so this service is currently unavailable, please await until further notification. It will be available again soon! - *Estimated time: 12-24h*", ephemeral: true })
        const hasRole = await member["_roles"].findIndex(r => r === process.env.CLAIM_ROLE)
        const hasRole2 = await member["_roles"].findIndex(r => r === process.env.TWOCLAIM_ROLE)
        if (hasRole2 !== -1) {
          await member.roles.add(weeklyRole).then(async () => {
            const embedLog = new EmbedBuilder()
              .setTitle(`KINGDOM 2K BANK WITHDRAWAL`)
              .setThumbnail(`${member.displayAvatarURL()}`)
              .setDescription(`• ${member} has withdraw the $WOOD to the Kingdom Bank\n> Balance: **${format(balance)}** ${token.emoji}\n> Total: **${format(total)}** ${token.emoji}`)
              .setColor(0xFFDE59).setFooter({ text: `ID: ${member.id}` })
              .setTimestamp()
            await bankDrop(wallet, 2000)
            await member.roles.remove(claimRole2K)
            await interaction.editReply({ content: "Congratulations $Wood has been dropped!\nIt's now available in the [Wood Bank](https://quest.mindfolk.art/bank)\n\n**BE AWARE:** Only Phantom or Solflare Wallets are supported", components: [], ephemeral: true })
            return interaction.guild.channels.cache.get(process.env.DROPLOG_CH).send({ embeds: [embedLog] })
          })
        }
        if (hasRole === -1) {
          return interaction.followUp({ content: "You need to buy first the $15K WOOD Drop", ephemeral: true })
        } else {
          if (hasRole !== -1) {
            await member.roles.add(weeklyRole).then(async () => {
              const embedLog = new EmbedBuilder()
                .setTitle(`KINGDOM 15K BANK WITHDRAWAL`)
                .setThumbnail(`${member.displayAvatarURL()}`)
                .setDescription(`• ${member} has withdraw the $WOOD to the Kingdom Bank\n> Balance: **${format(balance)}** ${token.emoji}\n> Total: **${format(total)}** ${token.emoji}`)
                .setColor(0xFF4CBA).setFooter({ text: `ID: ${member.id}` })
                .setTimestamp()
              await bankDrop(wallet, 15000)
              await member.roles.remove(claimRole)
              await interaction.editReply({ content: "Congratulations $Wood has been dropped!\nIt's now available in the [Wood Bank](https://quest.mindfolk.art/)", components: [], ephemeral: true })
              return interaction.guild.channels.cache.get(process.env.DROPLOG_CH).send({ embeds: [embedLog] })
            })
          }
        }
      }
    })
  }
}

module.exports = { Store, StoreItems }