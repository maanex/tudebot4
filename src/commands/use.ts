import { User, TextChannel } from 'discord.js'
import TudeApi from '../thirdparty/tudeapi/tudeapi'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import { findItem } from '../content/itemlist'


export default class UseCommand extends Command {

  constructor() {
    super({
      name: 'use',
      aliases: [ 'u' ],
      description: 'Use an item in your inventory',
      groups: [ 'club' ]
    })
  }

  public async execute(_channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    if (!args[0]) {
      repl('What item do you want to use?', 'bad', 'Type `use <name>` and replace <name> with the item\'s name!')
      return false
    }
    // const cmdl = ParseArgs.parse(args)
    const u = await TudeApi.clubUserByDiscordId(user.id, user)

    if (!u || u.error) {
      repl('An error occured!', 'error')
      return false
    }

    if (!u.inventory.has(args[0])) {
      const item = findItem(args[0])
      if (item) {
        if (item.expanded && Array.from(u.inventory.keys()).includes(item.id))
          repl(`You have multiple ${TudeApi.clubLang['itempl_' + item.id]} in your inventory!`, 'bad', 'Please give me the exact id of the item you wanna use!')
        else
          repl(`You don't appear to have **${args[0]}** in your inventory!`, 'bad')

      } else {
        repl(`I don't know what a **"${args[0]}"** should be...`, 'bad')
      }
      return false
    }

    const item = u.inventory.get(args[0])

    if (item.prefab.useable) {
      item.use(event.message, repl, u)
      return true
    } else {
      repl('You cannot use this item!', 'bad')
      return false
    }
  }

}
