const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true},
    serverID: { type: String, require: true},
    discordAvatar: { type: String },
    tweetLikes: [ String ],
    tweetRetweets: [ String ],
    tweetComments: [ String ],
    quests: [ String ],
    userFollowed: [ String ],
    userLikes: [ String ],
    userRetweets: [ String ],
    counter: { type: Number, default: 0 }
})
const entrySchema = new mongoose.Schema({
    value: { type: String },
    tickets: { type: Number }
}, { _id: false })

const raffleSchema = new mongoose.Schema({
    raffle: { type: String, require: true, unique: true},
    entries: [ entrySchema ],
    prize: { type: String }
})

const profileModel = mongoose.model('ProfileModels', profileSchema)
const raffleModel = mongoose.model('raffles', raffleSchema)
module.exports = { profileModel, raffleModel }