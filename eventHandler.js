const fs = require('fs')

let count = 0
setInterval(() => {
    count = 0
}, 1000)

const userButton = new Map() 

function getButtonInteraction(uniqueKey) {
  userButton.set(uniqueKey, new Date().getTime().toString())
  setTimeout(() => {
    userButton.delete(uniqueKey)
  }, 1000)
}

function hasNestedObjects(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      return true;
    }
  }
  return false;
}

//const ticketRole = interaction.guild.roles.cache.get(process.env.TICKET_ROLE)

async function eventHandler(interaction) {

  const userInteractionId = `${interaction.customId}${interaction.user.id}`
  // Filter in case user is spamming the button
  if (userButton.has(userInteractionId)) return interaction.reply({ content: "You are pressing the buttons too fast! Please try again.", ephemeral: true })
  const countLimit = 40
  if (count === countLimit) return console.log("WARNING Discord API LIMIT PEAK")
  count++

  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

  try {
    for (const file of eventFiles) {
      const events = require(`./events/${file}`);
      if (hasNestedObjects(events)) {
        for (const key of Object.keys(events)) {
          const event = events[key];
          if (event && event.customId && (interaction.customId === event.customId || interaction.customId.startsWith(event.customId))) {
            await event.execute(interaction);
          }
        }
      } else {
        if (events.customId && (interaction.customId === events.customId || interaction.customId.startsWith(events.customId))) {
          await events.execute(interaction);
        }
      }
    }
    getButtonInteraction(userInteractionId)
  } catch (err) {
    console.log(err);
  }
}

module.exports = eventHandler