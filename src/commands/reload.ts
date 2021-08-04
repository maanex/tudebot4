import { User, TextChannel } from 'discord.js'
import { TudeBot } from '../index'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class ReloadCommand extends Command {

  constructor() {
    super({
      name: 'reload',
      description: 'Reload',
      sudoOnly: true,
      groups: [ 'internal' ]
    })
  }

  public execute(_channel: TextChannel, _user: User, _args: string[], event: CommandExecEvent, _repl: ReplyFunction): boolean {
    TudeBot.reload().then(() => event.message.react('✅')).catch()
    return true
  }

}
