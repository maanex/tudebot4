/* eslint-disable import/namespace */
import { Client, ClientOptions, Intents, TextChannel, User } from 'discord.js'
import * as chalk from 'chalk'
import Cordo from 'cordo'
import * as moment from 'moment'
import { Module, ModlogFunction, GuildSettings } from './types/types'
import Database from './database/database'
import MongoAdapter from './database/mongo.adapter'
import { logVersionDetails } from './lib/git-parser'
import ParseArgs from './lib/parse-args'
import Obrazium from './thirdparty/obrazium/obrazium'
import Server from './server/server'
import PerspectiveAPI from './thirdparty/googleapis/perspective-api'
import AlexaAPI from './thirdparty/alexa/alexa-api'
import Metrics from './lib/metrics'


export class TudeBotClient extends Client {

  public readonly devMode;

  public config: any = null;
  public modlog: ModlogFunction;
  public modules: Map<string, Module> = null;
  public guildSettings: Map<string, GuildSettings> = null;

  public obrazium: Obrazium = null;
  public perspectiveApi: PerspectiveAPI = null;
  public alexaAPI: AlexaAPI = null;

  constructor(props: ClientOptions, config: any) {
    super(props)
    console.log('init')

    this.devMode = process.env.NODE_ENV !== 'production'

    this.config = config
    this.modlog = null
    this.modules = new Map()
    this.guildSettings = new Map()

    if (this.devMode)
      console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '))

    logVersionDetails()
    fixReactionEvent(this)
    moment.locale('en-gb')
    Metrics.init()

    MongoAdapter.connect(this.config.mongodb.url)
      .catch((err) => {
        console.error(err)
      })
      .then(async () => {
        console.log('Connected to Mongo')

        await Database.init()
        await Server.start(this.config.server.port)

        this.obrazium = new Obrazium(this.config.thirdparty.obrazium.token)
        this.perspectiveApi = new PerspectiveAPI(this.config.thirdparty.googleapis.key)
        this.alexaAPI = new AlexaAPI(this.config.thirdparty.alexa.key)

        this.on('ready', () => {
          console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag))

          for (const mod of this.modules.values())
            mod.onBotReady()
        })

        await this.loadGuilds(false)
        await this.loadModules(false)
        this.initCordo()

        this.login(this.config.bot.token)
      })
  }

  loadGuilds(_isReload: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      Database
        .collection('settings')
        .find({ guild: true })
        .toArray()
        .then((guilds) => {
          this.guildSettings = new Map()

          for (const guild of guilds) {
            const setting: GuildSettings = {
              id: guild._id,
              name: guild.name,
              club: guild.club,
              managers: guild.managers,
              modules: guild.modules
            }
            this.guildSettings.set(guild._id, setting)
          }

          resolve()
        })
        .catch((err) => {
          console.error('An error occured while fetching guild configuration data')
          console.error(err)
          reject(err)
        })
    })
  }

  loadModules(isReload: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      Database
        .collection('settings')
        .findOne({ _id: 'modules' })
        .then((data) => {
          data = data.data

          for (const mod of this.modules.values())
            mod.onDisable()

          this.modules = new Map()
          this.modlog = undefined

          for (const mod in data) {
            let modData = {}

            try { modData = require(`../config/moduledata/${mod}.json`) } catch (ex) { }

            const guilds = new Map<string, any>()
            for (const guild of this.guildSettings.values()) {
              if (guild.modules[mod])
                guilds.set(guild.id, guild.modules[mod])
            }

            try {
              let ModClass
              try {
                ModClass = require(`./modules/${mod}`).default
              } catch (ex) {
                try {
                  ModClass = require(`./modules/${mod}/${mod}`).default
                } catch (ex) { }
              }
              if (!ModClass) {
                console.error(`Module ${mod} not found!`)
                continue
              }
              const module: Module = new ModClass(data[mod], modData, guilds, this.lang)
              this.modules.set(mod, module)
              if (isReload) module.onBotReady()
            } catch (ex) {
              console.error(ex)
            }
          }

          for (const module of this.modules.values())
            module.onEnable()

          resolve()
        })
        .catch((err) => {
          console.error('An error occured while fetching module configuration data')
          console.error(err)
          reject(err)
        })
    })
  }

  initCordo() {
    this.on('raw', (ev: any) => {
      if (ev.t === 'INTERACTION_CREATE')
        Cordo.emitInteraction(ev.d)
    })

    Cordo.init({
      botId: this.config.bot.clientid,
      contextPath: [ __dirname, 'cordo' ],
      botClient: this
      // botAdmins: (id: string) => RemoteConfig.botAdmins.includes(id),
    })
  }

  public lang(key: string, params?: { [key: string]: string }): string {
    let res = require('../config/lang.json')[key]
    if (!res) return key
    if (res.push !== undefined) res = res[Math.floor(Math.random() * res.length)]
    for (const key in params)
      res = res.split(`{${key}}`).join(params[key])
    return res
  }

  public optionalLang(key: string, params?: { [key: string]: string }): string {
    if (key.startsWith('lang:')) return this.lang(key.substr(5), params)
    for (const param in params)
      key = key.split(`{${param}}`).join(params[param])
    return key
  }

  public async reload(): Promise<void> {
    this.removeAllListeners()
    fixReactionEvent(this)
    await this.loadGuilds(true)
    await this.loadModules(true)
    this.emit('ready')

    //

    function requestLogger(httpModule) {
      const original = httpModule.request
      httpModule.request = function (options, callback) {
        console.log(options.href || options.proto + '://' + options.host + options.path, options.method)
        return original(options, callback)
      }
    }

    requestLogger(require('http'))
  }

  public getModule<T extends Module>(name: string): T {
    return this.modules.get(name) as T
  }

}


// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const _flags = ParseArgs.parse(process.argv)
export const config = require('../config.js')
export const TudeBot = new TudeBotClient({
  ws: { intents: Intents.ALL }
}, config)


function fixReactionEvent(bot: TudeBotClient) {
  const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
  }

  bot.on('raw', async (event: Event) => {
    try {
      const ev: any = event
      // eslint-disable-next-line no-prototype-builtins
      if (!events.hasOwnProperty(ev.t)) return
      const data = ev.d
      const user: User = await bot.users.fetch(data.user_id)
      const channel = (await bot.channels.fetch(data.channel_id) || await user.createDM()) as TextChannel
      if (channel.messages.resolve(data.message_id)) return
      const message = await channel.messages.fetch(data.message_id)
      const reaction = message.reactions.cache.get(data.emoji.id || data.emoji.name)
      bot.emit(events[ev.t], reaction, user)
    } catch (ex) {
      console.error(ex)
    }
  })
}
