import { GuildMember, Guild, TextChannel } from 'discord.js'
import { modlogType, Module } from '../types/types'
import { TudeBot } from '../index'

import Emojis from '../int/emojis'


export default class ModlogModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Modlog', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    const guilds = this.guilds
    TudeBot.modlog = function (guild: Guild, type: modlogType, text: string) {
      const id: string = guild.id
      if (!guilds.has(id)) return;
      (guild.channels.resolve(guilds.get(id).channel) as TextChannel).send({
        embed: {
          color: 0x2F3136,
          description: `${Emojis.MODLOG[type]} ${text}`
        }
      })
    }

    TudeBot.on('guildMemberAdd', (mem: GuildMember) => {
      TudeBot.modlog(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`)
    })

    TudeBot.on('guildMemberRemove', (mem: GuildMember) => {
      TudeBot.modlog(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`)
    })
  }

  public onBotReady() {

  }

  public onDisable() {

  }

}
