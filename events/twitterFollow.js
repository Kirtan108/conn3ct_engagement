const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
require('dotenv').config()

const { userInfo, rewardUser } = require("../utils/connect")
const { Profile, UpdateProfile } = require('../utils/mongo.js')

const { connectDiscord, connectTwitter, claimVerified, embedLog, failedVerification, enteredReward, appEmbed, relinkApp, processingEmbed } = require("../utils/discord/embeds")
const { linkRow, relinkRow } = require("../utils/discord/buttons")

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

async function Follow(interaction){
    const profile = await Profile(interaction)

    const member = interaction.guild.members.cache.get(interaction.user.id)
    const time = 1000 * 5

    if (interaction.customId === 'follow'){
        await userInfo(interaction.user.id).then(async r => {
            if (r === undefined || r.error !== null) return interaction.editReply({ embeds: [connectDiscord], components: [linkRow], ephemeral: true })

            if (r.user.twitter === null || r.user.twitter.access_token === null) return interaction.editReply({ embeds: [connectTwitter], components: [linkRow], ephemeral: true })
            
            if (r.user.twitter.refresh_token === null) return interaction.editReply({ embeds: [connectTwitter], components: [linkRow], ephemeral: true })
    
            const twitter_userId = await r.user.twitter.id
            const wallet = await r.user.public_key
            const access_token = await r.user.twitter.access_token
            const twitter_user = await r.user.twitter.username
            const following_id = "1421378445301456902" // RAPOSA "1604359811507822593" 

            await userFollowing(twitter_userId, following_id, access_token, wallet)
        })
    }
    
}

module.exports = Follow