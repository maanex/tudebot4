import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class OpenCommand extends Command {

  constructor() {
    super({
      name: 'open',
      aliases: [ 'o', 'unbox' ],
      description: 'Open a lootbox',
      groups: [ 'club' ]
    })
  }

  public execute(_channel: TextChannel, _user: User, _args: string[], _event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('This command is not yet available!', 'message', '~~We\'re~~ **I am** working on it')
    return true
  }

}
