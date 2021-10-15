import { Message } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'


export default class QuotesModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Quotes', 'Adds quote channels', 'With this module you can turn text channels into quote channels, where every message gets presented as a quote from someone.', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('message', (mes) => {
      if (!this.isMessageEventValid(mes)) return
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return

      if (!mes.mentions.users.size) {
        mes.reply('Bidde `@User [text]` machen. Dange.').then((m: Message) => setTimeout(() => m.delete(), 20000))
        return
      }

      const ping = mes.mentions.users.first()
      const cont = mes.content.replace(/<@?!?[0-9]*>/g, '').trim()

      mes.delete()
      mes.channel.send({
        embeds: [
          {
            color: Math.floor(Math.random() * 0xFFFFFF),
            author: {
              name: ping.username,
              icon_url: `https://cdn.discordapp.com/avatars/${ping.id}/${ping.avatar}.jpg`
            },
            description: `**${cont}**\n\n__`,
            footer: {
              text: mes.author.username,
              icon_url: `https://cdn.discordapp.com/avatars/${mes.author.id}/${mes.author.avatar}.jpg`
            }
          }
        ]
      })
    })
  }

  public onBotReady() {
  }

  public onDisable() {
  }

}
