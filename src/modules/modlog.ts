import { modlogType } from '../types';
import { TudeBot } from "../index";
import { GuildMember, Guild, TextChannel } from "discord.js";
import { Module } from "../types";


export default class ModlogModule extends Module {

  constructor(conf: any, data: any, lang: (string) => string) {
    super('Modlog', 'private', conf, data, lang);
  }

  public onEnable(): void {
    const conf = this.conf;
    const data = this.data;
    TudeBot.modlog = function (guild: Guild, type: modlogType, text: string): void {
      let id: string = guild.id;
      if (!conf.channels[id]) return;
      (guild.channels.get(conf.channels[id]) as TextChannel).send({
        embed: {
          color: 0x2f3136,
          description: `${data[type]} ${text}`
        }
      });
    }

    TudeBot.on('guildMemberAdd', (mem: GuildMember) => {
      TudeBot.modlog(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`);
    });

    TudeBot.on('guildMemberRemove', (mem: GuildMember) => {
      TudeBot.modlog(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`);
    });
  }

  public onBotReady(): void {

  }

  public onDisable(): void {

  }

}
