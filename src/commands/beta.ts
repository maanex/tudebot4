import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class BetaCommand extends Command {

  constructor() {
    super({
      name: 'beta',
      description: 'Join the TudeBot Beta program',
      groups: [ 'info' ]
    })
  }

  public execute(_channel: TextChannel, _user: User, _args: string[], _event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('Click here to join the TudeBot Beta program', 'message', 'https://discord.gg/UPXM3Yu/')
    return true
  }

}
