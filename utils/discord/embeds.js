const { EmbedBuilder } = require('discord.js')
const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"
const config = require("../../config")
const token = config.token
const colors = config.colors
const url_link = config.url
const brand_name = config.brand_name

const connectDiscord = new EmbedBuilder()
.setAuthor({ name: brand_name })
.setColor(colors.void)
.setTitle("You need to connect Discord")
.setFooter({ text: `powered by conn3ct`, iconURL: "https://cdn.discordapp.com/attachments/1067125336887795723/1087710150451802112/conn3ct_logo-2.png" })

const connectTwitter = new EmbedBuilder()
.setAuthor({ name: brand_name })
.setColor(0x2f3136)
.setTitle("You need connect Twitter")
.setFooter({ text: `powered by conn3ct`, iconURL: "https://cdn.discordapp.com/attachments/1067125336887795723/1087710150451802112/conn3ct_logo-2.png" })

function claimVerified(amount, action){
    const embed = new EmbedBuilder()
    .setImage(`${downpage}`)
    .setColor(colors.brand)
    .setTitle(`Successfully verified!`)
    .setDescription(`Congratulations! Random snapshots will be taken to verify that the Tweet still has your ${action}. During the next hours the reward will be added to your current balance.`)
    .addFields({ name: `• Reward for ${action}`, value: `> **${amount}** ${token.emoji}` })
    .setTimestamp()
    
    return embed
}

function bonusReward(amount, action){
    const embed = new EmbedBuilder()
    .setImage(`${downpage}`)
    .setColor(colors.brand)
    .setTitle(`Bonus Successfully verified!`)
    .setDescription(`Congratulations for earning the bonus reward! Random snapshots will be taken to verify that the Tweet still has your ${action}. During the next hours the reward will be added to your current balance.`)
    .addFields({ name: `• Reward for ${action}`, value: `> **${amount}** ${token.emoji}` })
    .setTimestamp()
    
    return embed
}

const failedVerification = new EmbedBuilder()
.setImage(`${downpage}`)
.setColor(0x0a0a0a)
.setTitle(`Failed verification!`)
.setDescription(`Unable to detect your action for the Tweet. If you already did the action, await few seconds and try again. If the issue persist, please open a ticket so we can assist you.`) // try re-connecting the Twitter in [<:Link:1066039754749128714>](${url_link}).)
.setTimestamp()

const failedComment = new EmbedBuilder()
.setImage(`${downpage}`)
.setColor(0x0a0a0a)
.setTitle(`Failed Comment!`)
.setDescription(`You need to Tweet using the thread and writing inside the your reply.\n\nYou can attach an image if needed.`)
.setTimestamp()

function failedFollowQuest(account) {
  const failedFollow = new EmbedBuilder()
  .setTitle(`Failed following verification!`)
  .setImage(`${downpage}`)
  .setColor(0x0a0a0a)
  .setDescription(`Unable to verify this action. Make sure you are following the account.\n> **https://twitter.com/${account}**`)
  return failedFollow
}

function successFollowQuest(amount) {
    const embed = new EmbedBuilder()
        .setImage(`${downpage}`)
        .setColor(colors.brand)
        .setTitle(`Quest verified!`)
        .setDescription(`Congratulations for completing the quest! Random snapshots will be taken to verify that you keep following the account.`)
        .addFields({ name: `• Reward for quest`, value: `> **${amount}** ${token.emoji}` })
    return embed
}

const embedLog = (interaction) => {
    const member = interaction.guild.members.cache.get(interaction.user.id)    
    const embed = new EmbedBuilder()
        .setImage(`${downpage}`)
        .setThumbnail(`${member.displayAvatarURL()}`)
        .setDescription(`• ${member}`)
        .setFooter({ text: `ID: ${member.id}` })
        .setTimestamp()
    return embed
}


const enteredReward = new EmbedBuilder()
.setImage(`${downpage}`)
.setColor(0xFFE586)
.setTitle(`You have already claimed these rewards!`)

const completedQuest = new EmbedBuilder()
.setImage(`${downpage}`)
.setColor(0xFFE586)
.setTitle(`You have already completed this quest!`)


function questCompleted(member){
    const embed = new EmbedBuilder()
    .setColor(0x0a0a0a)
    .setTitle(`User not Connected to the App`)
    .setDescription(`• ${member}`)
    .setThumbnail(`${member.displayAvatarURL()}`)
    .setTimestamp()
    .setFooter({ text: `powered by conn3ct`, iconURL: "https://cdn.discordapp.com/attachments/1067125336887795723/1087710150451802112/conn3ct_logo-2.png" })
    
    return embed
}

function questPFP(member){
    const name = !member.nickname ? member.user.username : member.nickname
    const embed = new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle(`⸺  ${name + '#' + member.user.discriminator}   ⸺`)
    .setImage(`${member.displayAvatarURL({ size: 1024, format: 'png', dynamic: true})}`)
    .setTimestamp()    
    return embed
}
function questPFPTwitter(member, twitter){
    // FOR V2 .data.username
    const name = !member.nickname ? member.user.username : member.nickname
    const username = twitter.username
    const embed = new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle(`⸺  ${name + '#' + member.user.discriminator}   ⸺`)
    .addFields(
        { name: 'Twitter Account', value: `**https://twitter.com/${username}**`, inline: true },
    )
    .setColor(0x3792cb)
    .setTimestamp()
    
    const pfp = !twitter.profile_image_url ? '' : embed.setImage(twitter.profile_image_url.replace('_normal', ''))
    return embed
}

const connectStore2 = new EmbedBuilder()
.setTitle("Connect Store")
.setDescription(`This is the place where you can use Discord $${token.name} ${token.emoji} to purchase items and receive airdrops. The available options are in the dropdown menu below.\n\n*The Store will be updated regularly adding more options to use the $WOOD*`)
.setColor(0xBFF5A1)
.setImage(`${downpage}`)

const connectStore1 = new EmbedBuilder()
.setImage("https://cdn.discordapp.com/attachments/1067125336887795723/1067125578420994128/store_1.png")
.setColor(0x2f3136)

const connectQuest2 = new EmbedBuilder()
.setTitle("Connect Quests")
.setDescription(`This is the place where you can see and complete quests to earn Discord $${token.name} ${token.emoji}. The available quests are in the dropdown menu below.\n\n*The quests will be updated regularly adding more options to earn $WOOD*`)
.setColor(0xBFF5A1)
.setImage(`${downpage}`)

const connectQuest1 = new EmbedBuilder()
.setImage("https://cdn.discordapp.com/attachments/1067125336887795723/1067125578664259584/quests_1.png")
.setColor(0x2f3136)

const connectBalance1 = new EmbedBuilder()
.setImage("https://cdn.discordapp.com/attachments/1067125336887795723/1067125578215465061/balance_1.png")
.setColor(0x2f3136)

const connectTickets1 = new EmbedBuilder()
.setImage("https://cdn.discordapp.com/attachments/1067125336887795723/1083508260264497272/ticketsProfile.png")
.setColor(0x2f3136)

const relinkApp = new EmbedBuilder()
.setTitle('Twitter is having a server issue.')
.setDescription(`Please re-connect with twitter using the button below and try again`)


const embedME = new EmbedBuilder()
.setTitle(`How to complete the quest`)
.setColor(0x2f3136)
.setDescription(`**・[Add Mindfolk to the Watchlist <:Link:1066039754749128714>](https://magiceden.io/marketplace/mindfolk)**`)

const reconnectTwitter = new EmbedBuilder()
.setColor(0x2f3136)
.setTitle("You need to Re-Connect Twitter to the App")
.setFooter({ text: `powered by conn3ct`, iconURL: "https://cdn.discordapp.com/attachments/1067125336887795723/1087710150451802112/conn3ct_logo-2.png" })

const processingEmbed = new EmbedBuilder()
.setColor(0x2f3136)
.setTitle("Processing....")
.setImage('https://cdn.discordapp.com/attachments/1034106468800135168/1105030374729465856/loading_1.gif')

module.exports = {
    connectDiscord,
    connectTwitter,
    claimVerified,
    bonusReward,
    embedLog, 
    failedVerification, 
    failedComment, 
    enteredReward, 
    completedQuest, 
    questCompleted, 
    questPFP, 
    questPFPTwitter, 
    failedFollowQuest, 
    successFollowQuest, 
    embedME, 
    connectStore1, 
    connectStore2, 
    connectQuest1, 
    connectQuest2, 
    connectBalance1, 
    reconnectTwitter, 
    connectTickets1,
    relinkApp,
    processingEmbed
}