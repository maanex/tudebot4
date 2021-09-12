import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class SupportCommand extends Command {

  constructor() {
    super({
      name: 'support',
      description: 'For the support team to quickly show relevant resources.',
      aliases: [ 'supp', 'sup' ],
      groups: [ 'info' ],
      hideOnHelp: true
    })
  }

  public execute(_channel: TextChannel, _user: User, _args: string[], _event: CommandExecEvent, _repl: ReplyFunction): boolean {
    return true
  }

}
