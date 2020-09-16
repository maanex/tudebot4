import { TudeBot } from "../../index";
import { GuildMember, Message, Emoji, TextChannel } from "discord.js";
import * as nreq from "request";
import { Module } from "../../types/types";
import { Wit, log} from "node-wit";
import SupportCommand from "../../commands/support";


/** This is some wild sh*t */
export default class TheBrainModule extends Module {

  private timeouts = [];

  public witClient;
  

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('The Brain', 'public', conf, data, guilds, lang);

    this.witClient = new Wit({
      accessToken: TudeBot.config.thirdparty.wit.token
    });
  }

  public onEnable(): void {
    TudeBot.on('message', (mes: Message) => {
      if (mes.author.bot) return;
    });
  }

  public onBotReady(): void {
    setTimeout(() => this.setPlaytext(), 1000);
    setTimeout(() => this.setNewIcon(), 1000);
  }

  public onDisable(): void {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  private downloadAllImages(): void {
    let all = this.data.icons.random;
    let i = 0;
    for (let url of all) {
      var request = nreq.defaults({ encoding: null });
      request.get(url, function (err, res, body) {
        if (err) return;
        if (!body) return;

        let b = body.toString('base64').replace(/^data:image\/png;base64,/, "");
        require("fs").writeFile(`C:\\Users\\andre\\Desktop\\out\\img_${i++}.png`, b, 'base64', function (err) {
          console.log(err);
        });
        console.log(`Image ${i} exportiert`);
      });
    }
  }

  private convertAllImages(): void {
    let num = 4611;
    const sharp = require('sharp')
    while (num >= 0) {
      sharp(`C:\\Users\\andre\\Desktop\\out\\img_${num}.png`).toFile(`C:\\Users\\andre\\Desktop\\outjpg\\img_${num}.jpg`, (err, info) => {
        console.log(info)
      });
      num--;
    }
  }

  private setNewIcon(timeoutonly: boolean = true): void {
    if (!timeoutonly) {
      var request = nreq.defaults({ encoding: null });
      request.get(this.getIconUrl(), function (err, res, body) {
        if (err) return;
        if (!body) return;

        // bot.user.setAvatar(body);
        // (bot.guilds.get('342620626592464897').channels.get('487263535064154113') as TextChannel).sendFile(body);
      });
    }
    let sixH = 6 * 60 * 60 * 1000;
    this.timeouts.push(setTimeout(() => this.setNewIcon(false), sixH + Math.floor(Math.random() * sixH * 5)));
  }

  private setPlaytext(): void {
    TudeBot.user.setActivity(this.getText());
    this.timeouts.push(setTimeout(() => this.setPlaytext(), 1 * 60 * 1000 + Math.floor(Math.random() * 3 * 60 * 60 * 1000)));
  }

  private getText(): string {
    let all = this.data.texts;
    let category = 'info';
    if (Math.random() < .5) category = 'stuff';
    if (Math.random() < .7) category = 'random';
    let list = all[category];
    let text = list[Math.floor(Math.random() * list.length)];
    return text;
  }

  private getIconUrl(): string {
    let all = this.data.icons;
    let category = 'random';
    if (Math.random() < .7) category = 'random';
    let list = all[category];
    let icon = list[Math.floor(Math.random() * list.length)];
    return icon;
  }
}