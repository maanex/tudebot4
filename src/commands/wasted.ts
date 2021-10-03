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
      const imgBuffer = await TudeBot.obrazium.getWasted(user.displayAvatarURL().replace('webp', 'png'))
      const file = new MessageAttachment(imgBuffer, 'wasted.png')
      const embed = new MessageEmbed()
        .setColor(0x2F3136)
        .setFooter(`@${user.tag} • obrazium.com`)
        .setImage('attachment://wasted.png')

      channel.send({
        embeds: [ embed ],
        files: [ file ]
      })
      return true
    } catch (ex) {
      return false
    }
  }

}
