const { ContextMenuCommandBuilder, ApplicationCommandType, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()
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

        const userKey = `${interaction.user.id}`

        const getInteraction = (action) => {
            userInteraction.set(`${userKey}`, new Date().getTime().toString())
            setTimeout(() => {
              userInteraction.delete(`${action}${userKey}`)
            }, 1000 * 5)
        }
        // const hasTier4 = await member["_roles"].findIndex(r => r === process.env.T4_ROLE)
        // if(hasPioneer === -1 && hasTier1 === -1 && hasTier2 === -1 && hasTier3 === -1 && hasTier32 === -1 && hasTier4 === -1) return interaction.followUp({ content: "You can only watch the profile for Mindfolk Holders!", ephemeral: true })
        
        const wall = []
        //const TwitterProfile = async () => {
        await userInfo(interaction.user.id).then(async r => {
            if(r === undefined || r.error !== null){
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
                return interaction.editReply({ embeds:[appEmbed], components:[row], ephemeral: true})
            }
            if(r.user.twitter === null || r.user.twitter.access_token === null){
                const appEmbed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle("You need to Connect Twitter to the App")
                .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
                const button = new ButtonBuilder()
                  .setURL("https://connect.mindfolk.art/")
                  .setLabel('Connect App')
                  .setStyle('Link')
                const row = new ActionRowBuilder().addComponents(button)
                return interaction.editReply({ embeds:[appEmbed], components:[row], ephemeral: true})
            }
            if(r.user.twitter.refresh_token === null){
                const appEmbed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle("Update! You need to Re-Connect Twitter to the App")
                .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
                const button = new ButtonBuilder()
                  .setURL("https://connect.mindfolk.art/")
                  .setLabel('Connect App')
                  .setStyle('Link')
                const row = new ActionRowBuilder().addComponents(button)
                return interaction.editReply({ embeds:[appEmbed], components:[row], ephemeral: true})
            }
            //const twitter_user = await r.user.twitter.username
            const twitter_userId = await r.user.twitter.id
            const wallet = await r.user.public_key
            const access_token = await r.user.twitter.access_token

            await userInfo(user).then(async d => {
                if (d === undefined || d.error !== null) return interaction.editReply({ content: "User not connected to the App", ephemeral: true })
                if (d.user.twitter === null) return interaction.editReply({ content: "User not connected to the App", ephemeral: true })
                if (d.user.twitter.refresh_token === null) return interaction.editReply({ content: "User needs to reconnect Twitter to the App", ephemeral: true })
                const twitter_otherId = await d.user.twitter.id
                return
                const TwitterProfile = async () => {
                    await userLookUp(twitter_otherId, twitter_userId, access_token, wallet).then(async i => {
                        //if (!i) return interaction.editReply({ content: "An error has occured performing this action!", ephemeral: true })
                        if (i === undefined){
                            if (userInteraction.has(`${userKey}`)) return interaction.followUp({ content: "Please wait 5s and try again!", ephemeral: true })
                            getInteraction('TP')
                            return TwitterProfile()
                        }
                        const twitter = await i.data
                        const name = twitter.name
                        const username = twitter.username
                        const pfp = twitter.profile_image_url.replace('_normal', '')
                        const followers = twitter.public_metrics.followers_count
                        const following = twitter.public_metrics.following_count
                        const description = twitter.description
                        const location = !twitter.location ? '' : `📍 ${twitter.location}`
                        const profileLink = `https://twitter.com/${username}`
                        const created = parseISOString(twitter.created_at)//.split(" ")
                        const formatDate = isoFormatDMY(created).split("/")
                        const monthDate = getMonthName(formatDate[1])

                        const twitterProfile = new EmbedBuilder().setColor(0xAFE0DD).setImage(`${downpage}`)
                            .setAuthor({ name: `@${username}` })
                            .setTitle(`**⸺ ${name}**`)
                            .setThumbnail(pfp)
                            .setDescription(description + `\n\n${location}\n🗓️ Joined ${monthDate} ${formatDate[2]}\n\nProfile Link: [twitter.com/${username} <:Link:1066039754749128714>](${profileLink})`)
                            .addFields(
                                { name: 'Following', value: `**${format(following)}**`, inline: true },
                                { name: 'Followers', value: `**${format(followers)}**`, inline: true },
                            )
                            .setFooter({ text: "Connect - Powered by Mindfolk", iconURL: `${logoApp}` })


                        const button = new ButtonBuilder()
                            .setCustomId(`following_${twitter_otherId}_${user}`)
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
                    })
                }
                TwitterProfile()
            })
        })
    },
};