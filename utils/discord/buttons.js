const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')
const config = require("../../config")
const url_link = config.url
const brand_name = config.brand_name


const reject = new ButtonBuilder()
.setCustomId('reject')
.setLabel('   Reject   ')
.setStyle(ButtonStyle.Danger)

const approve = new ButtonBuilder()
.setCustomId('approve')
.setLabel('   Approve   ')
.setStyle(ButtonStyle.Success)

const xxx = new ButtonBuilder()
.setCustomId('comment')
.setLabel('Claim Comment')
.setStyle(ButtonStyle.Primary)
.setEmoji(':cmt:1055291293477122068')


const Comment = new ButtonBuilder()
.setCustomId('comment')
.setLabel('Comment')
.setStyle(ButtonStyle.Primary)
.setEmoji(':cmt:1055291293477122068')

const link = new ButtonBuilder()
.setURL(url_link)
.setLabel(`conn3ct with ${brand_name}`)
.setStyle('Link')

const linkButton = new ButtonBuilder()
.setURL(url_link)
.setLabel('Re-Link Twitter')
.setStyle('Link')
.setEmoji(':logoapp:1065033438069002241')

function engagementRow(tweet_id){
    const Like = new ButtonBuilder()
        .setCustomId(`postlike_${tweet_id}`)
        .setLabel('Like')
        .setStyle(ButtonStyle.Danger)
        .setEmoji(':lk:1055291295045787718')

    const LikeLink = new ButtonBuilder()
        .setLabel('Like')
        .setStyle(ButtonStyle.Link)
        .setEmoji(':like:1075733296937443462')
        .setURL(`https://twitter.com/intent/like?tweet_id=${tweet_id}`)

    const Retweet = new ButtonBuilder()
        .setCustomId(`postretweet_${tweet_id}`)
        .setLabel('Retweet')
        .setStyle(ButtonStyle.Success)
        .setEmoji(':rt:1055291296425717761')

    const RetweetLink = new ButtonBuilder()
        .setLabel('Retweet')
        .setStyle(ButtonStyle.Link)
        .setEmoji(':retweet2:1075734927238246420')
        .setURL(`https://twitter.com/intent/retweet?tweet_id=${tweet_id}`)

    const CommentLink = new ButtonBuilder()
        .setLabel('Comment')
        .setStyle(ButtonStyle.Link)
        .setEmoji(':reply:1075737166338064505')
        .setURL(`https://twitter.com/intent/tweet?in_reply_to=${tweet_id}`)


    const eRow = new ActionRowBuilder().addComponents(Like, Retweet)
    const eRow2 = new ActionRowBuilder().addComponents(LikeLink, RetweetLink, CommentLink)
    return eRow2
}

const one = new ButtonBuilder()
.setCustomId('number_one')
.setLabel('1')
.setStyle(ButtonStyle.Primary)
const two = new ButtonBuilder()
.setCustomId('number_two')
.setLabel('2')
.setStyle(ButtonStyle.Primary)
const three = new ButtonBuilder()
.setCustomId('number_three')
.setLabel('3')
.setStyle(ButtonStyle.Primary)
const four = new ButtonBuilder()
.setCustomId('number_four')
.setLabel('4')
.setStyle(ButtonStyle.Primary)
const five = new ButtonBuilder()
.setCustomId('number_five')
.setLabel('5')
.setStyle(ButtonStyle.Primary)
const six = new ButtonBuilder()
.setCustomId('number_six')
.setLabel('6')
.setStyle(ButtonStyle.Primary)
const seven = new ButtonBuilder()
.setCustomId('number_seven')
.setLabel('7')
.setStyle(ButtonStyle.Primary)
const eight = new ButtonBuilder()
.setCustomId('number_eight')
.setLabel('8')
.setStyle(ButtonStyle.Primary)
const nine = new ButtonBuilder()
.setCustomId('number_nine')
.setLabel('9')
.setStyle(ButtonStyle.Primary)
const zero = new ButtonBuilder()
.setCustomId('number_zero')
.setLabel('0')
.setStyle(ButtonStyle.Primary)
const erase = new ButtonBuilder()
.setCustomId('number_erase')
.setLabel('\u200b')
.setEmoji(':delete:1086966724320034836')
.setStyle(ButtonStyle.Danger)
const buyTickets = new ButtonBuilder()
.setCustomId('buyTickets')
.setLabel('\u200b')
.setEmoji(':buy:1086972277087809626')
.setStyle(ButtonStyle.Success)

const ticketsRow1 = new ActionRowBuilder().addComponents(one, two, three)
const ticketsRow2 = new ActionRowBuilder().addComponents(four, five, six)
const ticketsRow3 = new ActionRowBuilder().addComponents(seven, eight, nine)
const ticketsRow4 = new ActionRowBuilder().addComponents(erase, zero, buyTickets)
const ticketsRow = [ ticketsRow1, ticketsRow2, ticketsRow3, ticketsRow4 ]

const verificationRow = new ActionRowBuilder().addComponents(approve, reject)
const linkRow = new ActionRowBuilder().addComponents(link)
const relinkRow = new ActionRowBuilder().addComponents(linkButton)

module.exports = { 
    verificationRow, 
    engagementRow,
    relinkRow, 
    linkRow, 
    ticketsRow 
}