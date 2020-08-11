import { TudeBot } from "../index";
import { Message, TextChannel, Guild, GuildMember, User, MessageReaction, MessageEmbed, RichEmbed, RichEmbedOptions } from "discord.js";
import TudeApi, { ClubUser, DeprItem } from "../thirdparty/tudeapi/tudeapi";
import Database from "../database/database";
import { Module } from "../types/types";
import Emojis from "../int/emojis";
import { Items, findItem, ItemList } from "../content/itemlist";
import { Item } from "thirdparty/tudeapi/item";


export default class ClubBulletinBoardModule extends Module {

  private channels: TextChannel[] = [];
  

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Club Bulletin Board', 'private', conf, data, guilds, lang);
  }

  public onEnable(): void {
  }

  public onBotReady(): void {
    for (let guildid of this.guilds.keys()) {
      let guild = TudeBot.guilds.get(guildid);
      if (!guild) return;
      for (let channelid of this.guilds.get(guildid).channels) {
        const channel = guild.channels.get(channelid);
        if (!channel) return;
        this.channels.push(channel as TextChannel);
      }
    }

    
  }

  public onDisable(): void {
  }

  private update(channel: TextChannel): void {
    channel.fetchMessages().then(mes => {
      if (mes.size) {
        let c = 0;
        for (let m of mes.array()) {
          if (m.author.id != TudeBot.user.id) continue;
          
          
          
          c++;
        }
      } else {
        TudeBot.modlog(channel.guild, 'warning', 'Bulletin Board could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupemptychannel ' + channel.id + '`');
      }
    }).catch(err => {
      TudeBot.modlog(channel.guild, 'warning', 'Bulletin Board could not get updated! Error: ```' + err + '```');
    });
  }

}
