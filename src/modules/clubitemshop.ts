import { Message, MessageEmbedOptions, TextChannel } from 'discord.js'
import { Item } from 'thirdparty/tudeapi/item'
import { TudeBot } from '../index'
import TudeApi from '../thirdparty/tudeapi/tudeapi'
import Database from '../database/database'
import { Module } from '../types/types'
import Emojis from '../int/emojis'
import { findItem } from '../content/itemlist'


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
    super('Tude Club Item Shop', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
  }

  public async onBotReady() {
    for (const guildid of this.guilds.keys()) {
      const guild = await TudeBot.guilds.fetch(guildid)
      if (!guild) return
      for (const channelid of this.guilds.get(guildid).channels) {
        const channel = guild.channels.resolve(channelid)
        if (!channel) return
        this.channels.push(channel as TextChannel)
      }
    }

    this.getShopdata().then((d) => {
      this.channels.forEach(c => this.update(c, d))
    }).catch(console.error)

    TudeBot.on('message', (mes) => {
      if (!this.isMessageEventValid(mes)) return
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return

      const args = mes.content.toLowerCase().split(' ')

      function repl(message: string, desc?: string) {
        mes.channel.send({
          embed: {
            title: desc ? message : '',
            description: desc || message,
            color: 0x2F3136,
            footer: { text: `@${mes.author.tag}` }
          }
        }).then((mes) => {
          (mes as Message).delete({ timeout: 7000 })
        })
      }

      mes.delete({ timeout: 5000 })

      const item = findItem(args[0])
      if (!item) {
        repl(`Item \`${args[0]}\` not found!`)
        return
      }

      let amount = 1
      if (args.length > 1) {
        if (item.expanded) {
          repl('You can only buy one item of this kind at a time!')
          return
        }
        amount = parseInt(args[1])
        if (!amount || isNaN(amount) || amount <= 0) {
          repl(`\`${args[1]}\` is an invalid amount!`)
          return
        }
      }

      this.getShopdata().then((d) => {
        for (const shelf of d) {
          for (const sitem of shelf.items) {
            if (sitem.item === item.id) {
              TudeApi.clubUserByDiscordId(mes.author.id).then((u) => {
                if (!u) return

                const price = (sitem.discount || sitem.price) * amount
                let currencyEmoji = ''
                let currencyLeft = 0
                if (sitem.currency === 'cookies') {
                  if (u.cookies < price) {
                    repl(`This would cost ${price} ${Emojis.COOKIES}, you only have ${u.cookies}!`)
                    return
                  }
                  u.cookies -= price
                  currencyEmoji = Emojis.COOKIES
                  currencyLeft = u.cookies
                } else if (sitem.currency === 'gems') {
                  if (u.gems < price) {
                    repl(`This would cost ${price} ${Emojis.GEMS}, you only have ${u.gems}!`)
                    return
                  }
                  u.gems -= price
                  currencyEmoji = Emojis.GEMS
                  currencyLeft = u.gems
                } else if (sitem.currency === 'event-tokens') {
                  repl('Huh? Not implemented. Ping @Maanex, thx')
                  return
                }

                const itemi: Item = u.addItem(item)
                if (!itemi) return

                repl(`You purchased ${amount} ${TudeApi.clubLang[(amount === 1 ? 'item_' : 'itempl_') + itemi.id]} for ${price} ${currencyEmoji}`
                  , `You now have ${itemi.amount} ${itemi.name} and ${currencyLeft} ${currencyEmoji} left!`)

                TudeApi.updateClubUser(u)
              })
              return
            }
          }
        }
        repl(`We do not have ${TudeApi.clubLang['itempl_' + item.id]} in sock at the moment, sorry!`)
      })
    })
  }

  public onDisable() {
  }

  private update(channel: TextChannel, shelfs: Shelf[]) {
    channel.messages.fetch().then((mes) => {
      if (mes.size) {
        let c = 0
        for (const m of mes.array()) {
          if (m.author.id !== TudeBot.user.id) continue
          if (c === 0) {
            if (!m.embeds.length) {
              m.edit('​\n\n\n​' /* contains two zero with dividers at start and end of the string */, {
                embed: {
                  title: 'Welcome to the shop!',
                  color: 0x2F3136,
                  description: '*Scroll up to browse the shelfs!*\n> To purchase an item, just type it\'s name into this channel.\n> To buy multiple of a kind, let\'s say 5 fishing lure, just add\n> the amount like so: `lure 5`.',
                  footer: { text: 'Purchasing an item cannot be undone.' }
                }
              })
            }
          } else if (c < shelfs.length + 1) {
            const s = shelfs[shelfs.length - c]
            if (s.changes)
              m.edit('', { embed: this.shelfToEmbed(s) })
          } else if (m.embeds.length) { m.edit(Emojis.BIG_SPACE, { embed: null }) }
          c++
        }
      } else {
        TudeBot.modlog(channel.guild, 'warning', 'Itemshop could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupemptychannel ' + channel.id + '`')
      }
    }).catch((err) => {
      TudeBot.modlog(channel.guild, 'warning', 'Itemshop could not get updated! Error: ```' + err + '```')
    })
  }

  private shelfToEmbed(shelf: Shelf): MessageEmbedOptions {
    return {
      title: shelf.title,
      color: this.getShelfColor(shelf.category),
      description: shelf.items.map((i) => {
        const itemdata = findItem(i.item)
        if (!itemdata) return 'error, item not found: ' + i.item
        return `${itemdata.icon} ${TudeApi.clubLang['item_' + itemdata.id]}\n${Emojis.BIG_SPACE} \`${i.item}\` • ${i.discount ? `~~${i.price}~~ **${i.discount}**` : i.price} ${this.getCurrencyIcon(i.currency)}`
      }).join('\n\n')
    }
  }

  private getShelfColor(category: ShelfCategory): number {
    switch (category) {
      case 'regular': return 0xC88B6D
      case 'gem': return 0x44B674
      case 'special': return 0x768DC7
      case 'event': return 0xFFFFFF // EVENT-UPDATE
    }
  }

  private getCurrencyIcon(currency: Currency): string {
    switch (currency) {
      case 'cookies': return Emojis.COOKIES
      case 'gems': return Emojis.GEMS
      case 'event-tokens': return '[]' // EVENT-UPDATE
    }
  }

  private async getShopdata(): Promise<Shelf[]> {
    let target = (await Database.collection('clubitemshop').findOne({ _id: 'target' })).shelfs as Shelf[]
    let current = (await Database.collection('clubitemshop').findOne({ _id: 'current' })).shelfs as Shelf[]
    target = target.reverse()
    current = current.reverse()

    const out: Shelf[] = []
    for (let i = 0; i < target.length; i++) {
      const s = { ...target[i] }
      s.changes = !this.areShelfsEqual(target[i], current[i])
      out.push(s)
    }

    Database.collection('clubitemshop').updateOne({ _id: 'current' }, { $set: { shelfs: target.reverse() } })
    return out.reverse()
  }

  private areShelfsEqual(shelf1: Shelf, shelf2: Shelf): boolean {
    if (shelf1 === undefined) return shelf2 === undefined
    if (shelf2 === undefined) return false

    if (shelf1.category !== shelf2.category) return false
    if (shelf1.title !== shelf2.title) return false
    if (shelf1.items.length !== shelf2.items.length) return false
    for (let i = 0; i < shelf1.items.length; i++) {
      if (shelf1.items[i].price !== shelf2.items[i].price) return false
      if (shelf1.items[i].item !== shelf2.items[i].item) return false
      if (shelf1.items[i].discount !== shelf2.items[i].discount) return false
      if (shelf1.items[i].currency !== shelf2.items[i].currency) return false
    }
    return true
  }

}
