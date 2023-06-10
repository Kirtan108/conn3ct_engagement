const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
require('dotenv').config()

const { userInfo, rewardUser } = require("../utils/connect")
const { Profile, UpdateProfile } = require('../utils/mongo.js')

const { updateUserCache, getUserCache } = require("../utils/functions")

const { connectDiscord, connectTwitter, claimVerified, embedLog, failedVerification, enteredReward, reconnectTwitter, relinkApp, processingEmbed } = require("../utils/discord/embeds")
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

const StepRetweet = {
  customId: 'stepRetweet',
  execute: async function (interaction) {
    const profile = await Profile(interaction)
    const profileCache = await getUserCache(interaction)

    await interaction.deferReply({ ephemeral: true })
    // const tweetLink = interaction.message.embeds[0].data.fields[0].value
    const tweetLink = interaction.customId
    const tweetSplit = tweetLink.toString().split("/")
    const tweet_name = tweetSplit[3]
    const tweet_id = tweetSplit.pop()
    let searchRetweet = !profile ? -1 : profile.tweetRetweets.indexOf(tweet_id)
    let searchCache = profileCache ? profileCache.findIndex(r => r.tweetRetweets === tweet_id) : -1  
    if (searchRetweet !== -1 || searchCache !== -1) return interaction.followUp({ embeds: [enteredReward], ephemeral: true })
    // const getAmount = interaction.message.embeds[0].data.fields[1].value
    const getAmount = interaction.message.embeds[0].data.fields[0].value
    const actionNumber = Object.keys(interaction.message.components[0].components).length
    const amount = Math.floor(getAmount.replace(/\D/g, "") / actionNumber)

    const intentURL = getSeedURL(interaction.user.id, 'retweet', tweet_id, tweet_name)

    const retweetEmbed = new EmbedBuilder()
      .setURL(`${intentURL}`)
      .setColor(0x2f3136)
      .setTitle("⸺ RETWEET")
      .setDescription(`First retweet the tweet then you can claim the reward.\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`)
      .addFields(
        //{ name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}`},
        { name: `**• Retweet Reward** ${token.emoji}`, value: `> **${amount}**` },
      )
    const RetweetLink = new ButtonBuilder()
      .setLabel('Retweet')
      .setStyle(ButtonStyle.Link)
      .setEmoji(':retweet2:1075734927238246420')
      .setURL(`${intentURL}`)
    const buttonR = new ButtonBuilder()
      .setCustomId('retweet')
      .setLabel('Claim Retweet')
      .setStyle(ButtonStyle.Success)
    //.setEmoji(':rt:1055291296425717761')
    const row = new ActionRowBuilder().addComponents(RetweetLink, buttonR)
    //interaction.deleteReply()
    return interaction.followUp({ embeds: [retweetEmbed], components: [row], ephemeral: true })
  }
}

const Retweet = {
  customId: 'retweet',
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
    let searchRetweet = !profile ? -1 : profile.tweetRetweets.findIndex(r => r === tweet_id)
    if (searchRetweet !== -1) return interaction.editReply({ embeds: [enteredReward], ephemeral: true })
    // const getAmount = interaction.message.embeds[0].data.fields[1].value
    // const amount = Math.floor(getAmount.replace(/\D/g, "") / actionNumber)
    const amount = Math.floor(interaction.message.embeds[0].data.fields[0].value.replace(/\D/g, ""))
    await interaction.editReply({ embeds: [processingEmbed], components: [], ephemeral: true })

    const tweetURL = `https://twitter.com/${tweet_name}/status/${tweet_id}`
    const r = await userInfo(interaction.user.id)
    if (r === undefined || r.error !== null) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })
    // if (r.user.twitter === null || r.user.twitter.access_token === null) return interaction.editReply({ embeds: [connectTwitter], components: [linkRow], ephemeral: true })
    // if (r.user.twitter.refresh_token === null) return interaction.editReply({ embeds: [connectTwitter], components: [linkRow], ephemeral: true })
    const result = await TweetVerification(tweetURL, 'retweet', interaction.user.id)
    const wallet = await r.user.public_key
    const ans = await result.ans
    if (ans === 2) return interaction.editReply({ content: "Please verify the action using the Link!", embeds: [], ephemeral: true })
    if (ans === 0) {
      return interaction.editReply({ embeds: [failedVerification], components: [], ephemeral: true })
    }
    if (ans === 1) {
      await interaction.editReply({ embeds: [claimVerified(amount, "Retweet")], components: [], ephemeral: true })
      setTimeout(async () => {
        await rewardUser(wallet, amount, `${tweet_id}_retweet`)
        const embedRT = embedLog(interaction).setTitle(`RETWEET REWARD`).setColor(0xABF4C2).setURL(`${tweetLink}`)
        await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedRT] })
      }, time)

      await updateUserCache(interaction, { tweetRetweets: tweet_id })
      await UpdateProfile(interaction, { tweetRetweets: tweet_id })

      const embedRT = embedLog(interaction).setTitle(`Entered to be rewarded with Retweet`).setColor(0xABF4C2).addFields({ name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}` }).setURL(`${tweetLink}`)
      try {
        await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedRT] })
      } catch (err) { console.log("Log channel couldn't be fetched") }
      return
    }
    if (!ans || ans === undefined) return interaction.editReply({ embeds: [], content: "Twitter servers are experiencing issues, please try to claim again. If the issue persist, try to re-connect the twitter app in Connect.", components: [], ephemeral: true })
    return
  }
}

module.exports = { StepRetweet, Retweet }