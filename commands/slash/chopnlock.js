const { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

const { createCanvas, loadImage, registerFont } = require('canvas');
const sharp = require('sharp')

const fetch = require('node-fetch')

async function getAvatarBackgroundColor(user) {
  return new Promise(async (resolve, reject) => {
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');

    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 4096 });
    if (!avatarURL) {
      reject(new Error('User has no avatar'));
      return;
    }
    try {
      const avatarImage = await loadImage(avatarURL);
      ctx.drawImage(avatarImage, 0, 0, canvas.width, canvas.height);

      const pixelData = ctx.getImageData(0, 0, 1, 1).data;
      const color = `#${((1 << 24) + (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]).toString(16).slice(1)}`;

      resolve(color);
    } catch (err) {
      reject(err);
    }
  });
}


module.exports = {
  data: new SlashCommandBuilder()
  .setName("lock")
  .setDescription("Drop a Chop N' Lock banner"),
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

    await interaction.deferReply()
    const color = await getAvatarBackgroundColor(member)
    if(!color) return
    const filePaths = [
        './designs/CNL1.png',
        './designs/CNL2.png'
    ]
    const randomIndex = Math.floor(Math.random() * filePaths.length)
    const background = await loadImage(filePaths[randomIndex]);
    const avatar = await loadImage(avatarURL);
    const avatarWidth = 675;
    const avatarHeight = 675;
    const margin = 0
    const canvas = createCanvas(1200, 675); // Set the canvas size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(avatar, canvas.width - avatarWidth - margin, (canvas.height - avatarHeight) / 2, avatarWidth, avatarHeight)
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `gm_${interaction.user.username}.png` });

    const TweetLink = `https://twitter.com/intent/tweet?text=Chop%20N'%20Locked!%20@mindfolkArt`

    const button = new ButtonBuilder()
      .setURL(TweetLink)
      .setLabel('Copy the image to paste it in the tweet!')
      .setStyle('Link')
      .setEmoji(':twitter:1066821775146627152')
    const row = new ActionRowBuilder().addComponents(button)
    await interaction.followUp({ content: `chop! <@${interaction.user.id}>`, components: [row], files: [attachment] });
    delete canvas
  },
};