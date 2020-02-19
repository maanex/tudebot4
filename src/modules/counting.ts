import { TudeBot } from "index";
import { GuildMember, Message, Emoji } from "discord.js";
import * as util from "../util/util";
import { Module } from "../types";


export default class CountingModule extends Module {

  private lastUser: string = '';
  private lastNum: number = 0;

  constructor(bot: TudeBot, conf: any, data: any, lang: (string) => string) {
    super('Counting', 'private', bot, conf, data, lang);
  }

  public onEnable(): void {
    this.bot.on('message', (mes: Message) => {
      if (mes.author.bot) return;
      if (!mes.guild) return;
      if (!this.conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;

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