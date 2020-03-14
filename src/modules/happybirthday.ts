import { modlogType } from '../types';
import { TudeBot } from "../index";
import { GuildMember, TextChannel } from "discord.js";
import { Module } from "../types";


export default class HappyBirthdayModule extends Module {

  private interval: NodeJS.Timeout;
  private lastDay = '';
  

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Happy Birthday', 'private', conf, data, guilds, lang);
  }

  public onEnable(): void {
  }

  public onBotReady(): void {
    this.interval = setInterval(() => this.check(), 1000 * 60 * 60);
    this.check();
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
    setTimeout((daystr, guilds, data) => {
      let users = [];
      for (let user in data) {
        if (data[user] == daystr)
          users.push(user);
      }
      if (!users.length) return;
      let msg = this.lang(users.length > 1 ? 'birthday_message_mult' : 'birthday_message');
      let usrstr = users.map(u => `<@${u}>`).join(' & ');
      msg = msg.split('{}').join(usrstr);

      for (let g of guilds.keys()) {
        let guild = TudeBot.guilds.get(g);
        if (!guild) continue;
        let channel = guild.channels.get(guilds.get(g).channel);
        if (!channel || channel.type !== 'text') continue;
        (channel as TextChannel).send(`@everyone ${msg}`);
      }
    }, Math.floor(Math.random() * maxdelay * 0), dstr, this.guilds, this.data);
  }

}