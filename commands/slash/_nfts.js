const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder, ButtonStyle } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format } = require("../../utils/functions")
// const { memberTransaction } = require("../../server.js")
const fs = require("fs")
const { resolveToWalletAddress, getParsedNftAccountsByOwner } = require("@nfteyez/sol-rayz")
const fetch = require("node-fetch")

const token = "<:dwood:1055600798756777984>"
const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

const Pagination = require('customizable-discordjs-pagination');
const buttons = [
  { label: 'First', emoji: ':first:1090380307473121330', style: ButtonStyle.Secondary },
  { label: '\u200b', emoji: ':previous:1090380312174923896', style: ButtonStyle.Danger },
  { label: '\u200b', emoji: ':next:1090380310841139333', style: ButtonStyle.Success },
  { label: 'Last', emoji: ':last:1090380308920160336', style: ButtonStyle.Secondary },
]

module.exports = {
  data: new ContextMenuCommandBuilder()
	.setName('NFTs Wallet')
	.setType(ApplicationCommandType.User),
    run: async ({ client, interaction }) => {
      //console.log(interaction.options/*._hoistedOptions*/)
      await interaction.deferReply({ ephemeral: false })
      const member = interaction.targetUser.id
      const mention = interaction.targetUser

      await userInfo(member).then(async r => {
        const errorEmbed = new EmbedBuilder()
         .setColor(0x0a0a0a)
         .setTitle(`User not Connected to the App`)
         .setDescription(`• ${mention}`)
         .setThumbnail(`${mention.displayAvatarURL()}`)
         .setTimestamp()
         .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
        
        if(!r || r.error !== null) return interaction.editReply({ embeds:[errorEmbed], ephemeral: true })
        const b = "```"

        const wallet = r.user.public_key

        const publicAddress = await resolveToWalletAddress({ text: wallet });
        const nftArray = await getParsedNftAccountsByOwner({ publicAddress });

        const nftArrayUri = []
        await Promise.all(nftArray.map(async (nft) => {
          if (!nft.data.uri || !nft.data.uri.startsWith('http')) return
          try {
            const response = await fetch(nft.data.uri);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            
            const nftUri = await response.json();

            const name = nftUri?.name
            const img = nftUri?.image
            const descrip = nftUri?.description

            const NFTS = new EmbedBuilder()
            .setColor(0xBFF5A1)
            .setTitle(`⸺ ${name}`)
            .setDescription(descrip)
            .setImage(img)

            nftArrayUri.push(NFTS);
          } catch (error) {
            
          }
        }))

        const extraText = `Gallery view`
        new Pagination()
          .setCommand(interaction)
          .setPages(nftArrayUri)
          .setButtons(buttons)
          .setPaginationCollector({ timeout: 120_000 })
          .setSelectMenu({ enable: false })
          .setFooter({ enableIconUrl: false, extraText: extraText })
          .send();
      })
    },
};