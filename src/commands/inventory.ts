import { User, TextChannel } from 'discord.js'
import { Item } from 'thirdparty/tudeapi/item'
import TudeApi from '../thirdparty/tudeapi/tudeapi'
import ParseArgs from '../util/parse-args'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'

const AsciiTable = require('ascii-table')


export default class InventoryCommand extends Command {

  constructor() {
    super({
      name: 'inventory',
      aliases: [ 'inv', 'items', 'i' ],
      description: 'See your inventory (or someone elses)',
      groups: [ 'club' ]
    })
  }

  public execute(channel: TextChannel, orgUser: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve) => {
      const cmdl = ParseArgs.parse(args)
      let user = orgUser
      if (event.message.mentions.users.size)
        user = event.message.mentions.users.first()
      else if (event.label === 'i' && args.length) return
      TudeApi.clubUserByDiscordId(user.id, user)
        .then((u) => {
          if (!u || u.error) {
            repl('User not found!', 'message', 'Or internal error, idk')
            resolve(false)
            return
          }

          if (!u.inventory || !u.inventory.size) {
            const wow = Math.random() < 0.1
            channel.send({
              embed: {
                author: {
                  name: `${user.username}'s inventory:`,
                  icon_url: user.avatarURL()
                },
                color: 0x2F3136,
                description: wow ? 'Wow, such empty' : '... *Empty*',
                image: wow ? { url: 'https://cdn.discordapp.com/attachments/655354019631333397/666720051784581155/unknown.png' } : undefined,
                footer: wow ? { text: 'This inventory is empty' } : undefined
              }
            })
            resolve(false)
            return
          }

          const fields: { [cat: string]: Item[] } = {}

          for (const i of u.inventory.values()) {
            if (fields[i.prefab.category.id]) fields[i.prefab.category.id].push(i)
            else fields[i.prefab.category.id] = [ i ]
          }

          if (cmdl.t || cmdl.table) {
            const table = new AsciiTable()
            table.setHeading('type', 'amount', 'category', 'type', 'id')
            let from = 1 // start counting with 1 here, I know it's unconventional but whatever it needs(!) to be done
            let to = 10
            if (cmdl.p || cmdl.page) {
              from = parseInt(cmdl.p === undefined ? (cmdl.page as string) : (cmdl.p as string)) * 10 - 9
              to = from + 9
            }
            let c = 0
            for (const i of u.inventory.values()) {
              if (++c >= from && c <= to)
                table.addRow(i.prefab.id, i.amount, i.prefab.category.id, i.prefab.group.id, i.id)
            }
            channel.send('```\n' + table.toString() + `\nShowing ${from} - ${to} out of ${u.inventory.size}` + '```')
          } else {
            channel.send({
              embed: {
                author: {
                  name: `${user.username}'s inventory:`,
                  icon_url: user.avatarURL()
                },
                color: 0x2F3136,
                fields: Object.values(fields).map((v) => {
                  return {
                    name: v[0].prefab.category.namepl || 'Other',
                    value: v.map(i => `${i.prefab.icon} **${i.prefab.expanded ? ' ' : i.amount + 'x '}**${i.name} *\`${i.id}\`*`).join('\n')
                  }
                })
              }
            })
          }
          resolve(true)
        })
        .catch((err) => {
          repl('An error occured!', 'bad')
          console.error(err)
          resolve(false)
        })
    })
  }

}
