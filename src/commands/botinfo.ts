import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class BotInfoCommand extends Command {

  constructor() {
    super({
      name: 'botinfo',
      aliases: [ 'test1234' ],
      description: 'Bot info',
      cooldown: 0,
      groups: [ ],
      sudoOnly: true
    })
  }

  public execute(_channel: TextChannel, _user: User, _args: string[], _event: CommandExecEvent, _repl: ReplyFunction): boolean {
    return true
  }

}
