import { TudeBot } from "../index";
import { Message, TextChannel, Guild, GuildMember, User, MessageReaction, MessageEmbed, RichEmbed, RichEmbedOptions } from "discord.js";
import TudeApi, { ClubUser, Item } from "../thirdparty/tudeapi/tudeapi";
import Database from "../database/database";
import { DEFAULT_ITEMS } from "../thirdparty/tudeapi/itemlist";
import { Module } from "../types";
import Emojis from "../int/emojis";


type ShelfCategory = 'regular' | 'gem' | 'special' | 'event';
type Currency = 'cookies' | 'gems' | 'event-tokens';
type ShelfItem = { item: string; price: number; discount: number; currency: Currency; };
interface Shelf {
  title: string;
  category: ShelfCategory;
  items: ShelfItem[];
  changes: boolean;
}

export default class ClubItemShopModule extends Module {

  private channels: TextChannel[] = [];
  

  constructor(conf: any, data: any, lang: (string) => string) {
    super('Tude Club Item Shop', 'private', conf, data, lang);
  }

  public onEnable(): void {
  }

  public onBotReady(): void {
    for (let path of this.conf.channels) {
      let guildid = path.split('/')[0];
      let channelid = path.split('/')[1];
      if (!guildid || !channelid) return;
      let guild = TudeBot.guilds.get(guildid);
      if (!guild) return;
      let channel = guild.channels.get(channelid);
      if (!channel) return;
      this.channels.push(channel as TextChannel);
    }

    this.getShopdata().then(d => {
      this.channels.forEach(c => this.update(c, d));
    }).catch(err => console.error);
  }

  public onDisable(): void {
  }

  private update(channel: TextChannel, shelfs: Shelf[]): void {
    channel.fetchMessages().then(mes => {
      if (mes.size) {
        let c = 0;
        for (let m of mes.array()) {
          if (m.author.id != TudeBot.user.id) continue;
          if (c == 0) {
            if (!m.embeds.length)
              m.edit('​\n\n\n​' /* contains two zero with dividers at start and end of the string */, {
                embed: {
                  title: 'Welcome to the shop!',
                  color: 0x2f3136,
                  description: '*Scroll up to browse the shelfs!*\n> To purchase an item, just type it\'s name into this channel.\n> To buy multiple of a kind, let\'s say 5 fishing lure, just add\n> the amount like so: `lure 5`.',
                  footer: { text: 'Purchasing an item cannot be undone.' }
                }
              });
          } else if (c < shelfs.length + 1) {
            let s = shelfs[shelfs.length - c];
            if (s.changes)
              m.edit('', { embed: this.shelfToEmbed(s) });
          } else {
            if (m.embeds.length)
              m.edit(Emojis.BIG_SPACE, { embed: null });
          }
          c++;
        }
      } else {
        TudeBot.modlog.log(channel.guild, 'warning', 'Itemshop could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupitemshop ' + channel.id + '`');
      }
    }).catch(err => {
      TudeBot.modlog.log(channel.guild, 'warning', 'Itemshop could not get updated! Error: ```' + err + '```');
    });
  }

  private shelfToEmbed(shelf: Shelf): RichEmbedOptions {
    return {
      title: shelf.title,
      color: this.getShelfColor(shelf.category),
      description: shelf.items.map(i => {
        let itemdata = this.getItem(i);
        if (!itemdata) return 'error, item not found: ' + i.item;
        return `${itemdata.icon} ${itemdata.name}\n${Emojis.BIG_SPACE} \`${i.item}\` • ${i.discount ? `~~${i.price}~~ **${i.discount}**` : i.price} ${this.getCurrencyIcon(i.currency)}`;
      }).join('\n\n')
    }
  }

  private getItem(i: ShelfItem): Item {
    switch (i.item) {
      case 'cookie':
        return DEFAULT_ITEMS.cookie;
      case 'key':
        return DEFAULT_ITEMS.key;
      default:
        return TudeApi.items.find(item => item.id == i.item);
    }
  }

  private getShelfColor(category: ShelfCategory): number {
    switch (category) {
      case 'regular': return 0xD99E82;
      case 'gem': return 0x8CCAF7;
      case 'special': return 0xA6D388;
      case 'event': return 0xFFFFFF; // EVENT-UPDATE
    }
  }

  private getCurrencyIcon(currency: Currency): string {
    switch (currency) {
      case 'cookies': return '🍪';
      case 'gems': return '💎';
      case 'event-tokens': return '[]'; // EVENT-UPDATE
    }
  }

  private async getShopdata(): Promise<Shelf[]> {
    let target = (await Database.collection('clubitemshop').findOne({ _id: 'target' }))['shelfs'] as Shelf[];
    let current = (await Database.collection('clubitemshop').findOne({ _id: 'current' }))['shelfs'] as Shelf[];
    target = target.reverse();
    current = current.reverse();

    let out: Shelf[] = [];
    for (let i = 0; i < target.length; i++) {
      let s = { ...target[i] };
      s.changes = !this.areShelfsEqual(target[i], current[i]);
      out.push(s);
    }

    Database.collection('clubitemshop').updateOne({ _id: 'current' }, { '$set': { shelfs: target.reverse() } });
    return out.reverse();
  }

  private areShelfsEqual(shelf1: Shelf, shelf2: Shelf): boolean {
    if (shelf1 == undefined) return shelf2 == undefined;
    if (shelf2 == undefined) return false;

    if (shelf1.category != shelf2.category) return false;
    if (shelf1.title != shelf2.title) return false;
    if (shelf1.items.length != shelf2.items.length) return false;
    for (let i = 0; i < shelf1.items.length; i++) {
      if (shelf1.items[i].price != shelf2.items[i].price) return false;
      if (shelf1.items[i].item != shelf2.items[i].item) return false;
      if (shelf1.items[i].discount != shelf2.items[i].discount) return false;
      if (shelf1.items[i].currency != shelf2.items[i].currency) return false;
    }
    return true;
  }

}
