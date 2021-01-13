import { Message, Emoji } from 'discord.js'
import { TudeBot } from '../index'
import * as util from '../util/util'
import { Module } from '../types/types'


export default class CountingModule extends Module {

  private lastUser: string = '';
  private lastNum: number = 0;


  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Counting', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('message', (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return

      const content: string = mes.content.split(' ')[0]

      if (this.lastUser !== '' && this.lastUser === mes.author.id) {
        this.react(mes)
        return
      }
      this.lastUser = mes.author.id

      const num: number = parseInt(content)
      if (isNaN(num) || (this.lastNum !== 0 && num - this.lastNum !== 1)) this.react(mes)
      else this.lastNum = num
    })
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  private react(mes: Message) {
    this.lastUser = ''
    this.lastNum = 0
    const emojiName: string = this.data[mes.guild.id][util.rand(this.data[mes.guild.id].length)]
    const emoji: Emoji = mes.guild.emojis.cache.find(e => e.name === emojiName)
    mes.react(emoji.id)
  }

}
