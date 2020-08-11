import { TudeBot } from "../index";
import { GuildMember, Message, Emoji } from "discord.js";
import * as util from "../util/util";
import { Module } from "../types/types";


export default class CountingModule extends Module {

  private lastUser: string = '';
  private lastNum: number = 0;

  
  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Counting', 'public', conf, data, guilds, lang);
  }

  public onEnable(): void {
    TudeBot.on('message', (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return;
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return;

      let content: string = mes.content.split(' ')[0];

      if (this.lastUser != '' && this.lastUser == mes.author.id) {
        this.react(mes);
        return;
      }
      this.lastUser = mes.author.id;

      let num: number = parseInt(content);
      if (num == NaN || (this.lastNum != 0 && num - this.lastNum != 1)) this.react(mes);
      else this.lastNum = num;
    });
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }

  private react(mes: Message): void {
    this.lastUser = '';
    this.lastNum = 0;
    let emojiName: string = this.data[mes.guild.id][util.rand(this.data[mes.guild.id].length)];
    let emoji: Emoji = mes.guild.emojis.find(e => e.name == emojiName);
    mes.react(emoji);
  }
}