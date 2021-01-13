import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class WubbaLubbaDubDubCommand extends Command {

  constructor() {
    super({
      name: 'wubbalubbadubdub',
      description: 'JEEZ RICK',
      groups: [ 'fun', 'club', 'easteregg' ],
      hideOnHelp: true
    })
  }

  public async execute(channel: TextChannel, _user: User, _args: string[], event: CommandExecEvent, _repl: ReplyFunction): Promise<boolean> {
    const role = await channel.guild.roles.fetch('496377983494258689')
    if (!role) return false

    if (event.message.member.roles.resolve(role.id)) event.message.member.roles.remove(role)
    else event.message.member.roles.add(role)
    return true
  }

}
