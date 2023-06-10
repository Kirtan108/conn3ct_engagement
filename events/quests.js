const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js')
require('dotenv').config()

const { userInfo, rewardUser } = require("../utils/connect")
const { Profile, UpdateProfile } = require('../utils/mongo.js')

const { getMagicEdenWatchList, getFollowing } = require("../utils/functions")
const { connectDiscord, connectTwitter, completedQuest, questCompleted, questPFP, questPFPTwitter, failedFollowQuest, successFollowQuest, embedME, connectQuest1, connectQuest2, appEmbed } = require("../utils/discord/embeds")
const { linkRow } = require("../utils/discord/buttons")

const Quests = {
  customId: 'questboard',
  execute: async function (interaction) {
    await interaction.deferReply({ ephemeral: true })

    const quests_board = new StringSelectMenuBuilder()
      .setCustomId('quests_board')
      .setPlaceholder('Select a quest...')
      .addOptions(
        {
          label: '🔭 Watching Mindfolk in Magic Eden',
          description: 'Reward: 500 $WOOD',
          value: 'watching_upvote',
        },
        {
          label: '👁️ Follow Mindfolk in Twitter',
          description: 'Reward: 500 $WOOD',
          value: 'follow_mindfolk',
        },
        {
          label: '🎨 Follow Jurgens Walt in Twitter',
          description: 'Reward: 250 $WOOD',
          value: 'follow_jurgens',
        },
        {
          label: '🪓 Follow Ivan in Twitter',
          description: 'Reward: 250 $WOOD',
          value: 'follow_ivan',
        },
        {
          label: '🪓 Follow Sigmundo in Twitter',
          description: 'Reward: 250 $WOOD',
          value: 'follow_sig',
        },
        {
          label: '🪓 Follow Alfred in Twitter',
          description: 'Reward: 250 $WOOD',
          value: 'follow_alfred',
        },
        {
          label: '🪓 Follow Carl in Twitter',
          description: 'Reward: 250 $WOOD',
          value: 'follow_carl',
        },
        {
          label: '🪓 Follow Kirtan in Twitter',
          description: 'Reward: 250 $WOOD',
          value: 'follow_kirtan',
        },
        // {
        //   label: '🧔🏻 Discord - Using a Mindfolk PFP and adding a + in the name',
        //   description: 'Reward: 500 $WOOD',
        //   value: 'discord_quests',
        // },
        // {
        //   label: '🧔🏻 Twitter - Using a Mindfolk PFP and adding a + in the name',
        //   description: 'Reward: 500 $WOOD',
        //   value: 'twitter_quests',
        // },
      )
    const questBoard = new ActionRowBuilder().addComponents(quests_board)
    await interaction.followUp({ embeds: [connectQuest1, connectQuest2], components: [questBoard], ephemeral: true })
  }
}

const QuestsBoard = {
  customId: 'quests_board',
  execute: async function (interaction) {
    const profile = await Profile(interaction)

    let searchQuest = !profile || interaction.values === undefined ? -1 : profile.quests.findIndex(r => r === interaction.values[0])
    await interaction.deferReply({ ephemeral: true })
    const selected = await interaction.values[0]

    // if (selected === 'watching_upvote') {
    //   if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
    //   return interaction.followUp({ content: "We are updating the endpoints for ME, at the moment this mission is not available. Once it's available again we will announce in <#1076805935126806528>. Thanks in advance for your patience and understanding! ", ephemeral: true })
    //   await userInfo(interaction.user.id).then(async r => {
    //     if (r === undefined) return console.log(r)
    //     const publicKey = await r.user.public_key
    //     await getMagicEdenWatchList(publicKey).then(async (ans) => {
    //       if (ans === false) {
    //         return interaction.editReply({ content: "Failed verification! Make sure you are using the same wallet as the one you provided to ConnectApp", embeds: [embedME], ephemeral: true })
    //       }
    //       if (ans === true) {
    //         const amount = 500
    //         await interaction.editReply({ content: `Congratulations! We will keep track with random snapshots. The **${amount}** ${token} will be given to you during the next hours.`, ephemeral: true })
    //         setTimeout(async () => {
    //           await rewardUser(publicKey, amount, `${selected}_quest`)
    //           const embedCM = embedLog.setTitle(`Has been rewarded for Watching & Upvote on Magic Eden`).setColor(0xE42575)
    //           await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedCM] })
    //         }, 1000 * 10)
    //         await UpdateProfile(interaction, { quests: interaction.values[0] })
    //       }
    //       return
    //     })
    //   })
    //   return
    // }
    return interaction.followUp({ content: "We are updating the verification, at the moment this mission is not available due to Twitte having issues with the API. Once it's available again we will announce in <#1076805935126806528>. Thanks in advance for your patience and understanding! ", ephemeral: true })
  }
}

module.exports = { Quests, QuestsBoard }