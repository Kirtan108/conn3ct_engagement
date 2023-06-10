const fetch = require('node-fetch')
//const axios = require("axios");
const dotenv = require('dotenv');
const res = require('express/lib/response');
dotenv.config()

// CONNECT APIS BELLOW //

// ----------- USER INFO
const userInfo = async (userId) => {
  try {
    const response = await fetch(`https://connect.mindfolk.art/.netlify/functions/user-by-discord-id?discordId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.X_API
      }
    })
    if (response.status !== 200 && response.status !== 404) {
      console.log("CONNECT ERROR", response.status)
      return //userInfo(userId)
    }
    if (response.status === 404) {
      console.log('User Info STATUS: ', response.status)
      return
    } else {
      const data = await response.json()
      console.log('User Info STATUS: ', response.status)
      return data

    }
  } catch (error) {
    return console.log(error)
  }
}

// -----------  CLAIM
const claimToken = async (wallet, amount, reason) => {
  try {
    const response = await fetch(`https://connect.mindfolk.art/.netlify/functions/reward-claim?publicKey=${wallet}&claim=${amount}&reason=${reason}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.X_API
      }
    })
    if (response.status !== 200 && response.status !== 404) {
      console.log('Claim Token STATUS: ', response.status)
      return
    }
    if (response.status === 404) {
      console.log('Claim Token STATUS: ', response.status)
      return
    } else {
      const data = await response.json()
      console.log('Claim Token STATUS: ', response.status)
      return data

    }
  } catch (error) {
    return console.log(error)
  }
}

// -----------  REWARD
const rewardUser = async (wallet, amount, reason) => {
  try {
    const response = await fetch(`https://connect.mindfolk.art/.netlify/functions/reward-user?publicKey=${wallet}&reward=${amount}&reason=${reason}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.X_API
      }
    })
    if (response.status !== 200 && response.status !== 404) {
      console.log('Reward User STATUS: ', response.status)
      return
    }
    if (response.status === 404) {
      console.log('Reward User STATUS: ', response.status)
      return
    } else {

      const data = await response.json()
      console.log('Reward User STATUS: ', response.status)
      return data

    }
  } catch (error) {
    return console.log(error)
  }
}

// -----------  LEADERBOARD
const leaderBoard = async () => {
  const response = await fetch('https://connect.mindfolk.art/.netlify/functions/reward-leaderboard', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.X_API
    }
  })

  const data = await response.json()

  console.log('Leaderboard STATUS: ', response.status)
  return data
}

const bankDrop = async (wallet, number) => {
    const amount = 1000000000 * number
    const info = {
        ownerKey: `${wallet}`,
    	currency: "674PmuiDtgKx3uKuJ1B16f9m5L84eFvNwj3xDMvHcbo7",
    	amount: amount
    }
    const response = await fetch('https://a2-mind-prd-api.azurewebsites.net/api/bank/airdrop', {
        method: 'POST',
        body: JSON.stringify(info),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `API_KEY ${process.env.API_KEY}`
        }
    })
    return
}

// // ----------- WL - APPROVE APPLICATION
// const approveWL = async (publicKey) => {
//   const response = await fetch(`https://connect.mindfolk.art/.netlify/functions/approve-applicant?public_key=${publicKey}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': process.env.X_API
//     }
//   })
//   if (response.status !== 200) {
//     console.log(response.status)
//     return
//   } else {
//     try{
//     console.log('WL - STATUS: ', response.status)
//     return response
//     } catch(error){
//       return console.log(error)
//     }
//   }
// }
// // ----------- CL - APPROVE APPLICATION
// const approveCL = async (publicKey) => {
//   const response = await axios(`https://connect.mindfolk.art/.netlify/functions/choplist-applicant?public_key=${publicKey}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': process.env.X_API
//     }
//   })
//   if (response.status !== 200) {
//     console.log(response.status)
//     return
//   } else {
//     try{
//     console.log('CL - STATUS: ', response.status)
//     return response
//     } catch(error){
//       return console.log(error)
//     }
//   }
// }

// ----------- GET SENTIMENT ANALYSIS
const getSentiment = async (publicKey) => {
  const response = await fetch(`https://connect.mindfolk.art/.netlify/functions/get-sentiment\?publicKey\=${publicKey}`, {
    method: 'GET',
    headers: {
      //'Content-Type': 'application/json',
      'x-api-key': process.env.X_API
    }
  })
  if (response.status !== 200) {
    console.log("ERROR GET SENTIMEN:T", response.status)
    return
  } else {
    try{
    console.log('GET SENTIMENT - STATUS: ', response.status)
    const data = response.json()
    return data
    } catch(error){
      return console.log(error)
    }
  }
}
// ----------- POST SENTIMENT ANALYSIS
const postSentiment = async (publicKey, input) => {
  const data = {
    publicKey: publicKey,
    sentiment: input,
  }
  try {
    const response = await fetch('https://connect.mindfolk.art/.netlify/functions/record-sentiment', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': process.env.X_API
      }
    })
    console.log('POST SENTIMENT - STATUS: ', response.status)
    return
  } catch (err) {
    return console.log(err)
  }
}

module.exports = { 
  userInfo, 
  claimToken, 
  rewardUser, 
  leaderBoard,
  bankDrop, 
  // approveWL, 
  // approveCL, 
  getSentiment, 
  postSentiment 
}