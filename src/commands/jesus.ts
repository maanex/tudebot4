import { User, TextChannel, MessageAttachment, MessageEmbed } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import { TudeBot } from '../index'


export default class JesusCommand extends Command {

  constructor() {
    super({
      name: 'jesus',
      aliases: [ 'holy', 'holy shit', 'amen', 'blessed' ],
      description: 'Our lord and saviour',
      groups: [ 'fun', 'images' ]
    })
  }

  public async execute(channel: TextChannel, user: User, _args: string[], _event: CommandExecEvent, _repl: ReplyFunction): Promise<boolean> {
    try {
      const imgBuffer = await TudeBot.obrazium.getJesus()
      const file = new MessageAttachment(imgBuffer, 'AMEN.png')
      const embed = new MessageEmbed()
        .attachFiles([ file ])
        .setColor(0x2F3136)
        .setFooter(`@${user.tag} • obrazium.com`)
        .setImage('attachment://AMEN.png')
      channel.send('', { embed })
      return true
    } catch (ex) {
      return false
    }
  }

}
