import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class UnavailableCommand extends Command {

  constructor() {
    super({
      name: '_unavailable',
      description: 'Default command for when a command is unavailable.',
      hideOnHelp: true
    })
  }

  public execute(_channel: TextChannel, _user: User, _args: string[], _event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('This command has been disabled.', 'bad')
    return true
  }

}
