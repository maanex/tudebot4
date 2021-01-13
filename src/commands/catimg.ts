import axios from 'axios'
import { User, TextChannel } from 'discord.js'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class CatCommand extends Command {

  constructor() {
    super({
      name: 'cat',
      aliases: [ 'kitten', 'catimage', 'catimg', 'pussy' ],
      description: 'A random cat image',
      groups: [ 'fun', 'images', 'apiwrapper' ]
    })
  }

  public async execute(channel: TextChannel, user: User, _args: string[], _event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    try {
      const { data: o } = await axios.get('https://api.thecatapi.com/v1/images/search?format=json')
      channel.send({
        embed: {
          color: 0x2F3136,
          image: {
            url: o[0].url
          },
          footer: {
            text: user.username,
            icon_url: user.avatarURL()
          }
        }
      })
      return true
    } catch (e) {
      repl('An error occured!', 'bad')
      return false
    }
  }

}
