import { TudeBot } from "../index";
import { MessageReaction, User, Role } from "discord.js";
import { Module } from "../types/types";


export default class SelfrolesModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Selfroles', 'public', conf, data, guilds, lang);
  }

  public onEnable(): void {
    TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
      if (user.bot) return;
      if (!reaction.message.guild) return;
      if (!this.isEnabledInGuild(reaction.message.guild)) return;
      if (!this.guildData(reaction.message.guild).channels.includes(reaction.message.channel.id)) return;
  
      let role = this.findRole(reaction);
      if (!role) return;
  
      let extraRoles = this.guildData(reaction.message.guild).extraRoles || [];
  
      let member = reaction.message.guild.member(user);
      if (!member.roles.find(r => r.id == role.id)) {
        member.addRole(role);
        for (let rid of extraRoles)
          member.addRole(member.guild.roles.find(r => r.id == rid));
      }
    });
  
    TudeBot.on('messageReactionRemove', (reaction: MessageReaction, user: User) => {
      if (user.bot) return;
      if (!reaction.message.guild) return;
      if (!this.isEnabledInGuild(reaction.message.guild)) return;
      if (!this.guildData(reaction.message.guild).channels.includes(reaction.message.channel.id)) return;
  
      let role = this.findRole(reaction);
      if (!role) return;
  
      let member = reaction.message.guild.member(user);
      if (member.roles.find(r => r.id == role.id))
        member.removeRole(role);
    });
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }

  private findRole(reaction: MessageReaction): Role {
    let serverdat = this.guildData(reaction.message.guild);
    if (!serverdat) return null;
    let role = serverdat.roles[reaction.emoji.name];
    if (!role) return null;
    return reaction.message.guild.roles.get(role);
  }

}