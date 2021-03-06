import { User, TextChannel, MessageAttachment, MessageEmbed } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import { TudeBot } from '../index'


export default class WastedCommand extends Command {

  constructor() {
    super({
      name: 'wasted',
      description: 'F in the chat',
      groups: [ 'fun', 'images' ]
    })
  }

  public async execute(channel: TextChannel, user: User, _args: string[], event: CommandExecEvent, _repl: ReplyFunction): Promise<boolean> {
    if (event.message.mentions.members.size)
      user = event.message.mentions.members.first().user
    try {
      const imgBuffer = await TudeBot.obrazium.getWasted(user.displayAvatarURL())
      const file = new MessageAttachment(imgBuffer, 'wasted.png') // FIXME
      const embed = new MessageEmbed()
        .attachFiles([ file ])
        .setColor(0x2F3136)
        .setFooter(`@${user.tag} • api.badosz.com`)
        .setImage('attachment://wasted.png')
      channel.send('', { embed })
      return true
    } catch (ex) {
      return false
    }
  }

}
