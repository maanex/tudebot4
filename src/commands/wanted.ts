import { User, TextChannel, MessageAttachment, MessageEmbed } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import { TudeBot } from '../index'


export default class WantedCommand extends Command {

  constructor() {
    super({
      name: 'wanted',
      description: 'I want you',
      groups: [ 'fun', 'images' ]
    })
  }

  public async execute(channel: TextChannel, user: User, _args: string[], event: CommandExecEvent, _repl: ReplyFunction): Promise<boolean> {
    if (event.message.mentions.members.size)
      user = event.message.mentions.members.first().user
    try {
      const imgBuffer = await TudeBot.obrazium.getWanted(user.avatarURL().replace('webp', 'png'))
      const file = new MessageAttachment(imgBuffer, 'wanted.png')
      const embed = new MessageEmbed()
        .attachFiles([ file ])
        .setColor(0x2F3136)
        .setFooter(`@${user.tag} • obrazium.com`)
        .setImage('attachment://wanted.png')
      channel.send('', { embed })
      return true
    } catch (ex) {
      return false
    }
  }


}
