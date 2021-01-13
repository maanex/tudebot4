import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class SourcecodeCommand extends Command {

  constructor() {
    super({
      name: 'sourcecode',
      description: "A link to the Bot's source code.",
      groups: [ 'info' ]
    })
  }

  public execute(_channel: TextChannel, _user: User, _args: string[], _event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('The TudeBot is open source:', 'message', 'https://github.com/Maanex/tudebot4')
    return true
  }

}
