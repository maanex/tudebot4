import { InteractionComponentFlag } from 'cordo'
import { ButtonStyle, ComponentType, Events, Message, TextChannel, ThreadAutoArchiveDuration } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'


export default class AutoSupportModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('Support Management', 'ℹ️', 'Helps your support team manage your users', 'Bla bla', 'public', conf, data, guilds)
  }

  public onEnable() {
    TudeBot.on(Events.MessageCreate, mes => this.onMessage(mes))
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
    if (!mes.channel.isTextBased()) return

    const channel = mes.channel as TextChannel

    const thread = await channel.threads.create({
      name: mes.author.username,
      startMessage: mes,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
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
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Success,
              customId: `::support_autosolution_${mes.author.id}_good:${InteractionComponentFlag.ACCESS_EVERYONE}`,
              label: 'Yes, that helped.'
            },
            {
              type: ComponentType.Button,
              style: ButtonStyle.Danger,
              customId: `::support_autosolution_${mes.author.id}_bad:${InteractionComponentFlag.ACCESS_EVERYONE}`,
              label: 'No, that did not help.'
            }
          ]
        }
      ]
    })
  }

  //

  // eslint-disable-next-line require-await, @typescript-eslint/no-unused-vars
  private async findSolution(problem: string): Promise<null | [string, string]> {
    if (Math.random() < 0.5) return null
    return [ 'Test', 'very test much test here is the solution xoxo' ]
  }

}
