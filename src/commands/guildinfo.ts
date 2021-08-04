import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import { TudeBot } from '../index'


export default class GuildInfoCommand extends Command {

  constructor() {
    super({
      name: 'guildinfo',
      description: 'Shows some guild info',
      groups: [ 'internal', 'info' ],
      hideOnHelp: true
    })
  }

  public execute(channel: TextChannel, _user: User, _args: string[], _event: CommandExecEvent, repl: ReplyFunction): boolean {
    const settings = TudeBot.guildSettings.get(channel.guild.id)
    if (!settings) {
      repl('No settings found for this guild!', 'bad')
      return
    }

    const moduleData = []
    TudeBot.modules.forEach((module, id) => {
      moduleData.push((settings.modules[id] ? '🗹 ' : '☐ ') + module.dispName)
    })

    channel.send({
      embed: {
        title: settings.name,
        color: 0x2F3136,
        fields: [
          {
            name: 'Managers:',
            value: Object.keys(settings.managers).join('\n'),
            inline: true
          },
          {
            name: 'Modules:',
            value: moduleData.join('\n')
          }
        ]
      }
    })

    return true
  }

}
