require('dotenv').config()

const config = {
   "prefix": ",",
   "channels": {
       "guide": "",
       "rewards": "<#1057686738518163466>",
       "dashboard": "<#1057687794992029806>",
       "tweet_rush": "<#926737381862834196>",
       "raffles": "",
       "gm": process.env.GM_CH,
       "log": process.env.LOG_CH,
       "pfp": process.env.PFP_CH,
   },
   "roles": {
       "rewards": null,
       "WL": null,
   },
   "colors": {
       "void": 0x2f3136,
       "brand": 0xBFF5A1
   },
   "designs": {
       "guide": "https://cdn.discordapp.com/attachments/1062678878545518683/1064854169380458526/Connect.png",
       "roles": "https://cdn.discordapp.com/attachments/1067125336887795723/1073325779661881414/rolesConnect.png",
       "rewards": "https://cdn.discordapp.com/attachments/1067125336887795723/1087714456483680286/rolesConnect-2.png",
       "dashboard": "https://cdn.discordapp.com/attachments/1062678878545518683/1064854170559058011/Connect_dashboards.png"
   },
   "url": "https://mindfolk.conn3ct.pro/",
   "token": {
       "emoji": "<:dwood:1055600798756777984>",
       "name": "WOOD"
   },
   "brand_name": "Mindfolk+"
}

module.exports = config