/* eslint-disable no-unused-vars */
/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { User, TextChannel } from 'discord.js'
import { TudeBot } from '..'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class EvalCommand extends Command {

  constructor() {
    super({
      name: 'eval',
      description: 'Eval',
      sudoOnly: true,
      groups: [ 'internal' ]
    })
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (user.id !== '137258778092503042') return false

    try {
      const reply = repl
      const guild = channel.guild
      const message = event.message
      const mes = event.message
      const msg = event.message
      const member = message.member
      const bot = TudeBot.user
      const self = TudeBot.user
      const core = TudeBot.user

      channel.send(`\`\`\`${eval(args.join(' '))}\`\`\``)
      return true
    } catch (ex) {
      repl('Error:', 'message', '```' + ex + '```')
      return false
    }
  }

}
