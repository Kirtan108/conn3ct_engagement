const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
require('dotenv').config()

const { userInfo, rewardUser } = require("../utils/connect")
const { Profile, UpdateProfile } = require('../utils/mongo.js')

const { updateUserCache, getUserCache } = require("../utils/functions")

const { connectDiscord, connectTwitter, claimVerified, embedLog, failedVerification, enteredReward, appEmbed, relinkApp, processingEmbed } = require("../utils/discord/embeds")
const { linkRow, relinkRow } = require("../utils/discord/buttons")

const { TweetVerification, getSeedURL } = require("../utils/server")

const config = require("../config")
const token = config.token
const colors = config.colors

const infiniteLoopUsers = new Map()

function avoidInfiniteLoop(interaction) {
    infiniteLoopUsers.set(interaction.user.id, new Date().getTime().toString())
    setTimeout(() => {
        infiniteLoopUsers.delete(interaction.user.id)
    }, 1500)
}

const StepLike = {
  customId: 'stepLike',
  execute: async function (interaction) {
    const profile = await Profile(interaction)
    const profileCache = await getUserCache(interaction)

    await interaction.deferReply({ ephemeral: true })
    // const tweetLink = interaction.message.embeds[0].data.fields[0].value
    const tweetLink = interaction.customId
    const tweetSplit = tweetLink.toString().split("/")
    const tweet_name = tweetSplit[3]
    const tweet_id = tweetSplit.pop()
    let searchLike = !profile ? -1 : profile.tweetLikes.indexOf(tweet_id)
    let searchCache = profileCache ? profileCache.findIndex(r => r.tweetLikes === tweet_id) : -1  
    if (searchLike !== -1 || searchCache !== -1) return interaction.followUp({ embeds: [enteredReward], ephemeral: true })
    // const getAmount = interaction.message.embeds[0].data.fields[1].value
    const getAmount = interaction.message.embeds[0].data.fields[0].value
    const actionNumber = Object.keys(interaction.message.components[0].components).length
    const amount = Math.floor(getAmount.replace(/\D/g, "") / actionNumber)

    const intentURL = getSeedURL(interaction.user.id, 'like', tweet_id, tweet_name)

    const LikeEmbed = new EmbedBuilder()
      .setURL(`${intentURL}`)
      .setColor(0x2f3136)
      .setTitle("⸺ LIKE")
      .setDescription(`First like the tweet then you can claim the reward.\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`)
      .addFields(
        //{ name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}`},
        { name: `**• Like Reward** ${token.emoji}`, value: `> **${amount}**` },
      )
    const LikeLink = new ButtonBuilder()
      .setLabel('Like')
      .setStyle(ButtonStyle.Link)
      .setEmoji(':like:1075733296937443462')
      //.setURL(`https://twitter.com/intent/like?tweet_id=${tweet_id}`)
      .setURL(intentURL)

    const buttonL = new ButtonBuilder()
      .setCustomId('like')
      .setLabel('Claim Like')
      .setStyle(ButtonStyle.Danger)
    //.setEmoji(':lk:1055291295045787718')

    const row = new ActionRowBuilder().addComponents(LikeLink, buttonL)
    return interaction.followUp({ embeds: [LikeEmbed], components: [row], ephemeral: true })
  }
}

const Like = {
  customId: 'like',
  execute: async function (interaction) {
    const profile = await Profile(interaction)
    const member = interaction.guild.members.cache.get(interaction.user.id)
    const time = 1000 * 5

    await interaction.deferUpdate({ ephemeral: true })

    const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
    await wait(2000)

    const tweetLink = interaction.message.embeds[0].data.url
    const tweetSplit = tweetLink.toString().split("/")
    const tweet_name = tweetSplit[7]
    const tweet_id = tweetSplit[6]
    let searchLike = !profile ? -1 : profile.tweetLikes.findIndex(r => r === tweet_id)
    if (searchLike !== -1) return interaction.editReply({ content: "", embeds: [enteredReward], ephemeral: true })

    const amount = Math.floor(interaction.message.embeds[0].data.fields[0].value.replace(/\D/g, ""))
    await interaction.editReply({ embeds: [processingEmbed], components: [], ephemeral: true })

    const tweetURL = `https://twitter.com/${tweet_name}/status/${tweet_id}`
    const r = await userInfo(interaction.user.id)
    if (r === undefined || r.error !== null) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })
    // if (r.user.twitter === null || r.user.twitter.access_token === null) return interaction.editReply({ embeds: [connectTwitter], components: [linkRow], ephemeral: true })
    // if (r.user.twitter.refresh_token === null) return interaction.editReply({ embeds: [connectTwitter], components: [linkRow], ephemeral: true })
    const result = await TweetVerification(tweetURL, 'like', interaction.user.id)
    const wallet = await r.user.public_key
    const ans = await result.ans
    if (ans === 2) return interaction.editReply({ content: "Please verify the action using the Link!", embeds: [], ephemeral: true})
    if (ans === 0) {
      return interaction.editReply({ embeds: [failedVerification], components: [], ephemeral: true })
    }
    if (ans === 1) {
      await interaction.editReply({ embeds: [claimVerified(amount, "Like")], components: [], ephemeral: true })
      setTimeout(async () => {
        await rewardUser(wallet, amount, `${tweet_id}_like`)
        const embedLK = embedLog(interaction).setTitle(`LIKE REWARD`).setURL(`${tweetLink}`).setColor(0xFF6B6B).addFields({ name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}` })
        await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, components: [], embeds: [embedLK] })
      }, time)

      await updateUserCache(interaction, { tweetLikes: tweet_id })
      await UpdateProfile(interaction, { tweetLikes: tweet_id })

      const embedLK = embedLog(interaction).setTitle(`Entered to be rewarded with Like`).setColor(0xFF6B6B).addFields({ name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}` }).setURL(`${tweetLink}`)
      try {
        await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedLK] })
      } catch (err) { console.log("Log channel couldn't be fetched") }
      return
    }
    if (!ans || ans === undefined) return interaction.editReply({ embeds: [], content: "Twitter servers are experiencing issues, please try to claim again. If the issue persist, try to re-connect the twitter app in Connect.", components: [], ephemeral: true })
    return
  }
}

module.exports = { StepLike, Like }