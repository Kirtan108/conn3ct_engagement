const { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

const { createCanvas, loadImage, registerFont } = require('canvas');
const sharp = require('sharp')

const fetch = require('node-fetch')

const canvas = createCanvas(1200, 675); // Set the canvas size
const ctx = canvas.getContext('2d')


module.exports = {
  data: new SlashCommandBuilder()
  .setName('gm')
  .setDescription('Drop a GM banner')
  .addStringOption(option =>
    option.setName('add')
        .setDescription('Add an extra touch!')
        .setRequired(false)
        .addChoices(
            { name: 'Mug', value: 'mug' },
          )),
  run: async ({ client, interaction }) => {   
    //await interaction.deferReply({ ephemral: true })
    const extra = !interaction.options._hoistedOptions[0] ? null : interaction.options._hoistedOptions[0].value
    const member = interaction.guild.members.cache.get(interaction.user.id)
    const avatarURL = member.displayAvatarURL({ extension: 'png', size: 4096 });

    const buffer = await fetch(avatarURL).then(response => response.arrayBuffer());
    const sharpBuffer = Buffer.from(buffer);
    const { width, height } = await sharp(sharpBuffer).metadata();
    console.log(width)

    if (width < 380) return interaction.reply({ content: "The size of your PFP is too small which will result in a poor quality image.\n\nIf your image is related to a NFT go to Solscan.io, choose the **'view original'** option to download the image in the best resolution and then update your image in discord.\n\n**BEWARE:** You must upload the image from a computer. Discord mobile app will always upload a low res image.", ephemeral: true })

    const background = await loadImage('./designs/brush1.png');
    const mug = await loadImage('./designs/mug.png');
    const avatar = await loadImage(avatarURL);
    const avatarWidth = 675;
    const avatarHeight = 675;
    const margin = 0
    ctx.drawImage(avatar, canvas.width - avatarWidth - margin, (canvas.height - avatarHeight) / 2, avatarWidth, avatarHeight)
    if (extra === 'mug' ) ctx.drawImage(mug, canvas.width - avatarWidth - margin, (canvas.height - avatarHeight) / 2, avatarWidth, avatarHeight)
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `gm_${interaction.user.username}.png` });

    const TweetLink = `https://twitter.com/intent/tweet?text=GM%20from%20@mindfolkArt`

    const button = new ButtonBuilder()
      .setURL(TweetLink)
      .setLabel('Copy the image to paste it in the tweet!')
      .setStyle('Link')
      .setEmoji(':twitter:1066821775146627152')
    const row = new ActionRowBuilder().addComponents(button)
    await interaction.reply({ content: `gm <@${interaction.user.id}>`, components: [row], files: [attachment] });
    delete canvas
  },
};