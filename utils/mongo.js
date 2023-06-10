const { profileModel, raffleModel } = require("../models.js")

async function Profile(interaction) {
    const member = interaction.guild.members.cache.get(interaction.user.id)
    let profile
    try {
        profile = await profileModel.findOne({ userID: interaction.user.id })
        if (!profile) {
            let profile = await profileModel.create({
                userID: interaction.user.id,
                serverID: interaction.guildId,
                discordAvatar: `https://cdn.discordapp.com/guilds/${interaction.guildId}/users/${interaction.user.id}/avatars/${member.avatar}.png?size=4096`,
            })
            profile.save()
        }
        return profile
    } catch (error) {
        console.log(error)
    }
}

async function UpdateProfile(interaction, action) {
    const update = await profileModel.findOneAndUpdate(
        {
            userID: interaction.user.id
        },
        {
            $push: action
        }
    )
}

async function updateRaffle(raffle, action){
  const update = await raffleModel.findOneAndUpdate(
    {
      raffle: raffle
    },
    {
      $push: action
    }
  )
  return update
}

async function updateEntries(raffle, user, tickets) {
  try {
    const update = raffleModel.findOneAndUpdate(
      {
        raffle: raffle,// filter the raffle document by its name
        "entries.value": user // filter the entries array by the user's current value
      },
      {
        $set: { "entries.$.tickets": tickets } // update the user's entry with the new value
      }
    )
    return update
  } catch (err) {
    return console.log(err)
  }
}

module.exports = { 
    Profile, 
    UpdateProfile,
    updateRaffle,
    updateEntries 
}