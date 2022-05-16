import { GuildMember, Guild, TextChannel, GuildBan } from 'discord.js'
import { modlogType, Module } from '../types/types'
import { TudeBot } from '../index'
import Emojis from '../lib/data/emojis'


export default class ModlogModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('Modlog', '📜', 'Logs for everything', 'This module can log a lot of moderation related events. Additionally other modules might also log stuff if this module is enabled.', 'public', conf, data, guilds)
  }

  public onEnable() {
    const guilds = this.guilds
    TudeBot.modlog = function (guild: Guild, type: modlogType, text: string) {
      const id: string = guild.id
      if (!guilds.has(id)) return
      const channelId: string = guilds.get(id)['channel-' + type] || guilds.get(id).channel
      ;(guild.channels.resolve(channelId) as TextChannel).send({
        embeds: [
          {
            color: 0x2F3136,
            description: `${Emojis.modlog[type]} ${text.split('\n').join(`\n${Emojis.bigSpace} `)}`
          }
        ]
      })
    }

    TudeBot.on('guildMemberAdd', (mem: GuildMember) => {
      const flags = mem.user.flags
        .toArray()
        .filter(f => !f.includes('HOUSE') && !f.includes('SUPPORTER') && !f.includes('BOT'))
        .map(f => f.toLocaleLowerCase())
        .map(f => `\`${f}\``)

      TudeBot.modlog(mem.guild, 'userJoin', [
        `${mem.user} as ${mem.user.username}`,
        `Account age: <t:${~~(mem.user.createdTimestamp / 1000)}:D>`,
        flags.length ? `Flags: ${flags.join(', ')}` : ''
      ].filter(a => !!a).join('\n'))
    })

    TudeBot.on('guildMemberRemove', (mem: GuildMember) => {
      TudeBot.modlog(mem.guild, 'userQuit', [
        `${mem.user} as ${mem.user.username}`,
        `Joined <t:${~~(mem.joinedTimestamp / 1000)}:R>`,
        (mem.roles?.highest && !mem.roles?.highest.equals(mem.guild.roles.everyone)) ? `Highest role: ${mem.roles.highest.toString()}` : ''
      ].filter(a => !!a).join('\n'))
    })

    TudeBot.on('guildBanAdd', (ban: GuildBan) => {
      TudeBot.modlog(ban.guild, 'punish', `${ban.user} as ${ban.user.username} was banned by unknown for reason ${ban.reason}`)
    })

    TudeBot.on('guildBanRemove', (ban: GuildBan) => {
      TudeBot.modlog(ban.guild, 'punish', `The ban for ${ban.user} as ${ban.user.username} was lifted`)
    })
  }

  public onBotReady() {

  }

  public onDisable() {

  }

}
