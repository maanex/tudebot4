import { User, TextChannel, MessageAttachment, MessageEmbed } from 'discord.js'
import generateFunnyImage from '../functions/generate-funny-image'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class SupportCommand extends Command {

  constructor() {
    super({
      name: 'support',
      description: 'For the support team to quickly show relevant resources.',
      aliases: [ 'supp', 'sup' ],
      groups: [ 'info' ],
      hideOnHelp: true
    })
  }

  public execute(_channel: TextChannel, user: User, _args: string[], event: CommandExecEvent, _repl: ReplyFunction): boolean {
    generateFunnyImage(user.avatarURL({ format: 'png' }))
      .then((img) => {
        const file = new MessageAttachment(img, 'yooo.png')
        const embed = new MessageEmbed()
          .attachFiles([ file ])
          .setColor(0x2F3136)
          .setImage('attachment://yooo.png')
        event.message.channel.send(embed)
      })
      .catch((err) => {
        console.error(err)
      })
    return true
  }

}
