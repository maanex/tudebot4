/* eslint-disable import/order */
/* eslint-disable import/first */
/* eslint-disable import/namespace */

import { configjs } from './types/config'
export const config = require('../config.js') as configjs

import { ReadableStream } from "node:stream/web";
globalThis.ReadableStream = ReadableStream;


import { Options } from 'discord.js'
import TudeBotClient from './tudebot'
import Localisation from './lib/localisation'
import { UserData } from './lib/users/user-data'


Localisation.load(require('../assets/data/language.json'))

export const TudeBot = new TudeBotClient({
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildBans',
    'GuildEmojisAndStickers',
    'GuildIntegrations',
    'GuildWebhooks',
    'GuildInvites',
    'GuildVoiceStates',
    'GuildPresences',
    'GuildMessages',
    'MessageContent',
    'GuildMessageReactions',
    'GuildMessageTyping',
    'DirectMessages',
    'DirectMessageReactions',
    'DirectMessageTyping'
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
