const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder, ButtonStyle } = require('discord.js')

const { leaderBoard } = require("../../utils/connect")
const { claimToken, userInfo } = require("../../utils/connect")
// const { memberTransaction } = require("../../server.js")
const { format } = require("../../utils/functions")
const fs = require("fs")

const moment = require("moment")
const token = "<:dwood:1055600798756777984>"
const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

const Pagination = require('customizable-discordjs-pagination');
const buttons = [
  { label: 'First', emoji: ':first:1090380307473121330', style: ButtonStyle.Secondary },
  { label: '\u200b', emoji: ':previous:1090380312174923896', style: ButtonStyle.Danger },
  { label: '\u200b', emoji: ':next:1090380310841139333', style: ButtonStyle.Success },
  { label: 'Last', emoji: ':last:1090380308920160336', style: ButtonStyle.Secondary },
]

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leadeboard')
    .setDescription('Leaderboard of the top 50 $WOOD holders')
    .addStringOption(option =>
      option.setName('from')
        .setDescription('The minimum amount to start counting the leaderboard')
              .setRequired(false))
    .addStringOption(option =>
      option.setName('to')
        .setDescription('The max amount to finish counting the leaderboard')
              .setRequired(false)),
    run: async ({ client, interaction }) => {
      await interaction.deferReply()

      const channel_id = await interaction.channel.id
      const channel = await interaction.guild.channels.cache.get(`${channel_id}`)
      const min = !interaction.options._hoistedOptions[0] ? 0 : interaction.options._hoistedOptions[0].value
      const max = !interaction.options._hoistedOptions[1] ? 21_000_000 : interaction.options._hoistedOptions[1].value

    const resp = await leaderBoard()
    if (resp.error !== null) {
      return interaction.editReply({ content: "Something went wrong, fetching de data..." })
    }

    const LBoard = await resp.leaderboard.filter(i => i.balance > min && i.balance < max)
    LBoard.sort((a, b) => b.balance - a.balance);
    let userList = []

    const allUsers = LBoard.length

    LBoard.forEach((r, index) => {
      const user_id = r.discord_id
      const balance = r.balance
      if(!user_id) return
      userList.push({ name: `📑 • ${index + 1}`, value: `<@${user_id}>\n> Balance: **${format(balance)}**`, inline: true })
      return
    })

    const usersPerPart = 10;
    const listEmbeds = []
    for (let i = 0; i < userList.length; i += usersPerPart) {
      const parts = userList.slice(i, i + usersPerPart)
      //const part = parts.join('')
      const result = parts.reduce((acc, cur, index) => {
        if (index % 2 !== 0 && index !== 0) {
          acc.push({ name: '\u200B', value: '\u200B', inline: true });
        }
        acc.push(cur);
        return acc;
      }, []);
      const embed = new EmbedBuilder()
        .setColor(0xBFF5A1)
        //.setAuthor({ name: `There are ${allUsers} in the range amount you requested.` })
        .setTitle('⸺ LEADERBOARD')
        .setImage(downpage)
        .addFields(result)

      listEmbeds.push(embed);
    }
    const extraText = `There are ${allUsers} in the range amount you requested.`
    new Pagination()
      .setCommand(interaction)
      .setPages(listEmbeds)
      .setButtons(buttons)
      .setPaginationCollector({ timeout: 120_000 })
      .setSelectMenu({ enable: false })
      .setFooter({ enableIconUrl: false, extraText: extraText })
      .send();
  },
};