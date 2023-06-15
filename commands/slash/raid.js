const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')
const config = require("../../config")

const token = config.token
const color_void = config.colors.void
const { tweetPik, accurateTimeout } = require("../../utils/functions")

module.exports = {
    data: new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Send tweet to raid')
    .addStringOption(option =>
		option.setName('reward')
			.setDescription('The amount to be rewarded')
            .setRequired(true))    
	  .addChannelOption(option =>
		option.setName('channel')
			.setDescription('The channel to send the raid')
            .setRequired(true))
    .addStringOption(option =>
		option.setName('tweetlink')
			.setDescription('Copy the Tweet link')
            .setRequired(true))
    .addRoleOption(option =>
		option.setName('mention')
			.setDescription('Choose the role to mention')
            .setRequired(true))
    .addStringOption(option =>
      option.setName('actions')
        .setDescription('Choose the actions to raid')
        .setRequired(true)
        .addChoices(
          { name: 'Like, Retweet, Comment', value: 'like_retweet_comment' },
          { name: 'Like, Retweet', value: 'like_retweet' },
          { name: 'Like, Comment', value: 'like_comment' },
          { name: 'Retweet, Comment', value: 'retweet_comment' },
          { name: 'Like', value: 'like' },
          { name: 'Retweet', value: 'retweet' },
          { name: 'Comment', value: 'comment' },
        ))
    .addStringOption(option =>
      option.setName('bonus')
        .setDescription('Bonus reward for adding text in the Tweet')
              .setRequired(false)),
    run: async ({ client, interaction }) => {
      await interaction.deferReply({ ephemeral: true })
      //console.log(interaction.options._hoistedOptions)
      const reward = interaction.options._hoistedOptions[0].value
      const channel = interaction.options._hoistedOptions[1].value
      const link = interaction.options._hoistedOptions[2].value
      const tweetLink = link.split("?",1)
      const mention = interaction.options._hoistedOptions[3]
      const actions = interaction.options._hoistedOptions[4].value
      const bonus = !interaction.options._hoistedOptions[5] ? 0 : interaction.options._hoistedOptions[5].value
      const tweet_id = tweetLink.toString().split("/").pop()

      const img = await tweetPik(tweet_id)

      const time = 60 * 60 * 12
      
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
          // { name: "**• Tweet <:twitter:1055900000976126032>**", value: `${tweetLink}`},
          { name: `**• Reward** ${token.emoji}`, value: `> **${reward}**`},
          { name: "Available time", value: `<t:${date}:R>`, inline: true}
      )
      const tweetPic = img === null ? undefined : raidEmbed.setImage(img.url)
      //if(tweetPic === undefined) return interaction.editReply({ content: "Image couldn't be loaded! Please reach Kirtan.", ephemeral: true })
     
      const buttonL = new ButtonBuilder()
	    .setCustomId(`stepLike_${tweetLink}`)
	    .setLabel('      ')
	    .setStyle(ButtonStyle.Danger)
      .setEmoji(':lk:1055291295045787718')
      const buttonR = new ButtonBuilder()
	    .setCustomId(`stepRetweet_${tweetLink}`)
	    .setLabel('      ')
	    .setStyle(ButtonStyle.Success)
      .setEmoji(':rt:1055291296425717761')
      const buttonC = new ButtonBuilder()
	    .setCustomId(`stepComment;${tweetLink}`)
	    .setLabel('      ')
	    .setStyle(ButtonStyle.Primary)
      .setEmoji(':cmt:1055291293477122068')

      await interaction.editReply({ content: `Aweee ${interaction.user}!\nRaid started succesfully! Channel: <#${channel}>`, ephemeral: true })

      if(actions === 'like_retweet_comment'){
        const row = new ActionRowBuilder().addComponents(buttonL, buttonR, buttonC)
        if(bonus !== 0) raidEmbed.addFields({ name: "Bonus reward for including in reply", value: `${bonus}`, inline: true})
        return interaction.guild.channels.cache.get(`${channel}`).send({ content: `${mention.role}`, embeds: [raidEmbed], components: [row] })
        // .then(msg => {
        //   msg.startThread({
        //     name: `Tweet Here!`,
        //     autoArchiveDuration: 1440,
        //     type: 'GUILD_PUBLIC_THREAD'
        //   }).then(r => r.send("Reply to the Tweet here. You can also post an image to add in the Tweet!"))
        //   return
        // })
      }
      if(actions === 'like_retweet'){
        const row = new ActionRowBuilder().addComponents(buttonL, buttonR)
        return interaction.guild.channels.cache.get(`${channel}`).send({ content: `${mention.role}`, embeds: [raidEmbed], components: [row] })
        .then(message => {
          const dM = () => message.delete()
          accurateTimeout(dM, 1000 * time)
        })
      }
      if(actions === 'like_comment'){
        const row = new ActionRowBuilder().addComponents(buttonL, buttonC)
        if(bonus !== 0) raidEmbed.addFields({ name: "Bonus reward for including in reply", value: `${bonus}`, inline: true})
        return interaction.guild.channels.cache.get(`${channel}`).send({ content: `${mention.role}`, embeds: [raidEmbed], components: [row] })
        .then(message => {
          const dM = () => message.delete()
          accurateTimeout(dM, 1000 * time)
        })
      }
      if(actions === 'retweet_comment'){
        const row = new ActionRowBuilder().addComponents(buttonR, buttonC)
        if(bonus !== 0) raidEmbed.addFields({ name: "Bonus reward for including in reply", value: `${bonus}`, inline: true})
        return interaction.guild.channels.cache.get(`${channel}`).send({ content: `${mention.role}`, embeds: [raidEmbed], components: [row] })
        .then(message => {
          const dM = () => message.delete()
          accurateTimeout(dM, 1000 * time)
        })
      }
      if(actions === 'like'){
        const row = new ActionRowBuilder().addComponents(buttonL)
        return interaction.guild.channels.cache.get(`${channel}`).send({ content: `${mention.role}`, embeds: [raidEmbed], components: [row] })
        .then(message => {
          const dM = () => message.delete()
          accurateTimeout(dM, 1000 * time)
        })
      }
      if(actions === 'retweet'){
        const row = new ActionRowBuilder().addComponents(buttonR)
        return interaction.guild.channels.cache.get(`${channel}`).send({ content: `${mention.role}`, embeds: [raidEmbed], components: [row] })
        .then(message => {
          const dM = () => message.delete()
          accurateTimeout(dM, 1000 * time)
        })       
      }
      if(actions === 'comment'){
        const row = new ActionRowBuilder().addComponents(buttonC)
        if(bonus !== 0) raidEmbed.addFields({ name: "Bonus reward for including in reply", value: `${bonus}`, inline: true})
        return interaction.guild.channels.cache.get(`${channel}`).send({ content: `${mention.role}`, embeds: [raidEmbed], components: [row] })
        .then(message => {
          const dM = () => message.delete()
          accurateTimeout(dM, 1000 * time)
        })
      }      
    },
};