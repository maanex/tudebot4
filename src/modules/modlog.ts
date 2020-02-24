import { modlogType } from '../types';
import { TudeBot } from "../index";
import { GuildMember, Guild, TextChannel } from "discord.js";
import { Module } from "../types";


export default class ModlogModule extends Module {

  constructor(conf: any, data: any, lang: (string) => string) {
    super('Modlog', 'private', conf, data, lang);
  }

  public onEnable(): void {
    TudeBot.modlog = {
      log: function (guild: Guild, type: modlogType, text: string): void {
        let id: string = guild.id;
        if (!this.conf.channels[id]) return;
        (guild.channels.get(this.conf.channels[id]) as TextChannel).send({
          embed: {
            color: 0x2f3136,
            description: `${this.data[type]} ${text}`
          }
        });
      }
    }

    TudeBot.on('guildMemberAdd', (mem: GuildMember) => {
      TudeBot.modlog.log(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`);
    });

    TudeBot.on('guildMemberRemove', (mem: GuildMember) => {
      TudeBot.modlog.log(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`);
    });
  }

  public onBotReady(): void {

  }

  public onDisable(): void {

  }

}
