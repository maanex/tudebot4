import { MessageReaction, User, Role } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'


export default class SelfrolesModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Selfroles', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
      if (user.bot) return
      if (!reaction.message.guild) return
      if (!this.isEnabledInGuild(reaction.message.guild)) return
      if (!this.guildData(reaction.message.guild).channels.includes(reaction.message.channel.id)) return

      const role = this.findRole(reaction)
      if (!role) return

      const extraRoles = this.guildData(reaction.message.guild).extraRoles || []

      const member = reaction.message.guild.member(user)
      if (!member.roles.resolve(role.id)) {
        member.roles.add(role)
        for (const rid of extraRoles)
          member.roles.add(member.guild.roles.resolve(rid))
      }
    })

    TudeBot.on('messageReactionRemove', (reaction: MessageReaction, user: User) => {
      if (user.bot) return
      if (!reaction.message.guild) return
      if (!this.isEnabledInGuild(reaction.message.guild)) return
      if (!this.guildData(reaction.message.guild).channels.includes(reaction.message.channel.id)) return

      const role = this.findRole(reaction)
      if (!role) return

      const member = reaction.message.guild.member(user)
      if (member.roles.resolve(role.id))
        member.roles.remove(role)
    })
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  private findRole(reaction: MessageReaction): Role {
    const serverdat = this.guildData(reaction.message.guild)
    if (!serverdat) return null
    const role = serverdat.roles[reaction.emoji.name]
    if (!role) return null
    return reaction.message.guild.roles.resolve(role)
  }

}
