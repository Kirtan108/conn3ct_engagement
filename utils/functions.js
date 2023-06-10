const fetch = require('node-fetch')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()
const { EmbedBuilder } = require('discord.js')
const { raffleModel } = require("../models.js")

const userCache = {}

async function updateUserCache(interaction, action) {
  const userID = interaction.user.id
  if (!userCache[userID]) {
    userCache[userID] = [action]
  } else {
    userCache[userID].push(action)
  }
  console.log(`Added to userCache ${userID} with action ${action}`)
  setTimeout(() => {
    delete userCache[userID]
    console.log(`Removed from userCache ${userID}`)
  }, 5 * 60 * 1000) // 5 minutes in milliseconds
}

function getUserCache(interaction) {
  const userID = interaction.user.id  
  return userCache[userID] || null;
}

function format(number){
    const filter = number.toString().length
    if (filter <= 3){
      const res = parseFloat(number)
      return res
    } 
    if (filter <= 6){
      const res = (number/1000).toFixed(3)
      const num = res.replace(".", ",")
      return num
    }
}

function parseISOString(s) {
  var b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

function isoFormatDMY(d) {  
  function pad(n) {return (n<10? '0' :  '') + n}
  return pad(d.getUTCDate()) + '/' + pad(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear();
}

function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  // Using the browser's default locale.
  return date.toLocaleString('en-US', { month: 'long' });
}

async function tweetPik(tweet_id) {
  try {
    const response = await fetch('https://tweetpik.com/api/images', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: process.env.PIK_KEY
      },
      body: JSON.stringify({
        tweetId: tweet_id,
        //dimension: "1200:630",
        // colors: {
        //   backgroundColor: "#2F3136",
        //   textPrimaryColor: "#FFFFFF",
        //   textSecondaryColor: "#8899A6"
        // }
        //backgroundImage: "https://cdn.discordapp.com/attachments/1067125336887795723/1068965909093421146/FAQ.jpg"
      })
    })
    if(response.status >= 400) return null
    const data = await response.json()
    return data
  } catch (err) {
    console.log(err)
    return null
  }
}

function weightedRandom(items, weights) {
  if (items.length !== weights.length) {
    throw new Error('Items and weights must be of the same size');
  }

  if (!items.length) {
    throw new Error('Items must not be empty');
  }

  // Preparing the cumulative weights array.
  // For example:
  // - weights = [1, 4, 3]
  // - cumulativeWeights = [1, 5, 8]
  const cumulativeWeights = [];
  for (let i = 0; i < weights.length; i += 1) {
    cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
  }

  // Getting the random number in a range of [0...sum(weights)]
  // For example:
  // - weights = [1, 4, 3]
  // - maxCumulativeWeight = 8
  // - range for the random number is [0...8]
  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber = maxCumulativeWeight * Math.random();

  // Picking the random item based on its weight.
  // The items with higher weight will be picked more often.
  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    if (cumulativeWeights[itemIndex] >= randomNumber) {
      return {
        item: items[itemIndex],
        index: itemIndex,
      };
    }
  }
}

async function weightedRandomChoices(choices, numChoices){
  var totalWeight = 0;
  var weightedChoices = [];

  // Calculate total weight of all choices
  for (var i = 0; i < choices.length; i++) {
      var choice = choices[i];
      totalWeight += choice.tickets;
  }

  // Create an array of weighted choices
  for (var i = 0; i < choices.length; i++) {
      var choice = choices[i];
      for (var j = 0; j < choice.tickets; j++) {
          weightedChoices.push(choice.value);
      }
  }

  // Pick multiple random choices from the array of weighted choices
  var randomChoices = [];
  for (var i = 0; i < numChoices; i++) {
      var randomIndex = Math.floor(Math.random() * weightedChoices.length);
      randomChoices.push(weightedChoices[randomIndex])
      weightedChoices.splice(randomIndex, 1)
      weightedChoices = weightedChoices.filter(x => x !== weightedChoices[randomIndex])
  }
  return randomChoices;
}

async function deleteMessages(client){
    setInterval(async () => {
      const messages = await client.guilds.cache.get(`${process.env.GUILD_ID}`).channels.cache.get(`${process.env.RAID_CHANNEL}`).messages.fetch()
      await messages.filter(async m => {
        if (!m) return
        if (m.id === '1081866695385296976') return
        const timestamp = await m.createdTimestamp
        const hoursAgo = (Date.now() - timestamp) / 3600000
        if (hoursAgo > 12){
          await m.delete().catch(err => err)
        } 
      })
    }, 1000 * 30)
}

async function raffeWinners(client){
    setInterval(async () => {
      const messages = await client.guilds.cache.get(`${process.env.GUILD_ID}`).channels.cache.get(`${process.env.RAFFLE_CHANNEL}`).messages.fetch()
      await messages.filter(async m => {
        if (!m || m.author.id !== client.user.id || !m.embeds[0] || m.content.startsWith("**ENDED**")) return
        const endRaffle = m.embeds[0].data.fields[3].value.match(/\d+/g)
        const timeEnd = parseInt(endRaffle[0]) * 1000
        // const currentTime = Date.now()
        // const timeDiff = timeEnd - currentTime
        // const hoursRemaining = timeDiff / 3600000;
        // if (timeEnd > Date.now()) return console.log(hoursRemaining)
        if (timeEnd <= Date.now()) {
          const winnersEnd = m.embeds[0].data.fields[2].name.match(/\d+/g)
          const numWinners = winnersEnd ? parseInt(winnersEnd[0]) : null
          const receivedEmbed = m.embeds[0]
          const newEmbed = EmbedBuilder.from(receivedEmbed)
          newEmbed.setColor(0x000000)
          const Raffle = await m.embeds[0].footer.text
          const findRaffle = await raffleModel.findOne({ raffle: Raffle })
          if(!findRaffle) return
          const entries = findRaffle.entries
          const result = await weightedRandomChoices(entries, numWinners)
          let winnersM = "**Winners:** "
          let messageW = "Congratulations to"
          for (let i = 0; i < result.length; i++) {
            messageW += ` <@${result[i]}>`
            winnersM += ` <@${result[i]}>`
          }
          messageW += " <:woodpepo:945272494556864542> Open a <#930844499582779402> to claim the reward."
          winnersM += "\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯"
          newEmbed.setDescription(winnersM)
          await m.edit({ content: "**ENDED**", embeds: [newEmbed], components: [] }).catch(err => err)
          return m.reply(messageW)
          // .then(msg => {
          //   msg.channel.threads.create({
          //     name: "Congratulations",
          //     autoArchiveDuration: 1440,
          //     type: 12,
          //     invitable: true,
          //   }).then(thread => {
          //     //thread.members.add(user.id)
          //     thread.send(messageW)
          //   })
          // })
        } else return
      })
    }, 1000 * 2)
}



async function shyftNFT(wallet) {
  var myHeaders = new Headers();
  myHeaders.append("x-api-key", process.env.SHYFT_TOKEN);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
  try {
    const response = await fetch(`https://api.shyft.to/sol/v1/nft/read_all?network=devnet&address=${wallet}`, requestOptions)
    const data = await response.text()
    console.log(data)
  } catch (err) {
    return console.log(err)
  }
}

async function numberPanel(interaction){
  //return console.log(interaction.message.embeds[0])
  const msg = await interaction.channel.messages.fetch(interaction.message.id);//await interaction.guild.channels.cache.get(interaction.channelId).messages.fetch(interaction.message.id)
  const message = await interaction.message
  const oldEmbed = message.embeds[0]
  const newEmbed = EmbedBuilder.from(oldEmbed)
  const newBalance = newEmbed.data.fields[0].value
  if (interaction.customId === 'number_one'){
    const newNumber = newEmbed.data.fields[1].value + 1
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_two'){
    const newNumber = newEmbed.data.fields[1].value + 2
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_three'){
    const newNumber = newEmbed.data.fields[1].value + 3
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_four'){
    const newNumber = newEmbed.data.fields[1].value + 4
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_five'){
    const newNumber = newEmbed.data.fields[1].value + 5
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_six'){
    const newNumber = newEmbed.data.fields[1].value + 6
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[0].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_seven'){
    const newNumber = newEmbed.data.fields[1].value + 7
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_eight'){
    const newNumber = newEmbed.data.fields[1].value + 8
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_nine'){
    const newNumber = newEmbed.data.fields[1].value + 9
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_zero'){
    const newNumber = newEmbed.data.fields[1].value + 0
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1] = { name: `• Tickets`, value: `${newNumber}` }
    if (Number(newBalance) - ticketPrice < 0) return interaction.followUp({ content: "You don't have enough $WOOD for that amount of tickets!", ephemeral: true })
    return interaction.editReply({ embeds: [newEmbed] })
  }
  if (interaction.customId === 'number_erase'){
    const number = newEmbed.data.fields[1].value
    if(number === '\u200B') return
    const newNumber = newEmbed.data.fields[1].value.substring(0, number.length - 1)    
    const ticketPrice = Number(newNumber.substring(1)) * 10
    newEmbed.data.fields[2].value = `${Number(newBalance) - ticketPrice}`
    newEmbed.data.fields[1].value = newEmbed.data.fields[1].value.substring(0, number.length - 1)
    return interaction.editReply({ embeds: [newEmbed] })    
  }
}

module.exports = { 
  updateUserCache,
  getUserCache,
  numberPanel, 
  format, 
  parseISOString, 
  isoFormatDMY, 
  getMonthName,
  tweetPik, 
  weightedRandom, 
  deleteMessages,
  shyftNFT, 
  raffeWinners 
}