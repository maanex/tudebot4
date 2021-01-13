/* eslint-disable no-unused-vars */
/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { User, TextChannel } from 'discord.js'
import TudeApi from '../thirdparty/tudeapi/tudeapi'
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

  public execute(_channel: TextChannel, user: User, args: string[], _event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (user.id !== '137258778092503042') return false

    try {
      const tapi = TudeApi
      TudeApi.clubUserByDiscordId(user.id).then((self) => {
        repl(eval(args.join(' ')))
      }).catch((ex) => {
        repl(eval(args.join(' ')))
      })
      return true
    } catch (ex) {
      repl('Error:', 'message', '```' + ex + '```')
      return false
    }
  }

}
