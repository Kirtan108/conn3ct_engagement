const { ContextMenuCommandBuilder, ApplicationCommandType, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()
const { getProfile } = require("../../utils/server")
const { userInfo } = require("../../utils/connect")

const { parseISOString, isoFormatDMY, format, getMonthName } = require("../../utils/functions")
const upperBanner = 'https://cdn.discordapp.com/attachments/1029344506065190913/1065808426917179554/twitterbanner_1.png'
const banner = new EmbedBuilder().setColor(0x2f3136).setImage(upperBanner)
const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"
const logoApp = "https://cdn.discordapp.com/attachments/1034106468800135168/1064881363393708103/appconnect.png"
const userInteraction = new Map()

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Twitter Profile')
        .setType(ApplicationCommandType.User),
    run: async ({ client, interaction }) => {
        await interaction.deferReply({ ephemeral: true })
        const user = interaction.targetUser.id
        const member = interaction.guild.members.cache.get(user)

        // const hasTier4 = await member["_roles"].findIndex(r => r === process.env.T4_ROLE)
        // if(hasPioneer === -1 && hasTier1 === -1 && hasTier2 === -1 && hasTier3 === -1 && hasTier32 === -1 && hasTier4 === -1) return interaction.followUp({ content: "You can only watch the profile for Mindfolk Holders!", ephemeral: true })

        const wall = []
        //const TwitterProfile = async () => {
        const r = await userInfo(interaction.user.id)
        if (r === undefined || r.error !== null) {
            wall.push({ id: interaction.user.id, counter: 1 })
            const appEmbed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle("You need to connect to the App")
                .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
            const button = new ButtonBuilder()
                .setURL("https://connect.mindfolk.art/")
                .setLabel('Connect App')
                .setStyle('Link')
            const row = new ActionRowBuilder().addComponents(button)
            return interaction.editReply({ embeds: [appEmbed], components: [row], ephemeral: true })
        }
        // if(r.user.twitter === null || r.user.twitter.access_token === null){
        //         const appEmbed = new EmbedBuilder()
        //         .setColor(0x2f3136)
        //         .setTitle("You need to Connect Twitter to the App")
        //         .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
        //         const button = new ButtonBuilder()
        //           .setURL("https://connect.mindfolk.art/")
        //           .setLabel('Connect App')
        //           .setStyle('Link')
        //         const row = new ActionRowBuilder().addComponents(button)
        //         return interaction.editReply({ embeds:[appEmbed], components:[row], ephemeral: true})
        // }

        //const twitter_user = await r.user.twitter.username
        const twitter_userId = await r.user.twitter.id
        const wallet = await r.user.public_key
        const access_token = await r.user.twitter.access_token

        const d = await userInfo(user)
        if (d === undefined || d.error !== null) return interaction.editReply({ content: "User not connected to the App", ephemeral: true })
        if (d.user.twitter === null) return interaction.editReply({ content: "User not connected to the App", ephemeral: true })
        if (d.user.twitter.refresh_token === null) return interaction.editReply({ content: "User needs to reconnect Twitter to the App", ephemeral: true })
        const twitterHandle = await d.user.twitter.username

        const i = await getProfile(twitterHandle)

        //if (!i) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
        if (!i) return interaction.followUp({ content: "Please wait 5s and try again!", ephemeral: true })

        const name = i.twitterName
        const username = i.twitterHandle
        const pfp = i.twitterProfilePicture
        const followers = i.profileFollowers.split(" ")[0]
        const following = i.profileFollowing.split(" ")[0]
        const description = i.profileDescription
        const location = !i.location ? '' : `📍 ${i.location}`
        const profileLink = `https://twitter.com/${twitterHandle}`
        const created = i.joinedTime

        const twitterProfile = new EmbedBuilder().setColor(0xAFE0DD).setImage(`${downpage}`)
            .setAuthor({ name: `${username}` })
            .setTitle(`**⸺ ${name}**`)
            .setThumbnail(pfp)
            .setDescription(description + `\n\n${location}\n🗓️ ${created}\n\nProfile Link: [twitter.com/${twitterHandle} <:Link:1066039754749128714>](${profileLink})`)
            .addFields(
                { name: 'Following', value: `**${following}**`, inline: true },
                { name: 'Followers', value: `**${followers}**`, inline: true },
            )
            .setFooter({ text: "Connect - Powered by Mindfolk", iconURL: `${logoApp}` })


        const button = new ButtonBuilder()
            .setCustomId(`following_${twitterHandle}_${user}`)
            .setLabel('  Follow User  ')
            .setStyle(ButtonStyle.Primary)
            .setEmoji(':twitter:1066821775146627152')
        const buttonF = new ButtonBuilder()
            .setCustomId(`followUser ${username} ${user}`)
            .setLabel('  Follow User  ')
            .setStyle(ButtonStyle.Primary)
            .setEmoji(':twitter:1066821775146627152')
        const button2 = new ButtonBuilder()
            .setURL(profileLink)
            .setLabel(' Go to Twitter profile')
            .setStyle('Link')
            .setEmoji(':profile:1065817448223358976')

        const row = new ActionRowBuilder().addComponents(button2) //button missing

        return interaction.editReply({ embeds: [banner, twitterProfile], components: [row], ephemeral: true })

    },
};