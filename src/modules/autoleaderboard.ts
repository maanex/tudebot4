/* eslint-disable no-undef */
import { Message, TextChannel, Guild, GuildMember, User, MessageReaction } from 'discord.js'
import { TudeBot } from '../index'
import TudeApi, { ClubUser } from '../thirdparty/tudeapi/tudeapi'
import { Module } from '../types/types'


export default class QuotesModule extends Module {

  private readonly UPDATE_COOLDOWN = 2 * 60_000;
  private readonly UPDATE_EMOJI = '🔄';

  private interval: NodeJS.Timeout;

  private channels: TextChannel[] = [];


  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Auto Leaderboard', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
      const mes = reaction.message
      if (user.bot) return
      if (!this.isEnabledInGuild(mes.guild)) return
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return

      if (reaction.emoji.name === this.UPDATE_EMOJI)
        this.update(mes.channel as TextChannel)
    })
  }

  public async onBotReady() {
    for (const guildid of this.guilds.keys()) {
      const guild = await TudeBot.guilds.fetch(guildid)
      if (!guild) return
      for (const channelid of this.guilds.get(guildid).channels) {
        const channel = guild.channels.resolve(channelid)
        if (!channel) return
        this.channels.push(channel as TextChannel)
      }
    }

    let lastmin = 0
    this.interval = setInterval(() => {
      const currmin = new Date().getMinutes()
      if (currmin === lastmin) return
      lastmin = currmin
      if (currmin !== 0) return
      this.channels.forEach(c => this.update(c))
    }, 30_000)
    this.channels.forEach(c => this.update(c))
  }

  public onDisable() {
    clearInterval(this.interval)
    this.interval = undefined
  }

  private update(channel: TextChannel) {
    this.generateLeaderboard(channel.guild).then((content) => {
      channel.messages.fetch().then((m) => {
        if (m.size) {
          const mes = m.first()
          mes.edit(content)
          mes.reactions.removeAll()
          setTimeout(() => {
            mes.react(this.UPDATE_EMOJI)
          }, this.UPDATE_COOLDOWN)
        } else {
          channel.send(content).then((mes) => {
            (mes as Message).react(this.UPDATE_EMOJI)
          }).catch((err) => {
            TudeBot.modlog(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```')
          })
        }
      }).catch((err) => {
        TudeBot.modlog(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```')
      })
    }).catch((err) => {
      TudeBot.modlog(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```')
    })
  }

  private async generateLeaderboard(guild: Guild): Promise<string> {
    const leaderboard = await TudeApi.clubLeaderboard()

    let out = '   | All Time           | This Month         | Cookies            | Daily Streak\n---+--------------------+--------------------+--------------------+-------------------'

    for (let i = 0; i < 10; i++) {
      const [ ats, tms, cos, dss ] = await Promise.all([
        this.generateEntry(guild, leaderboard.alltime[i], 'level', false, 'lv'),
        this.generateEntry(guild, leaderboard.month[i], 'points_month', true),
        this.generateEntry(guild, leaderboard.cookies[i], 'cookies', true),
        this.generateEntry(guild, leaderboard.dailystreak[i], 'daily.streak', true)
      ])

      out += `\n${((i + 1) + '. ').slice(0, 3)}| ${ats} | ${tms} | ${cos} | ${dss}`
    }
    out += `\nLast Update: ${new Date(leaderboard.updated)}`
    if (new Date().getHours() === 0) { // Whale fact time
      out += '``` ```fix\nWhale fact of the day: '
      const facts: string[] = this.data.whalefacts
      out += facts[new Date().getDate() % facts.length]
    }
    return '```cs\n' + out + '```'
  }

  private async generateEntry(guild: Guild, entry: ClubUser, field: string, bignums: boolean, prefix?: string) {
    let u: GuildMember | null
    try {
      u = entry ? (await guild.members.fetch(entry.user.accounts.discord)) : null
    } catch (err) { u = null }

    if (!entry) return '                  '
    const value = this.parseEntryfield(entry, field) as number

    let outval = value + ''
    if (bignums) {
      if (value > 999999)
        outval = `${Math.round(value / 1000000)}m`
      else if (value > 9999)
        outval = `${Math.round(value / 1000)}k`

    }

    if (prefix)
      return `${u ? u.user.username : entry.user.name}..............`.slice(0, 15 - prefix.length) + `..${prefix}${outval}`.slice(-3 - prefix.length)
    else
      return `${u ? u.user.username : entry.user.name}................`.slice(0, 13) + `......${outval}`.slice(-5)
  }

  private parseEntryfield(entry: any, field: string) {
    let out = entry
    for (const key of field.split('.'))
      out = out[key]
    return out
  }

}
