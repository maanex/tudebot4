/* eslint-disable import/order */
/* eslint-disable import/first */
/* eslint-disable import/namespace */

import { configjs } from './types/config'
export const config = require('../config.js') as configjs


import { Options } from 'discord.js'
import TudeBotClient from './tudebot'
import Localisation from './lib/localisation'
import { UserData } from './lib/users/user-data'


Localisation.load(require('../assets/data/language.json'))

export const TudeBot = new TudeBotClient({
  intents: [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_BANS',
    'GUILD_EMOJIS_AND_STICKERS',
    'GUILD_INTEGRATIONS',
    'GUILD_WEBHOOKS',
    'GUILD_INVITES',
    'GUILD_VOICE_STATES',
    'GUILD_PRESENCES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING'
  ],
  makeCache: Options.cacheEverything(),
  partials: []
}, config)

function startTimers() {
  // Database Sync - every 10 seconds
  setInterval(() => {
    UserData.pushChanges()
  }, 1000 * 10)
}
startTimers()
