const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const token = "<:dwood:1055600798756777984>"

module.exports = {
    data: {
      name: "raid",
      aliases: ['raid'],
      description: "Raid Message",
    },
    run: async (client, message, args) => {
      //console.log(interaction.options._hoistedOptions)
      const reward = args[0]
      const channel = args[1]
      const link = args[2]
      const tweetLink = link.split("?",1)
      const mention = args[3]
      const actions = args[4]
      const bonus = !args[5] ? false : args[5]

      const time = 60 * 60 * 6
      
      // const linkTest = link.split("?").toString().split("/")
      // console.log(isNaN(linkTest[5]))
      // console.log(linkTest[2], isNaN(linkTest[5]))
      // if(isNaN(linkTest[6]) === true) return interaction.reply({ content: "Not a valid tweet Dwag!", ephemeral: true })

      const date = Math.floor(Date.now()/1000 + time) //21600

      const raidEmbed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle("Twitter Rewards")
      .setDescription(`Complete the actions in the tweet linked below.\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`)
      .addFields(
          { name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}`},
          { name: `**• Reward** ${token}`, value: `> **${reward}**`},
          { name: "Available time", value: `<t:${date}:R>`, inline: true}
      )

      const buttonL = new ButtonBuilder()
	  .setCustomId('like')
	  .setLabel('Claim Like')
	  .setStyle(ButtonStyle.Danger)
      .setEmoji(':lk:1055291295045787718')
      const buttonR = new ButtonBuilder()
	  .setCustomId('retweet')
	  .setLabel('Claim Retweet')
	  .setStyle(ButtonStyle.Success)
      .setEmoji(':rt:1055291296425717761')
      const buttonC = new ButtonBuilder()
	  .setCustomId('comment')
	  .setLabel('Claim Comment')
	  .setStyle(ButtonStyle.Primary)
      .setEmoji(':cmt:1055291293477122068')

      

      await message.reply({ content: `Aweee!\nRaid started succesfully! Channel: <#${channel}>` })

      if(actions === 'like_retweet_comment'){
        const row = new ActionRowBuilder().addComponents(buttonL, buttonR, buttonC)
        if(bonus !== false) raidEmbed.addFields({ name: "Bonus reward for including in reply", value: `${bonus}`, inline: true})
        return message.guild.channels.cache.get(`${channel}`).send({ content: `${mention}`, embeds: [raidEmbed], components: [row] })
      }
      if(actions === 'like_retweet'){
        const row = new ActionRowBuilder().addComponents(buttonL, buttonR)
        return message.guild.channels.cache.get(`${channel}`).send({ content: `${mention}`, embeds: [raidEmbed], components: [row] })
      }
      if(actions === 'like_comment'){
        const row = new ActionRowBuilder().addComponents(buttonL, buttonC)
        if(bonus !== false) raidEmbed.addFields({ name: "Bonus reward for including in reply", value: `${bonus}`, inline: true})
        return message.guild.channels.cache.get(`${channel}`).send({ content: `${mention}`, embeds: [raidEmbed], components: [row] })
      }
      if(actions === 'retweet_comment'){
        const row = new ActionRowBuilder().addComponents(buttonR, buttonC)
        if(bonus !== false) raidEmbed.addFields({ name: "Bonus reward for including in reply", value: `${bonus}`, inline: true})
        return message.guild.channels.cache.get(`${channel}`).send({ content: `${mention}`, embeds: [raidEmbed], components: [row] })
      }
      if(actions === 'like'){
        const row = new ActionRowBuilder().addComponents(buttonL)
        return message.guild.channels.cache.get(`${channel}`).send({ content: `${mention}`, embeds: [raidEmbed], components: [row] })
      }
      if(actions === 'retweet'){
        const row = new ActionRowBuilder().addComponents(buttonR)
        return message.guild.channels.cache.get(`${channel}`).send({ content: `${mention}`, embeds: [raidEmbed], components: [row] })
      }
      if(actions === 'comment'){
        const row = new ActionRowBuilder().addComponents(buttonC)
        if(bonus !== false) raidEmbed.addFields({ name: "Bonus reward for including in reply", value: `${bonus}`, inline: true})
        return message.guild.channels.cache.get(`${channel}`).send({ content: `${mention}`, embeds: [raidEmbed], components: [row] })
        
      }
      // await message.guild.channels.cache.get(`${channel}`).send({ content: `${mention.role}`, embeds: [raidEmbed], components: [row] }).then(message => {
      //   setTimeout(() => {
      //     message.delete()
      //   }, 1000 * time)
      // })
    },
};