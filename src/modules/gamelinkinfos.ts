import { Message } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'
import GibuGamesApi from '../thirdparty/gibuapis/gibu-games-api'
import Emojis from '../int/emojis'


export default class GameLinkInfos extends Module {

  public readonly regexForSteam = /https?:\/\/store.steampowered\.com\/app\/[\w/]*.*/g

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Game Link Infos', 'todo', 'todo', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('message', (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return
      if (this.guildData(mes.guild).channels && !this.guildData(mes.guild).channels.includes(mes.channel.id)) return

      const urls = mes.content.matchAll(this.regexForSteam)
      for (const url of urls)
        this.checkUrl(url[0], this.sendPlaceholderMessage(mes))
    })
  }

  private sendPlaceholderMessage(replyTo: Message): Promise<Message> {
    return replyTo.channel.send({
      embed: {
        description: Emojis.loading.string,
        color: 0x2F3136
      },
      message_reference: {
        message_id: replyTo.id,
        channel_id: replyTo.channel.id,
        guild_id: replyTo.guild.id,
        fail_if_not_exists: false
      }
    } as any)
  }

  private async checkUrl(url: string, context: Promise<Message>) {
    const data = await GibuGamesApi.getDetails(url)
    const message = await context

    message.edit(data?.description_short || 'Nothing found!')
  }

  //

  public onBotReady() {
  }

  public onDisable() {
  }

}
