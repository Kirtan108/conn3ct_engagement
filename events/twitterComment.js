const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
require('dotenv').config()

const { userInfo, rewardUser } = require("../utils/connect")
const { Profile, UpdateProfile } = require('../utils/mongo.js')

const { connectDiscord, connectTwitter, claimVerified, embedLog, failedVerification, enteredReward, appEmbed, relinkApp, bonusReward, processingEmbed } = require("../utils/discord/embeds")
const { linkRow, relinkRow } = require("../utils/discord/buttons")

const { TweetVerification, getSeedURL, getReply } = require("../utils/server")

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

const StepComment = {
  customId: 'stepComment',
  execute: async function (interaction) {
    const profile = await Profile(interaction)

    await interaction.deferReply({ ephemeral: true })
    // const tweetLink = interaction.message.embeds[0].data.fields[0].value
    const tweetLink = interaction.customId
    const tweetSplit = tweetLink.toString().split("/")
    const tweet_name = tweetSplit[3]
    const tweet_id = tweetSplit.pop()
    let searchComment = !profile ? -1 : profile.tweetComments.findIndex(r => r === tweet_id)
    if (searchComment !== -1) return interaction.followUp({ embeds: [enteredReward], ephemeral: true })
    const getAmount = interaction.message.embeds[0].data.fields[0].value
    const actionNumber = Object.keys(interaction.message.components[0].components).length
    const amount = Math.floor(getAmount.replace(/\D/g, "") / actionNumber)
    const amountBonus = Math.floor(amount * 1.5)
    const bonus = !interaction.message.embeds[0].data.fields[2] ? null : interaction.message.embeds[0].data.fields[2].value
    
    const firstIntentUrl = getSeedURL(interaction.user.id, 'reply', tweet_id, tweet_name)
    const intentURL = !bonus ? firstIntentUrl : firstIntentUrl + `?text=${encodeURIComponent(bonus)}`

    const commentEmbed = new EmbedBuilder()
      .setURL(`${intentURL}`)
      .setColor(0x2f3136)
      .setTitle("⸺ COMMENT")
      .setDescription(`First reply the tweet then you can claim the reward.\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`)
      .addFields(
        //{ name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}`},
        { name: `**• Comment Reward** ${token.emoji}`, value: `> **${amount}**` },
      )
    if (bonus !== null) {
      commentEmbed.addFields(
        { name: `**• Comment Reward + Bonus** ${token.emoji}`, value: `> **${amountBonus}**` },
        { name: "Bonus reward for including in reply", value: `${bonus}`, inline: true }
      )
    }
    const CommentLink = new ButtonBuilder()
      .setLabel('Comment')
      .setStyle(ButtonStyle.Link)
      .setEmoji(':reply:1075737166338064505')
      .setURL(`${intentURL}`)
    const buttonC = new ButtonBuilder()
      .setCustomId(`comment__${tweetLink}`)
      .setLabel('Claim Comment')
      .setStyle(ButtonStyle.Primary)
    //.setEmoji(':cmt:1055291293477122068')
    const row = new ActionRowBuilder().addComponents(CommentLink, buttonC)
    //interaction.deleteReply()
    return interaction.followUp({ embeds: [commentEmbed], components: [row], ephemeral: true })
  }
}

const Comment = {
  customId: 'comment',
  execute: async function (interaction) {
    const profile = await Profile(interaction)
    const member = interaction.guild.members.cache.get(interaction.user.id)
    const time = 1000 * 5

    const tweetLink = interaction.customId.split(";")[1]
    const tweet_id = tweetLink.toString().split("/").pop()
    let searchComment = !profile ? -1 : profile.tweetComments.findIndex(r => r === tweet_id)
    if (searchComment !== -1) return interaction.reply({ embeds: [enteredReward], ephemeral: true })

    const amount = Math.floor(interaction.message.embeds[0].data.fields[0].value.replace(/\D/g, ""))

    const modal = new ModalBuilder()
    .setCustomId(`modalComment;${tweetLink};${amount}`)
    .setTitle('Tweet Reply');

    const tweetUrlLink = new TextInputBuilder()
    .setCustomId('replyLink')
    .setLabel("Submit your reply link")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

    const row = new ActionRowBuilder().addComponents(tweetUrlLink);
    modal.addComponents(row)
    return interaction.showModal(modal);
  }
}

const modalComment = {
  customId: 'modalComment',
  execute: async function (interaction){
    const member = interaction.guild.members.cache.get(interaction.user.id)
    const time = 1000 * 5

    await interaction.deferUpdate({ ephemeral: true })
    const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
    await wait(1500)

    const mainLink = interaction.customId.split(";")[1]
    const mainLink_id = mainLink.split("/").pop()
    const amount = Math.floor(interaction.customId.split(";")[2])
    const tweetLink = interaction.fields.getTextInputValue('replyLink')
    // const tweet_id = tweetLink.toString().split("/").pop()
    const data = await getReply(tweetLink, mainLink)
    if (data.error) return interaction.followUp({ embeds: [failedVerification], components: [], ephemeral: true })
    const mainTweet_id = !data.main_tweet ? null : data.main_tweet.split("/").pop() 
    const tweet_id = mainTweet_id
    if(mainLink_id !== mainTweet_id) return interaction.followUp({ embeds: [failedVerification], components: [], ephemeral: true })
    const replyText = data.text

    const bonus = !interaction.message.embeds[0].data.fields[2] ? null : interaction.message.embeds[0].data.fields[2].value
    await interaction.editReply({ embeds: [processingEmbed], components: [], ephemeral: true })

    const r = await userInfo(interaction.user.id)
    if (r === undefined || r.error !== null) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })

    // if (r.user.twitter === null || r.user.twitter.access_token === null) return interaction.editReply({ embeds: [connectTwitter], components: [linkRow], ephemeral: true })
    // if (r.user.twitter.refresh_token === null) return interaction.editReply({ embeds: [connectTwitter], components: [linkRow], ephemeral: true })

    const wallet = await r.user.public_key
    const Bonus = bonus === null ? false : replyText.toLowerCase().includes(`${bonus.toLowerCase()}`)
    const ans = Bonus === true ? 1 : 0
    
    if (ans === 0) {
      await interaction.editReply({ embeds: [claimVerified(amount, "Comment")], components: [], ephemeral: true })
      setTimeout(async () => {
        await rewardUser(wallet, amount, `${tweet_id}_comment`)
        const embedCM = embedLog(interaction).setTitle(`Comment`).setColor(0x99F3FF).setFooter({ text: `ID: ${member.id}` }).setTimestamp().setURL(`${tweetLink}`)
        await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedCM] })
      }, time)
      await UpdateProfile(interaction, { tweetComments: tweet_id })
      const embedCM = embedLog(interaction).setTitle(`Entered to be rewarded with Comment`).setColor(0x99F3FF).addFields({ name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}` }).setURL(`${tweetLink}`)
      try {
        await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedCM] })
      } catch (err) { console.log("Log channel couldn't be fetched") }
      return
    }
    if (ans === 1) {
      const amountBonus = Math.floor(amount * 1.5)
      await interaction.editReply({ embeds: [bonusReward(amountBonus, "Comment")], components: [], ephemeral: true })
      setTimeout(async () => {
        await rewardUser(wallet, amountBonus, `${tweet_id}_comment`)
        const embedCM = embedLog(interaction).setTitle(`COMMENT REWARD`).setColor(0x99F3FF).setURL(`${tweetLink}`)
        await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedCM] })
      }, time)
      await UpdateProfile(interaction, { tweetComments: tweet_id })

      const embedCM = embedLog(interaction).setTitle(`Entered to be rewarded with Comment`).setColor(0x99F3FF).addFields({ name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}` }).setURL(`${tweetLink}`)
      try {
        await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedCM] })
      } catch (err) { console.log("Log channel couldn't be fetched") }
      return
    }
    return
  }
}

module.exports = { StepComment, Comment, modalComment }