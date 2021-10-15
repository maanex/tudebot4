import { PresenceStatus, VoiceState } from 'discord.js'
import { TudeBot } from '../index'
import Metrics from '../lib/metrics'
import { Module } from '../types/types'


export default class SurveillanceModule extends Module {

  private static presenceLookup: Record<PresenceStatus, number> = {
    invisible: 0,
    offline: 0,
    idle: 1,
    online: 2,
    dnd: 3
  }

  private memberGuildsCache: Map<string, string> = new Map()
  private updateInterval: any = null

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Surveillance', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
    this.updateInterval = setInterval(mod => mod.updateAll(), 1000 * 60 * 10, this)

    TudeBot.on('presenceUpdate', (before, after) => {
      const user = after?.userId ?? before?.userId
      if (!user) return

      const guilds = this.memberGuildsCache.get(user)
      if (!guilds) return

      // DOPE console.log(after.user.username, Object.entries(after.clientStatus).map(e => `[${e[0]}: ${e[1]}]`).join(' '))

      Metrics.gaugeSurveillanceUsers
        .labels({ user: this.data.users[user] ?? user, guilds })
        .set(SurveillanceModule.presenceLookup[after.status])
    })

    TudeBot.on('voiceStateUpdate', (before, after) => {
      const user = after?.member?.id ?? before?.member?.id
      if (!user) return

      const guild = this.getGuilds()[after?.guild?.id ?? before?.guild?.id]
      if (!guild) return

      const val = !after?.channel
        ? 0
        : after.mute
          ? 0.5
          : 1

      Metrics.gaugeSurveillanceVoice
        .labels({ user: this.data.users[user] ?? user, guild })
        .set(val)
    })

    TudeBot.on('message', (mes) => {
      const user = mes.author.id
      if (!user) return

      if (!this.memberGuildsCache.has(user)) return
      if (!this.getGuilds()[mes.guild.id]) return

      Metrics.counterSurveillanceMessages
        .labels({
          user: this.data.users[user] ?? user,
          guild: this.getGuilds()[mes.guild.id]
        })
        .inc()
    })
  }

  public onBotReady() {
    setTimeout(() => this.updateAll(), 5000)
  }

  public onDisable() {
    clearInterval(this.updateInterval)
  }

  private getGuilds() {
    return this.data[TudeBot.devMode ? 'guilds-dev' : 'guilds']
  }

  private async updateAll() {
    type stepOneType = [string, PresenceStatus, VoiceState, string]
    type stepTwoType = Record<string, [ PresenceStatus, VoiceState, string[] ]>

    const gdata = this.getGuilds()
    const guilds = await Promise.all(Object.keys(gdata).map(i => TudeBot.guilds.fetch(i)))
    const members = guilds
      .flatMap(g => g.members.cache
        .filter(m => !m.user.bot)
        .map(u => [ u.id, u.presence?.status ?? 'offline', u.voice, g.id ] as stepOneType)
      )
      .reduce((out, item) => ({
        ...out,
        [item[0]]: out[item[0]]
          ? [ item[1], item[2], [ ...out[item[0]][2], item[3] ]]
          : [ item[1], item[2], [ item[3] ]]
      }), {}) as stepTwoType

    for (const person of Object.entries(members)) {
      const user = this.data.users[person[0]] ?? person[0]
      const guilds = person[1][2].map(id => gdata[id] ?? id).join('-')
      this.memberGuildsCache.set(person[0], guilds)

      Metrics.gaugeSurveillanceUsers
        .labels({ user, guilds })
        .set(SurveillanceModule.presenceLookup[person[1][0]] ?? -1)

      // Metrics.gaugeSurveillanceVoice
      //   .labels({ user, guilds })
      //   .set(person[1][1]?.channel ? (person[1][1].mute ? 0.5 : 1) : 0)
    }
  }

}
