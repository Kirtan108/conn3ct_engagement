require('dotenv').config()
const fetch = require('node-fetch')
const baseURL = "https://api.conn3ct.pro" 
// const baseURL = "http://localhost:8080"

// LIKES
const getTweetMetrics = async (tweetLink) => {
    try {
        const response = await fetch(`${baseURL}/tweetmetrics?url=${tweetLink}`, {
            method: 'GET',
        })
        const data = await response.json()
        return data
    } catch (error) {
        return console.log(error)
    }
}

const TweetVerification = async (tweetURL, intent, userId) => {
    try {
        const response = await fetch(`${baseURL}/verification?url=${tweetURL}&intent=${intent}&userId=${userId}`, {
            method: 'GET',
        })
        const data = await response.json()
        return data
    } catch (error) {
        return console.log(error)
    }
}

const getSeedURL = (userId, intent, tweetId, tweetName) => {
    const url = `${baseURL}/verification/${userId}/${intent}/${tweetId}/${tweetName}`
    return url
}

const getReply = async (replyURL, mainURL) => {
    try {
        const response = await fetch(`${baseURL}/verification/reply?url=${replyURL}&main=${mainURL}`, {
            method: 'GET',
        })
        const data = await response.json()
        return data
    } catch (error) {
        return console.log(error)
    }
}

module.exports = { getTweetMetrics, TweetVerification, getSeedURL, getReply }