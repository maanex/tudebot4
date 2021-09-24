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

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Surveillance', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
  }

  public onBotReady() {
    this.updateAll()
  }

  public onDisable() {
  }

  private getGuilds() {
    return this.data[TudeBot.devMode ? 'guilds-dev' : 'guilds']
  }

  private async updateAll() {
    const gdata = this.getGuilds()
    const guilds = await Promise.all(Object.keys(gdata).map(i => TudeBot.guilds.fetch(i)))
    const members = guilds
      .flatMap(g => g
        .members
        .cache
        .filter(m => !m.user.bot)
        .map(u => [ u.id, u.presence.status, u.voice, g.id ] as [string, PresenceStatus, VoiceState, string])
      )
      .reduce((out, item) => ({
        ...out,
        [item[0]]: out[item[0]]
          ? [ item[1], item[2], [ ...out[item[0]][2], item[3] ]]
          : [ item[1], item[2], [ item[3] ]]
      }), {}) as Record<string, [ PresenceStatus, VoiceState, string[] ]>

    for (const person of Object.entries(members)) {
      Metrics.gaugeSurveillanceUsers.labels({
        user: this.data.users[person[0]] ?? person[0],
        guilds: person[1][2].map(id => gdata[id] ?? id).join('-')
      }).set(SurveillanceModule.presenceLookup[person[1][0]])
    }
  }

}
