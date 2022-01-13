import { ClientPresenceStatusData, PresenceStatus, VoiceState } from 'discord.js'
import { Long } from 'mongodb'
import Database from '../database/database'
import { TudeBot } from '../index'
import Metrics from '../lib/metrics'
import { Module } from '../types/types'


type DatapointIncidentType = 'voice1m' | 'text1m'

export default class SurveillanceModule extends Module {

  private static presenceLookup: Record<PresenceStatus, number> = {
    invisible: 0,
    offline: 0,
    idle: 10,
    online: 20,
    dnd: 30
  }

  private memberGuildsCache: Map<string, string> = new Map()
  private int10m: any = null
  private int1m: any = null

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Surveillance', '🕵️', 'Collects user telemetry data', 'This module collects data. I dont wanna write anything else here.', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
    this.int10m = setInterval(mod => mod.updateAll(), 1000 * 60 * 10, this)
    this.int1m = setInterval(mod => mod.datapoint1mTick(), 1000 * 60, this)

    TudeBot.on('presenceUpdate', (before, after) => {
      const user = after?.userId ?? before?.userId
      if (!user) return

      const guilds = this.memberGuildsCache.get(user)
      if (!guilds) return

      const deviceIndicator = this.generateDeviceIndicator(after.clientStatus)

      Metrics.gaugeSurveillanceUsers
        .labels({ user: this.data.users[user] ?? user, guilds })
        .set(SurveillanceModule.presenceLookup[after.status] + deviceIndicator)
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

      if (!this.chatActivity.has(mes.channelId))
        this.chatActivity.set(mes.channelId, [])
      this.chatActivity.get(mes.channelId).push(user)
    })
  }

  public onBotReady() {
    setTimeout(() => this.updateAll(), 5000)
  }

  public onDisable() {
    clearInterval(this.int10m)
    clearInterval(this.int1m)
  }

  private getGuilds(): Record<string, string> {
    return this.data[TudeBot.devMode ? 'guilds-dev' : 'guilds']
  }

  private async updateAll() {
    type stepOneType = [string, PresenceStatus, ClientPresenceStatusData, VoiceState, string]
    type stepTwoType = Record<string, [ PresenceStatus, ClientPresenceStatusData, VoiceState, string[] ]>

    const gdata = this.getGuilds()
    const guilds = await Promise.all(Object.keys(gdata).map(i => TudeBot.guilds.fetch(i)))
    const members = guilds
      .flatMap(g => g.members.cache
        .filter(m => !m.user.bot)
        .map(u => [ u.id, u.presence?.status ?? 'offline', u.presence?.clientStatus, u.voice, g.id ] as stepOneType)
      )
      .reduce((out, item) => ({
        ...out,
        [item[0]]: out[item[0]]
          ? [ item[1], item[2], item[3], [ ...out[item[0]][3], item[4] ]]
          : [ item[1], item[2], item[3], [ item[4] ]]
      }), {}) as stepTwoType

    for (const person of Object.entries(members)) {
      const user = this.data.users[person[0]] ?? person[0]
      const guilds = person[1][3].map(id => gdata[id] ?? id).join('-')
      this.memberGuildsCache.set(person[0], guilds)

      const deviceIndicator = this.generateDeviceIndicator(person[1][1])

      Metrics.gaugeSurveillanceUsers
        .labels({ user, guilds })
        .set((SurveillanceModule.presenceLookup[person[1][0]] ?? -1) + deviceIndicator)

      // Metrics.gaugeSurveillanceVoice
      //   .labels({ user, guilds })
      //   .set(person[1][1]?.channel ? (person[1][1].mute ? 0.5 : 1) : 0)
    }
  }

  private generateDeviceIndicator(clientStatus: ClientPresenceStatusData): number {
    if (!clientStatus) return 0
    let out = 0
    if (clientStatus.desktop) out += 1
    if (clientStatus.mobile) out += 2
    if (clientStatus.web) out += 4
    return out
  }

  /*
   * DATAPOINT GENERATION
   */

  private chatActivity: Map<string, string[]> = new Map()

  public async datapoint1mTick() {
    // TODO
    return

    /* eslint-disable no-unreachable */
    console.log('YIKES')
    for (const channel of this.chatActivity.keys()) {
      const people = this.chatActivity.get(channel)
      console.log('YOOT')
      this.pairupGroup(people, (a, b) => {
        console.log('YAMMA MIA')
        this.recordDatapointIncident(a, b, 'text1m')
      })
    }
    console.log('YEEEEE')
    this.chatActivity.clear()
    console.log('YEHAW')

    const guilds: string[] = Object.keys(this.getGuilds())
    for (const id of guilds) {
      const guild = await TudeBot.guilds.fetch(id)
      const unfilteredPeople = [ ...guild.voiceStates.cache.values() ]
      const people = unfilteredPeople.filter(p => !!p.channelId)
      const channels: Map<string, string[]> = new Map()

      for (const person of people) {
        if (!channels.has(person.channelId))
          channels.set(person.channelId, [])
        channels.get(person.channelId).push(person.id)
      }

      for (const channel of channels.keys()) {
        this.pairupGroup(channels.get(channel), (a, b) => {
          this.recordDatapointIncident(a, b, 'voice1m')
        })
      }
    }console.log('YOUTCH')
  }

  public pairupGroup<T>(list: T[], callback: (a: T, b: T) => any) {
    if (list.length <= 1) return
    const first = list.splice(0, 1)[0]
    list.forEach(e => callback(e, first))
    this.pairupGroup(list, callback)
  }

  public sortStingifiedLongs(s1: string, s2: string): [ string, string ] {
    if (s1.length < s2.length) return [ s1, s2 ]
    if (s2.length < s1.length) return [ s2, s1 ]
    if (s1 < s2) return [ s1, s2 ]
    return [ s2, s1 ]
  }

  public recordDatapointIncident(person1: string, person2: string, type: DatapointIncidentType) {
    if (!person1 || !person2) return
    [ person1, person2 ] = this.sortStingifiedLongs(person1, person2)

    Database
      .collection('surveillance-points')
      .updateOne(
        { _p1: Long.fromString(person1), _p2: Long.fromString(person2), type },
        { $inc: { count: 1 } },
        { upsert: true }
      )
  }

}
