import { InteractionComponentFlag } from 'cordo'
import { ComponentType } from 'discord-api-types'
import { Message, TextChannel } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'


export default class AutoSupportModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Support Management', 'ℹ️', 'Helps your support team manage your users', 'Bla bla', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('message', mes => this.onMessage(mes))
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  //

  private async onMessage(mes: Message) {
    if (!this.isMessageEventValid(mes)) return

    const conf = this.guildData(mes.guild)?.channels?.[mes.channelId]
    if (!conf) return
    if (mes.channel.type !== 'GUILD_TEXT') return

    const channel = mes.channel as TextChannel

    const thread = await channel.threads.create({
      name: mes.author.username,
      startMessage: mes,
      autoArchiveDuration: 'MAX',
      rateLimitPerUser: 0
    })

    const firstMsg = thread.send(`Hey ${mes.author.toString()} :wave:\nI have created this new thread just for your question, please keep any follow up messages in here.`)

    const solution = await this.findSolution(mes.content)
    console.log(solution)
    if (!solution) {
      thread.send('Our support team has been notified, we will get back to you as soon as possible 😊')
      return
    }

    await firstMsg

    await thread.send({
      content: 'While you wait for our support team, I have found this here:',
      embeds: [
        {
          title: solution[0],
          description: solution[1]
        }
      ]
    })

    thread.send({
      content: 'Did this answer your question?',
      components: [
        {
          type: 'ACTION_ROW',
          components: [
            {
              type: 'BUTTON',
              style: 'SUCCESS',
              customId: `::support_autosolution_${mes.author.id}_good:${InteractionComponentFlag.ACCESS_EVERYONE}`,
              label: 'Yes, that helped.'
            },
            {
              type: 'BUTTON',
              style: 'DANGER',
              customId: `::support_autosolution_${mes.author.id}_bad:${InteractionComponentFlag.ACCESS_EVERYONE}`,
              label: 'No, that did not help.'
            }
          ]
        }
      ]
    })
  }

  //

  private async findSolution(problem: string): Promise<null | [string, string]> {
    if (Math.random() < 0.5) return null
    return [ 'Test', 'very test much test here is the solution xoxo' ]
  }

}
