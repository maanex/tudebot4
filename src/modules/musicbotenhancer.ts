import { Message, VoiceState } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'


export default class MusicBotEnhancer extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Music Bot Enhancer', 'private', conf, data, guilds, lang)
  }

  private parserFor: { [name: string]: (mes: Message) => string } = {
    hydra: this.parserForHydra
  }

  public onEnable() {
    TudeBot.on('message', (mes: Message) => {
      const opts = this.guildData(mes.guild)?.[mes.author.id]
      if (!opts) return

      const parser = this.parserFor[opts.parser]
      if (!parser) return

      const song = parser(mes)
      if (!song) return

      const nickname = `${opts.prefix} ${song}`
      mes.member.setNickname(nickname)
    })

    TudeBot.on('voiceStateUpdate', async (before: VoiceState, after: VoiceState) => {
      if (!after?.channelID) {
        const opts = this.guildData(before.guild)?.[before.id]
        if (!opts) return

        const member = await before.guild.members.fetch(before.id)
        member.setNickname(`${opts.prefix} ${opts.nickname}`)
      }
    })
  }

  //

  private parserForHydra(message: Message): string {
    if (!message.embeds.length) return ''
    const embed = message.embeds[0]

    if (!embed.title?.toLowerCase()?.includes('playing')) return ''
    const latter = embed.description?.split('](')?.[0]
    if (!latter) return ''

    let name = latter.substr(1)
    if (name.length > 26) {
      if (name.includes(' - '))
        name = name.split(' - ')[1]
    }
    if (name.length > 26)
      name = name.substr(0, 24) + '...'
    return name
  }

  //

  public onBotReady() {
  }

  public onDisable() {
  }

}
