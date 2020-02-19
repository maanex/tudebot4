import { TudeBot } from "index";
import { MessageReaction, User, Role } from "discord.js";
import { Module } from "../types";


export default class SelfrolesModule extends Module {

  constructor(bot: TudeBot, conf: any, data: any, lang: (string) => string) {
    super('Selfroles', 'public', bot, conf, data, lang);
  }

  public onEnable(): void {
    this.bot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
      if (user.bot) return;
      if (!reaction.message.guild) return;
      if (!this.conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`]) return;
  
      let role = this.findRole(reaction);
      if (!role) return;
  
      let extraRoles = this.conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`].extraRoles || [];
  
      let member = reaction.message.guild.member(user);
      if (member.roles.find(r => r.id == role.id)) {
        member.removeRole(role);
        const re = reaction;
        const us = user;
        setTimeout(() => re.remove(us), 200);
      } else {
        member.addRole(role);
        for (let rid of extraRoles)
          member.addRole(member.guild.roles.find(r => r.id == rid));
      }
    });
  
    this.bot.on('messageReactionRemove', (reaction: MessageReaction, user: User) => {
      if (user.bot) return;
      if (!reaction.message.guild) return;
      if (!this.conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`]) return;
  
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
    let serverdat = this.data[reaction.message.guild.id];
    if (!serverdat) return null;
    let role = serverdat[reaction.emoji.name];
    if (!role) return null;
    return reaction.message.guild.roles.get(role);
  }

}