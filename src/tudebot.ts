import { Client, ClientOptions, TextChannel, User } from 'discord.js'
import * as chalk from 'chalk'
import Cordo, { GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import * as moment from 'moment'
import { Module, ModlogFunction, GuildSettings } from './types/types'
import Database from './database/database'
import MongoAdapter from './database/mongo.adapter'
import { logVersionDetails } from './lib/git-parser'
import Server from './server/server'
import PerspectiveAPI from './thirdparty/googleapis/perspective-api'
import AlexaAPI from './thirdparty/alexa/alexa-api'
import Metrics from './lib/metrics'
import Localisation from './lib/localisation'
import Mongo from './database/mongoose'
import { UserData } from './lib/users/user-data'
import Notifications from './lib/users/notifications'
import Const from './lib/data/const'
import { config } from '.'


export default class TudeBotClient extends Client {

  public readonly devMode;

  public modlog: ModlogFunction;
  public modules: Map<string, Module> = null;
  public guildSettings: Map<string, GuildSettings> = null;

  public perspectiveApi: PerspectiveAPI = null;
  public alexaAPI: AlexaAPI = null;

  constructor(props: ClientOptions, _config: any) {
    super(props)
    console.log('init')

    this.devMode = process.env.NODE_ENV !== 'production'

    this.modlog = null
    this.modules = new Map()
    this.guildSettings = new Map()

    if (this.devMode) console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '))
    else logVersionDetails()

    this.singleInit().catch(err => console.error(err))
  }

  async singleInit() {
    fixReactionEvent(this)
    ;(moment as any).locale('en-gb')
    Metrics.init()

    await MongoAdapter.connect(config.mongodb.url)
    await Mongo.connect(config.mongodb.url)
    console.log('Connected to Mongo')

    await Database.init()
    await Server.start(config.server.port)

    this.perspectiveApi = new PerspectiveAPI(config.thirdparty.googleapis.key)
    this.alexaAPI = new AlexaAPI(config.thirdparty.alexa.key)

    this.on('ready', () => {
      console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag))

      for (const mod of this.modules.values())
        mod.onBotReady()
    })

    await this.loadGuilds(false)
    await this.loadModules(false)
    this.initCordo()

    this.login(config.bot.token)
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

            try { modData = require(`../assets/data/modules/${mod}.json`) } catch (ex) { }

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
              const module: Module = new ModClass(data[mod], modData, guilds)
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

  private initCordo() {
    this.on('raw', (ev: any) => {
      if (ev.t === 'INTERACTION_CREATE')
        Cordo.emitInteraction(ev.d)
    })

    Cordo.init({
      botId: config.bot.clientid,
      contextPath: [ __dirname, 'cordo' ]
    })
    Cordo.setMiddlewareUserData(uid => new UserData(uid))
    Cordo.addMiddlewareInteractionCallback(interactionCallbackMiddleware)
  }

  public async reload(): Promise<void> {
    this.removeAllListeners()
    fixReactionEvent(this)
    await this.loadGuilds(true)
    await this.loadModules(true)
    this.emit('ready', this as Client<true>)
  }

  public getModule<T extends Module>(name: string): T {
    return this.modules.get(name) as T
  }

}

function interactionCallbackMiddleware(data: InteractionApplicationCommandCallbackData, i: GenericInteraction) {
  for (const notification of i.userData.consumeNotifications()) {
    if (!data.embeds) data.embeds = []
    if (data.embeds.length >= 10) break

    data.embeds.push(Notifications.buildEmbed(notification))
  }

  if (data.embeds) {
    for (const embed of data.embeds)
      if (!embed.color) embed.color = Const.embedColor
  }

  Localisation.translateObject(data, 'en-US', {}, 10)
}

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
