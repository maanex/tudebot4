import { Events, Message, TextChannel, User } from 'discord.js'
import { TudeBot } from '../index'
import Localisation from '../lib/localisation'
import { Module } from '../types/types'


export default class StayOnTopicModule extends Module {

  private sentTo: string[] = [];

  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('Stay on topic', '👮', 'Lets people know they\'re off-topic', 'This module will detect when the conversation goes off-topic and will redirect people to the correct channel', 'public', conf, data, guilds)
  }

  public onEnable() {
    TudeBot.on(Events.MessageCreate, (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return

      for (const rule of this.guildData(mes.guild).rules) {
        const regex = new RegExp(rule.match, 'i')
        if (regex.test(mes.content)) {
          if (rule.target === mes.channel.id) continue
          if (this.sentTo.includes(mes.channel.id)) continue
          const channel = mes.guild.channels.resolve(rule.target)
          if (!channel) continue
          this.redirectUser(mes.author, mes.channel as TextChannel, channel as TextChannel, rule.name)
          this.sentTo.push(mes.channel.id)
          setTimeout(() => this.sentTo.splice(this.sentTo.indexOf(mes.channel.id), 1), 1000 * 60 * 5)
          break
        }
      }
    })
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  private redirectUser(user: User, from: TextChannel, to: TextChannel, topic: string) {
    const text = Localisation.text('en-US', '=wrong_channel_topic', {
      user: user.toString(),
      topic,
      channel: to.toString()
    })
    from.send(text)
  }

}
