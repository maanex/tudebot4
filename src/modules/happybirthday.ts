import { modlogType } from '../types';
import { TudeBot } from "index";
import { GuildMember, TextChannel } from "discord.js";
import { Module } from "../types";


export default class HappyBirthdayModule extends Module {

  private interval: NodeJS.Timeout;
  private lastDay = '';

  constructor(bot: TudeBot, conf: any, data: any, lang: (string) => string) {
    super('Happy Birthday', 'private', bot, conf, data, lang);
  }

  public onEnable(): void {
    this.interval = setInterval(this.check, 1000 * 60 * 60);
    this.check();
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
    clearInterval(this.interval);
    this.interval = undefined;
  }

  private check(): void {
    let date = new Date();
    let dstr = date.getDate() + '-' + (date.getMonth() + 1);
    if (this.lastDay == dstr) return;
    this.lastDay = dstr;

    let maxdelay = 1000 * 60 * 60 * 5; // 5h
    setTimeout((daystr, bot, conf, data) => {
      let users = [];
      for (let user in data) {
        if (data[user] == daystr)
          users.push(user);
      }
      if (!users.length) return;
      let msg = this.lang(users.length > 1 ? 'birthday_message_mult' : 'birthday_message');
      let usrstr = users.map(u => `<@${u}>`).join(' & ');
      msg = msg.split('{}').join(usrstr);

      for (let c of conf.channels) {
        let gid = c.split('/')[0];
        let cid = c.split('/')[1];
        let guild = bot.guilds.find(g => g.id == gid);
        if (!guild) continue;
        let channel = guild.channels.find(c => c.id == cid);
        if (!channel || channel.type !== 'text') continue;
        (channel as TextChannel).send(`@everyone ${msg}`);
      }
    }, Math.floor(Math.random() * maxdelay), dstr, this.bot, this.conf, this.data);
  }

}