import { TudeBot } from "../index";
import { GuildMember, Message, Emoji, TextChannel } from "discord.js";
import * as util from "../util/util";
import { Module } from "../types";
import TheBrainModule from "./thebrain";
import SupportCommand from "../commands/support";


export default class AutoSupportModule extends Module {

  private witClient;
  
  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Auto Support', 'public', conf, data, guilds, lang);
  }

  public onEnable(): void {
    this.witClient = TudeBot.getModule<TheBrainModule>('thebrain').witClient;

    TudeBot.on('message', (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return;
      if (!this.guildData(mes.guild).channels[mes.channel.id]) return;

      this.witClient.message(mes.content)
        .then((data) => {
          if (!data.entities.intent) return;
          if (data.entities.intent[0].value != 'support') return;
          if (!data.entities.issue) return;
          
          if (!data.entities.target || data.entities.target[0].suggested)
            data.entities.target = [{ value: this.guildData(mes.guild).channels[mes.channel.id] }];

          if (data.entities.target[0].value.includes('free')) {
            if (SupportCommand.RESOUCES.freestuff[data.entities.issue[0].value]) {
              SupportCommand.sendSupportEmbed(SupportCommand.RESOUCES.freestuff[data.entities.issue[0].value], mes.channel as TextChannel, mes.author);
            }
          }
        });
    });
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }
}