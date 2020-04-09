import { TudeBot } from "../index";
import { Message, TextChannel, Guild, GuildMember, User, MessageReaction, MessageEmbed, RichEmbed, RichEmbedOptions } from "discord.js";
import TudeApi, { ClubUser, DeprItem } from "../thirdparty/tudeapi/tudeapi";
import Database from "../database/database";
import { Module } from "../types";
import Emojis from "../int/emojis";
import { Items, findItem } from "../thirdparty/tudeapi/itemlist";
import { Item } from "thirdparty/tudeapi/item";


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
  

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Tude Club Item Shop', 'private', conf, data, guilds, lang);
  }

  public onEnable(): void {
  }

  public onBotReady(): void {
    for (let guildid of this.guilds.keys()) {
      let guild = TudeBot.guilds.get(guildid);
      if (!guild) return;
      for (let channelid of this.guilds.get(guildid).channels) {
        let channel = guild.channels.get(channelid);
        if (!channel) return;
        this.channels.push(channel as TextChannel);
      }
    }

    this.getShopdata().then(d => {
      this.channels.forEach(c => this.update(c, d));
    }).catch(err => console.error);

    TudeBot.on('message', mes => {
      if (!this.isMessageEventValid(mes)) return;
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return;

      const args = mes.content.toLowerCase().split(' ');

      function repl(message: string, desc?: string) {
        mes.channel.send({ embed: {
          title: desc ? message : '',
          description: desc || message,
          color: 0x2f3136,
          footer: { text: `@${mes.author.tag}` }
        }}).then(mes => {
          (mes as Message).delete(7000);
        });
      }

      mes.delete(5000);

      const item = findItem(args[0]);
      if (!item) {
        repl(`Item \`${args[0]}\` not found!`);
        return;
      }

      let amount = 1;
      if (args.length > 1) {
        if (item.expanded) {
          repl('You can only buy one item of this kind at a time!');
          return;
        }
        amount = parseInt(args[1]);
        if (!amount || isNaN(amount) || amount <= 0) {
          repl(`\`${args[1]}\` is an invalid amount!`);
          return;
        }
      }

      this.getShopdata().then(d => {
        out:
        for (const shelf of d) {
          for (const sitem of shelf.items) {
            if (sitem.item == item.id) {
              TudeApi.clubUserByDiscordId(mes.author.id).then(u => {
                if (!u) return;

                const price = (sitem.discount || sitem.price) * amount;
                let currencyEmoji = '';
                let currencyLeft = 0;
                if (sitem.currency == 'cookies') {
                  if (u.cookies < price) {
                    repl(`This would cost ${price} ${Emojis.COOKIES}, you only have ${u.cookies}!`);
                    return;
                  }
                  u.cookies -= price;
                  currencyEmoji = Emojis.COOKIES;
                  currencyLeft = u.cookies;
                } else if (sitem.currency == 'gems') {
                  if (u.gems < price) {
                    repl(`This would cost ${price} ${Emojis.GEMS}, you only have ${u.gems}!`);
                    return;
                  }
                  u.gems -= price;
                  currencyEmoji = Emojis.GEMS;
                  currencyLeft = u.gems;
                } else if (sitem.currency == 'event-tokens') {
                  repl('Huh? Not implemented. Ping @Maanex, thx');
                  return;
                }

                let itemi: Item = undefined;
                if (item._isDef) {
                  switch(item.id) {
                    case 'cookie':
                      u.cookies += amount;
                      itemi = item.create(u.cookies);
                      break;
                    case 'gem':
                      u.gems += amount;
                      itemi = item.create(u.gems);
                      break;
                    case 'key':
                      u.keys += amount;
                      itemi = item.create(u.keys);
                      break;
                    default: return;
                  }
                } else if (u.inventory.has(item.id)) {
                  if (item.expanded) {
                    repl('An error occured!', 'Try again later!');
                    return;
                  }
                  itemi = u.inventory.get(item.id);
                  itemi.amount += amount;
                } else {
                  const itemInstance: Item = item.expanded ? new item.class(item, item.id, {}) : new item.class(item, amount);
                  u.inventory.set(item.id, itemInstance);
                  itemi = itemInstance;
                }
                if (!itemi) return;
                
                repl(`You purchased ${amount} ${TudeApi.clubLang[(amount==1?'item_':'itempl_') + itemi.id]} for ${price} ${currencyEmoji}`
                    ,`You now have ${itemi.amount} ${itemi.name} and ${currencyLeft} ${currencyEmoji} left!`);

                TudeApi.updateClubUser(u);
              });
              return;
            }
          }
        }
        repl(`We do not have ${TudeApi.clubLang['itempl_'+item.id]} in sock at the moment, sorry!`);
      });
    });
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
        TudeBot.modlog(channel.guild, 'warning', 'Itemshop could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupitemshop ' + channel.id + '`');
      }
    }).catch(err => {
      TudeBot.modlog(channel.guild, 'warning', 'Itemshop could not get updated! Error: ```' + err + '```');
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

  private getItem(i: ShelfItem): DeprItem {
    switch (i.item) {
      case 'cookie':
        // return DEFAULT_ITEMS.cookie;
      case 'key':
        // return DEFAULT_ITEMS.key;
      default:
        // return TudeApi.items.find(item => item.id == i.item);
        return null; // TODO
    }
  }

  private getShelfColor(category: ShelfCategory): number {
    switch (category) {
      case 'regular': return 0xC88B6D;
      case 'gem': return 0x44B674;
      case 'special': return 0x768DC7;
      case 'event': return 0xFFFFFF; // EVENT-UPDATE
    }
  }

  private getCurrencyIcon(currency: Currency): string {
    switch (currency) {
      case 'cookies': return Emojis.COOKIES;
      case 'gems': return Emojis.GEMS;
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
