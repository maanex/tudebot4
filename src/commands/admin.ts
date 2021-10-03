import { Message, User, TextChannel, MessageAttachment } from 'discord.js'
import { TudeBot } from '../index'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import MemesModule from '../modules/memes'
import Emojis from '../int/emojis'


export default class AdminCommand extends Command {

  constructor() {
    super({
      name: 'admin',
      description: 'Admin',
      groups: [ 'internal' ],
      sudoOnly: true
    })
  }

  public execute(orgChannel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (user.id !== '137258778092503042') return false

    try {
      if (args.length === 0) {
        repl('admin <cmd>', 'bad', ([
          'setupchannelgames <channel>',
          'itemlist',
          'setupitemshop <channel>',
          'resetdaily <user> [-c --clearstreak]',
          'testmodlog',
          'testlevelupreward',
          'print'
        ]).map(cmd => `• ${cmd}`).join('\n'))
        return false
      }

      switch (args[0]) {
        case 'setupemptychannel':
          (async () => {
            const channel = orgChannel.guild.channels.resolve(args[1]) as TextChannel
            for (let i = 0; i < 20; i++)
              await channel.send(Emojis.bigSpace.string)
            repl('Success!', 'success')
          })()
          break

        case 'testmodlog':
          TudeBot.modlog(orgChannel.guild, 'message', args.slice(1).join(' '))
          break

        case 'manualmemeofthemonth':
          TudeBot.getModule<MemesModule>('memes').electMemeOfTheMonth()
          break

        case 'testresponse':
          repl('You got 10s - send me something nice!')
          event.awaitUserResponse(user, orgChannel, 1000 * 10, (mes: Message) => {
            if (!mes) orgChannel.send('Timed out!')
            else orgChannel.send(`You sent: \`${mes.content}\``)
          })
          break

        case 'print': {
          const data = TudeBot.guildSettings.get(orgChannel.guild.id) as Object
          const file = new MessageAttachment(Buffer.from(JSON.stringify(data, null, 2)), `guild-settings-${orgChannel.guild.id}.json`)
          orgChannel.send({ files: [ file ] })
          break
        }
      }
      return true
    } catch (ex) {
      repl('Error:', 'bad', '```' + ex + '```')
      console.error(ex)
      return false
    }
  }

}
