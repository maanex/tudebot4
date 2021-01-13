import { User, TextChannel } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'
import TudeApi from '../thirdparty/tudeapi/tudeapi'
import Emojis from '../int/emojis'


export default class ExternalRewardsModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('External Rewards', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  public reward(name: string, target: User, messageParams?: any) {
    if (!target) return
    this.guilds.forEach(async (data, guildid) => {
      const settings = data.rewards[name]
      if (!settings) return

      if (!TudeBot || !TudeBot.readyAt) return
      const guild = await TudeBot.guilds.fetch(guildid)
      if (!(await guild.members.fetch(target))) return

      const channel = guild.channels.resolve(settings.channel) as TextChannel
      if (!channel) return

      const res = await TudeApi.performClubUserActionRaw(`find?discord=${target.id}`, { id: 'obtain_perks', perks: settings.rewards }) as any
      const perks = res.perks as string[]
      const message = TudeBot.optionalLang(settings.message, {
        ...messageParams,
        user: target.toString(),
        username: target.username,
        cookies: this.findPerk(perks, 'club.cookies', '0'),
        gems: this.findPerk(perks, 'club.gems', '0'),
        keys: this.findPerk(perks, 'club.keys', '0'),
        points: this.findPerk(perks, 'club.points', '0'),
        cookies_emoji: Emojis.COOKIES,
        gems_emoji: Emojis.GEMS,
        keys_emoji: Emojis.KEYS,
        points_emoji: Emojis.POINTS,
        big_space: Emojis.BIG_SPACE
      })

      channel.send({
        embed: {
          color: 0x2F3136,
          title: message.includes('|') ? message.split('|')[0] : '',
          description: message.includes('|') ? message.split('|')[1] : message
        }
      })
    })
  }

  private findPerk(perks: string[], name: string, orElse: string): string {
    const perk = perks.find(p => p.startsWith(name + ':'))
    if (!perk) return orElse
    return perk.split(':')[1]
  }

}
