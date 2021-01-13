import { User, TextChannel } from 'discord.js'
import TudeApi from '../thirdparty/tudeapi/tudeapi'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class ItemCommand extends Command {

  constructor() {
    super({
      name: 'item',
      description: 'View an item in your inventory',
      groups: [ 'club' ]
    })
  }

  public async execute(channel: TextChannel, user: User, args: string[], _event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    if (!args[0]) {
      repl('What item are you looking for?', 'bad', 'Type `item <name>` and replace <name> with the item\'s name!')
      return false
    }

    const u = await TudeApi.clubUserByDiscordId(user.id, user)
    if (!u || u.error) {
      repl('An error occured!', 'error')
      return false
    }

    if (!u.inventory.has(args[0])) {
      repl(`You don't appear to have **${args[0]}** in your inventory!`, 'bad')
      return false
    }

    const item = u.inventory.get(args[0])

    channel.send({
      embed: {
        title: `${item.prefab.icon} ${item.prefab.expanded ? '' : `**${item.amount}x** `}${item.name}`,
        description: `\`${item.id}\`\n${item.description}`,
        fields: await item.renderMetadata(),
        color: 0x2F3136,
        footer: { text: `@${user.tag}` }
      }
    })
    return true
  }

}
