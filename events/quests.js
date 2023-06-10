const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js')
require('dotenv').config()

const { userInfo, rewardUser } = require("../utils/connect")
const { userFollowing } = require("../utils/twitter.js")
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

    if (selected === 'watching_upvote') {
      if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
      return interaction.followUp({ content: "We are updating the endpoints for ME, at the moment this mission is not available. Once it's available again we will announce in <#1076805935126806528>. Thanks in advance for your patience and understanding! ", ephemeral: true })
      await userInfo(interaction.user.id).then(async r => {
        if (r === undefined) return console.log(r)
        const publicKey = await r.user.public_key
        await getMagicEdenWatchList(publicKey).then(async (ans) => {
          if (ans === false) {
            return interaction.editReply({ content: "Failed verification! Make sure you are using the same wallet as the one you provided to ConnectApp", embeds: [embedME], ephemeral: true })
          }
          if (ans === true) {
            const amount = 500
            await interaction.editReply({ content: `Congratulations! We will keep track with random snapshots. The **${amount}** ${token} will be given to you during the next hours.`, ephemeral: true })
            setTimeout(async () => {
              await rewardUser(publicKey, amount, `${selected}_quest`)
              const embedCM = embedLog.setTitle(`Has been rewarded for Watching & Upvote on Magic Eden`).setColor(0xE42575)
              await interaction.guild.channels.cache.get(process.env.LOG_CH).send({ content: `${member}`, embeds: [embedCM] })
            }, 1000 * 10)
            await UpdateProfile(interaction, { quests: interaction.values[0] })
          }
          return
        })
      })
      return
    }
    return interaction.followUp({ content: "We are updating the verification, at the moment this mission is not available due to Twitte having issues with the API. Once it's available again we will announce in <#1076805935126806528>. Thanks in advance for your patience and understanding! ", ephemeral: true })
    if (selected === 'follow_mindfolk') {
      IMPORTANT
      //if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
      await userInfo(interaction.user.id).then(async r => {
        if (r === undefined) return console.log(r)
        if (r.user.twitter === null || r.user.twitter.access_token === null) {
          return interaction.editReply({ embeds: [appEmbed], components: [linkRow], ephemeral: true })
        }
        const wallet = await r.user.public_key
        const twitter_userId = await r.user.twitter.id
        const access_token = await r.user.twitter.access_token
        const following_id = "1421378445301456902"
        const twitter_username = r.user.twitter.username
        await getFollowing(twitter_username).then(async d => {
          return console.log(d)
        })

        return

        await userFollowing(twitter_userId, following_id, access_token, wallet).then(async d => {
          return console.log(d)
          if (d === undefined || !d) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
          if (d === -1) {
            const failEmb = failedFollowQuest("mindfolkArt").setThumbnail("https://pbs.twimg.com/profile_images/1600926883390099469/-BXR9Yrn_400x400.jpg")
            await interaction.editReply({ embeds: [failEmb], ephemeral: true })
          } else {
            const amount = 500
            const successEmb = successFollowQuest(amount).setThumbnail("https://pbs.twimg.com/profile_images/1600926883390099469/-BXR9Yrn_400x400.jpg")
            await interaction.editReply({ embeds: [successEmb], ephemeral: true })
            await userInfo(interaction.user.id).then(async r => {
              return rewardUser(wallet, amount, `follow_Mindfolk`).then(async () => {
                await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} REWARDED FOR FOLLOWING: **MINDFOLK**` })
              })
            })
            await updateProfile({ quests: interaction.values[0] })
          }
        })
      })
      return
    }
    if (selected === 'follow_jurgens') {
      if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
      await userInfo(interaction.user.id).then(async r => {
        if (r.user.twitter === null || r.user.twitter.access_secret === null) {
          return interaction.editReply({ embeds: [appEmbed], components: [linkRow], ephemeral: true })
        }
        if (r === undefined) return console.log(r)
        const wallet = await r.user.public_key
        const twitter_id = await r.user.twitter.blob.id_str
        const access_token = await r.user.twitter.access_token
        const access_secret = await r.user.twitter.access_secret
        const friend_id = 1479124440118145000
        await friendsV1(twitter_id, friend_id, access_token, access_secret).then(async d => {
          if (d === undefined || !d) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
          if (d === -1) {
            const failEmb = failedFollowQuest("Jurgens_walt").setThumbnail("https://pbs.twimg.com/profile_images/1593651244631031808/9fI0CwBQ_400x400.jpg")
            await interaction.editReply({ embeds: [failEmb], ephemeral: true })
          } else {
            const amount = 250
            const successEmb = successFollowQuest(amount).setThumbnail("https://pbs.twimg.com/profile_images/1593651244631031808/9fI0CwBQ_400x400.jpg")
            await interaction.editReply({ embeds: [successEmb], ephemeral: true })
            await userInfo(interaction.user.id).then(async r => {
              return rewardUser(wallet, amount, `follow_Jurgens`).then(async () => {
                await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} REWARDED FOR FOLLOWING: **JURGENS**` })
              })
            })
            await updateProfile({ quests: interaction.values[0] })
          }
        })
      })
      return
    }
    if (selected === 'follow_ivan') {
      if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
      await userInfo(interaction.user.id).then(async r => {
        if (r === undefined) return console.log(r)
        if (r.user.twitter === null || r.user.twitter.access_secret === null) {
          return interaction.editReply({ embeds: [appEmbed], components: [linkRow], ephemeral: true })
        }
        const wallet = await r.user.public_key
        const twitter_id = await r.user.twitter.blob.id_str
        const access_token = await r.user.twitter.access_token
        const access_secret = await r.user.twitter.access_secret
        const friend_id = 1482034759362613200
        await friendsV1(twitter_id, friend_id, access_token, access_secret).then(async d => {
          if (d === undefined || !d) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
          if (d === -1) {
            const failEmb = failedFollowQuest("Ivanhyphen").setThumbnail("https://pbs.twimg.com/profile_images/1578351042944798722/61_AgDEn_400x400.jpg")
            await interaction.editReply({ embeds: [failEmb], ephemeral: true })
          } else {
            const amount = 250
            const successEmb = successFollowQuest(amount).setThumbnail("https://pbs.twimg.com/profile_images/1578351042944798722/61_AgDEn_400x400.jpg")
            await interaction.editReply({ embeds: [successEmb], ephemeral: true })
            await userInfo(interaction.user.id).then(async r => {
              return rewardUser(wallet, amount, `follow_Ivan`).then(async () => {
                await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} REWARDED FOR FOLLOWING: **IVAN**` })
              })
            })
            await updateProfile({ quests: interaction.values[0] })
          }
        })
      })
      return
    }
    if (selected === 'follow_sig') {
      if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
      await userInfo(interaction.user.id).then(async r => {
        if (r === undefined) return console.log(r)
        if (r.user.twitter === null || r.user.twitter.access_secret === null) {
          return interaction.editReply({ embeds: [appEmbed], components: [linkRow], ephemeral: true })
        }
        const wallet = await r.user.public_key
        const twitter_id = await r.user.twitter.blob.id_str
        const access_token = await r.user.twitter.access_token
        const access_secret = await r.user.twitter.access_secret
        const friend_id = 1481656370604687400
        await friendsV1(twitter_id, friend_id, access_token, access_secret).then(async d => {
          if (d === undefined || !d) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
          if (d === -1) {
            const failEmb = failedFollowQuest("multi_Sig").setThumbnail("https://pbs.twimg.com/profile_images/1621868364389052418/XaP1rBQQ_400x400.jpg")
            await interaction.editReply({ embeds: [failEmb], ephemeral: true })
          } else {
            const amount = 250
            const successEmb = successFollowQuest(amount).setThumbnail("https://pbs.twimg.com/profile_images/1621868364389052418/XaP1rBQQ_400x400.jpg")
            await interaction.editReply({ embeds: [successEmb], ephemeral: true })
            await userInfo(interaction.user.id).then(async r => {
              return rewardUser(wallet, amount, `follow_Sig`).then(async () => {
                await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} REWARDED FOR FOLLOWING: **SIG**` })
              })
            })
            await updateProfile({ quests: interaction.values[0] })
          }
        })
      })
      return
    }
    if (selected === 'follow_alfred') {
      if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
      await userInfo(interaction.user.id).then(async r => {
        if (r === undefined) return console.log(r)
        if (r.user.twitter === null || r.user.twitter.access_secret === null) {
          return interaction.editReply({ embeds: [appEmbed], components: [linkRow], ephemeral: true })
        }
        const wallet = await r.user.public_key
        const twitter_id = await r.user.twitter.blob.id_str
        const access_token = await r.user.twitter.access_token
        const access_secret = await r.user.twitter.access_secret
        const friend_id = 1481956631046987800
        await friendsV1(twitter_id, friend_id, access_token, access_secret).then(async d => {
          if (d === undefined || !d) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
          if (d === -1) {
            const failEmb = failedFollowQuest("BuilderAlfred").setThumbnail("https://pbs.twimg.com/profile_images/1622183771691687942/a6y6J6-u_400x400.jpg")
            await interaction.editReply({ embeds: [failEmb], ephemeral: true })
          } else {
            const amount = 250
            const successEmb = successFollowQuest(amount).setThumbnail("https://pbs.twimg.com/profile_images/1622183771691687942/a6y6J6-u_400x400.jpg")
            await interaction.editReply({ embeds: [successEmb], ephemeral: true })
            await userInfo(interaction.user.id).then(async r => {
              return rewardUser(wallet, amount, `follow_Alfred`).then(async () => {
                await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} REWARDED FOR FOLLOWING: **ALFRED**` })
              })
            })
            await updateProfile({ quests: interaction.values[0] })
          }
        })
      })
      return
    }
    if (selected === 'follow_carl') {
      if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
      await userInfo(interaction.user.id).then(async r => {
        if (r === undefined) return console.log(r)
        if (r.user.twitter === null || r.user.twitter.access_secret === null) {
          return interaction.editReply({ embeds: [appEmbed], components: [linkRow], ephemeral: true })
        }
        const wallet = await r.user.public_key
        const twitter_id = await r.user.twitter.blob.id_str
        const access_token = await r.user.twitter.access_token
        const access_secret = await r.user.twitter.access_secret
        const friend_id = 1481659543100829700
        await friendsV1(twitter_id, friend_id, access_token, access_secret).then(async d => {
          if (d === undefined || !d) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
          if (d === -1) {
            const failEmb = failedFollowQuest("CarlMindFolk").setThumbnail("https://pbs.twimg.com/profile_images/1481659799171391494/CkKG_APD_400x400.jpg")
            await interaction.editReply({ embeds: [failEmb], ephemeral: true })
          } else {
            const amount = 250
            const successEmb = successFollowQuest(amount).setThumbnail("https://pbs.twimg.com/profile_images/1481659799171391494/CkKG_APD_400x400.jpg")
            await interaction.editReply({ embeds: [successEmb], ephemeral: true })
            await userInfo(interaction.user.id).then(async r => {
              return rewardUser(wallet, amount, `follow_Carl`).then(async () => {
                await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} REWARDED FOR FOLLOWING: **CARL**` })
              })
            })
            await updateProfile({ quests: interaction.values[0] })
          }
        })
      })
      return
    }
    if (selected === 'follow_kirtan') {
      if (searchQuest !== -1) return interaction.followUp({ embeds: [completedQuest], ephemeral: true })
      await userInfo(interaction.user.id).then(async r => {
        if (r === undefined) return console.log(r)
        if (r.user.twitter === null || r.user.twitter.access_secret === null) {
          return interaction.editReply({ embeds: [appEmbed], components: [linkRow], ephemeral: true })
        }
        const wallet = await r.user.public_key
        const twitter_id = await r.user.twitter.blob.id_str
        const access_token = await r.user.twitter.access_token
        const access_secret = await r.user.twitter.access_secret
        const friend_id = 1465616116215124000
        await friendsV1(twitter_id, friend_id, access_token, access_secret).then(async d => {
          if (d === undefined || !d) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
          if (d === -1) {
            const failEmb = failedFollowQuest("Kirtan_108").setThumbnail("https://pbs.twimg.com/profile_images/1621891254442131456/HllJdVTL_400x400.jpg")
            await interaction.editReply({ embeds: [failEmb], ephemeral: true })
          } else {
            const amount = 250
            const successEmb = successFollowQuest(amount).setThumbnail("https://pbs.twimg.com/profile_images/1621891254442131456/HllJdVTL_400x400.jpg")
            await interaction.editReply({ embeds: [successEmb], ephemeral: true })
            await userInfo(interaction.user.id).then(async r => {
              return rewardUser(wallet, amount, `follow_Kirtan`).then(async () => {
                await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} REWARDED FOR FOLLOWING: **KIRTAN**` })
              })
            })
            await updateProfile({ quests: interaction.values[0] })
          }
        })
      })
      return
    }
    // if (selected === 'discord_quests') {
    //   if (searchQuest !== -1) return interaction.followUp({ content: "Already completed this quest!", ephemeral: true })
    //   const proof = !member.nickname ? false : member.nickname.includes('+')
    //   const proof2 = member.user.username.includes('+')
    //   if (proof === false && proof2 === false) {
    //     await interaction.editReply({ content: "Failed verification! To be elegible to enter the rewards you need to add first the + to your name", ephemeral: true })
    //   }
    //   if (proof === true || proof2 === true) {
    //     const amount = 250
    //     await interaction.editReply({ content: `Congratulations! You have earned **${amount}** ${token} for the name! The other **${amount}** ${token} will be given to you during the next hours for the pfp.`, ephemeral: true })
    //     await userInfo(interaction.user.id).then(async r => {
    //       const publicKey = await r.user.public_key
    //       return rewardUser(publicKey, amount, `quest_discord_pfp_username`).then(async () => {
    //         await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} **REWARDED FOR DISCORD NAME**` })
    //       })
    //     })
    //     await updateProfile({ quests: interaction.values[0] })
    //     await interaction.guild.channels.cache.get(process.env.PFP_CH).send({ content: `${interaction.user.id}`, embeds: [questPFP(member)], components: [verificationRow] })
    //   }
    // }
    // if (selected === 'twitter_quests') {
    //   if (searchQuest !== -1) return interaction.followUp({ content: "Already completed this quest!", ephemeral: true })
    //   await userInfo(interaction.user.id).then(async r => {
    //     if (r === undefined) return
    //     const twitter_user = await r.user.twitter.username
    //     const twitter_id = await r.user.twitter.blob.id_str
    //     const wallet = await r.user.public_key
    //     const access_token = await r.user.twitter.access_token
    //     const access_secret = await r.user.twitter.access_secret

    //     await userV1(twitter_id, access_token, access_secret).then(async d => {
    //       if (d === undefined || !d) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
    //       const proof = d === undefined || !d ? false : d.name.includes('+')
    //       if (proof === false) {
    //         await interaction.editReply({ content: "Failed verification! To be elegible to enter the rewards you need to add first the + to your name", ephemeral: true })
    //       }
    //       if (proof === true) {
    //         const amount = 250
    //         await interaction.editReply({ content: `Congratulations! You have earned **${amount}** ${token} for the name! The other **${amount}** ${token} will be given to you during the next hours for the pfp.`, ephemeral: true })
    //         await userInfo(interaction.user.id).then(async r => {
    //           return rewardUser(wallet, amount, `quest_twitter_pfp_username`).then(async () => {
    //             await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} **REWARDED FOR TWITTER NAME**` })
    //           })
    //         })
    //         await updateProfile({ quests: interaction.values[0] })
    //         await interaction.guild.channels.cache.get(process.env.PFP_CH).send({ content: `${interaction.user.id}`, embeds: [questPFPTwitter(member, r)], components: [verificationRow] })
    //       }
    //     })
    //     return

    //     await userLookUp(twitter_userId, twitter_userId, access_token, wallet).then(async r => {
    //       if (r === 500 || r === 502 || r === 503 || r === 504) {
    //         return interaction.editReply({ content: "Twitter servers are experiencing issues, please try to claim again. If the issue persist, try to re-connect the twitter app in Connect.", ephemeral: true })
    //       }
    //       const proof = r === undefined || !r ? false : r.data.name.includes('+')
    //       if (proof === false) {
    //         await interaction.editReply({ content: "Failed verification! To be elegible to enter the rewards you need to add first the + to your name", ephemeral: true })
    //       }
    //       if (proof === true) {
    //         const amount = 250
    //         await interaction.editReply({ content: `Congratulations! You have earned **${amount}** ${token} for the name! The other **${amount}** ${token} will be given to you during the next hours for the pfp.`, ephemeral: true })
    //         await userInfo(interaction.user.id).then(async r => {
    //           return rewardUser(wallet, amount, `quest_twitter_pfp_username`).then(async () => {
    //             await interaction.guild.channels.cache.get(process.env.REWARD_LOG).send({ content: `${interaction.user.id} ${member} **REWARDED FOR TWITTER NAME**` })
    //           })
    //         })
    //         await updateProfile({ quests: interaction.values[0] })
    //         await interaction.guild.channels.cache.get(process.env.PFP_CH).send({ content: `${interaction.user.id}`, embeds: [questPFPTwitter(member, r)], components: [verificationRow] })
    //       }
    //     })
    //   })
    // }
    return
  }
}

module.exports = { Quests, QuestsBoard }