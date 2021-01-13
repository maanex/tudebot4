import axios from 'axios'
import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class InspirationCommand extends Command {

  constructor() {
    super({
      name: 'inspiration',
      aliases: [ 'inspirational', 'inspirobot', 'randomquote', 'thinkaboutit' ],
      description: 'Random quote from inspirobot.me',
      groups: [ 'fun', 'apiwrapper' ]
    })
  }

  public async execute(channel: TextChannel, user: User, _args: string[], _event: CommandExecEvent, _repl: ReplyFunction): Promise<boolean> {
    try {
      const { data: o } = await axios.get('http://inspirobot.me/api?generate=true')
      channel.send({
        embed: {
          color: 0x2F3136,
          image: {
            url: o
          },
          footer: {
            text: `${user.username} • inspirobot.me`,
            icon_url: user.avatarURL()
          }
        }
      })
      return true
    } catch (e) {
      return false
    }
  }

}
