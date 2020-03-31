import { TudeBot } from "../index";
import { GuildMember, Message, Emoji, TextChannel, User } from "discord.js";
import * as util from "../util/util";
import { Module } from "../types";


export default class StayOnTopicModule extends Module {
  
  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Stay on topic', 'public', conf, data, guilds, lang);
  }

  public onEnable(): void {
    TudeBot.on('message', (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return;
      
      for (let rule of this.guildData(mes.guild).rules) {
        const regex = new RegExp(rule.match, 'i');
        if (regex.test(mes.content)) {
          if (rule.target == mes.channel.id) continue;
          const channel = mes.guild.channels.get(rule.target);
          if (!channel) continue;
          this.redirectUser(mes.author, mes.channel as TextChannel, channel as TextChannel, rule.name);
          break;
        }
      }
    });
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }

  private redirectUser(user: User, from: TextChannel, to: TextChannel, topic: string) {
    from.send(
      this.lang('wrong_channel_topic')
      .split('{user}').join(user.toString())
      .split('{topic}').join(topic)
      .split('{channel}').join(to.toString())
    );
  }
}