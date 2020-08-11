import { TudeBot } from "../index";
import { GuildMember, Message, Emoji, User, TextChannel } from "discord.js";
import * as util from "../util/util";
import { Module } from "../types/types";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import Emojis from "../int/emojis";


export default class FreestuffAssistantModule extends Module {

  private readonly gameMessages: Map<number, Message> = new Map();
  
  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Freestuff Assistant', 'private', conf, data, guilds, lang);
  }

  public onEnable(): void {
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }

  public on(event: string, data: any) {
    this.guilds.forEach(async (settings, guildid) => {
      if (!settings) return;

      if (!TudeBot || !TudeBot.readyAt) return;
      const guild = TudeBot.guilds.get(guildid);

      const channel = guild.channels.get(settings.channel) as TextChannel;
      if (!channel) return;

      const contentMods = settings.contentMods as string[];
      const user = data.user ? await TudeBot.fetchUser(data.user) : null;

      let mes: Message = null;
      switch (event) {
        case 'game_found':
          mes = await channel.send({ embed: {
            color: 0xAB6B31,
            title: 'Free Game Found!',
            description: `${data.game.info.title} (${data.game.info.store})\n[Outgoing announcement needs approval, please click here](${`https://dashboard.freestuffbot.xyz/content/${data.game._id}`})`
          }}) as Message;
          this.gameMessages.set(data.game._id, mes);
          break;
          
        case 'new_scratch':
          mes = await channel.send({ embed: {
            color: 0x3190AB,
            title: `${user?.username ?? '*Someone*'} created a new announcement`,
            description: `No data provided yet\n[Click here to view.](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`
          }}) as Message;
          this.gameMessages.set(data.game, mes);
          break;
          
        case 'new_url':
          mes = await channel.send({ embed: {
            color: 0x3190AB,
            title: `${user?.username ?? '*Someone*'} created a new announcement`,
            description: `Automatically fetched data from ${data.url}\n[Click here to view.](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`
          }}) as Message;
          this.gameMessages.set(data.game, mes);
          break;

        case 'game_save_draft':
          if (!this.gameMessages.has(data.game)) break;
          mes = this.gameMessages.get(data.game);
          mes.edit({ embed: {
            ...mes.embeds[0],
            fields: [{
              name: 'Activity',
              value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${user?.username ?? '*Someone*'} saved changes`
            }],
            message: undefined
          }});
          break;

        case 'game_decline':
          if (!this.gameMessages.has(data.game)) break;
          mes = this.gameMessages.get(data.game);
          mes.edit({ embed: {
            ...mes.embeds[0],
            fields: [{
              name: 'Activity',
              value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${user?.username ?? '*Someone*'} declined this game.`
            }],
            color: 0xAB3231,
            title: 'Done.',
            description: `[View in CMS](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`,
            message: undefined
          }});
          break;

        case 'game_accept':
          if (!this.gameMessages.has(data.game)) break;
          mes = this.gameMessages.get(data.game);
          mes.edit({ embed: {
            ...mes.embeds[0],
            fields: [{
              name: 'Activity',
              value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${user?.username ?? '*Someone*'} approved this game.`
            }],
            color: 0x59AB31,
            title: 'Done.',
            description: `[View in CMS](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`,
            message: undefined
          }});
          break;

        case 'manual_store_scrape':
          channel.send({ embed: {
            color: 0x2f3136,
            title: `${user?.username ?? '*Someone*'} initiated manual store scraping. Target: ${data.store}`
          }});
          break;
      }
    });
  }

}