import { Message, User, TextChannel, MessageAttachment } from 'discord.js'
import { TudeBot } from '../index'
import Emojis from '../int/emojis'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import ParseArgs from '../util/parse-args'
import Database from '../database/database'
import { Items, findItem } from '../content/itemlist'
import GetPointsModule from '../modules/getpoints'
import MemesModule from '../modules/memes'
import TudeApi, { ClubUser } from '../thirdparty/tudeapi/tudeapi'


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

      let run: () => {}
      const cmdl = ParseArgs.parse(args)
      switch (args[0]) {
        case 'setupchannelgames':
          run = async () => {
            const channel = orgChannel.guild.channels.resolve(args[1]) as TextChannel
            await channel.send({ embed: { title: "I'm on top of the world!", url: 'https://www.youtube.com/watch?v=w5tWYmIOWGk' } })
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE)
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE)
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE)
            const lakeIds = []
            for (let i = 0; i < 11; i++)
              // @ts-ignore
              await channel.send('<the lake>').then(m => lakeIds.push(m.id))
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE)
            const mineIds = []
            for (let i = 0; i < 11; i++)
              // @ts-ignore
              await channel.send('<mineshaft>').then(m => mineIds.push(m.id))
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE)
            await channel.send({
              embed: {
                title: 'Available Games:',
                color: 0x00B0F4,
                description: `[The Lake](https://discordapp.com/channels/${orgChannel.guild.id}/${channel.id}/${lakeIds[0]})\n[Mineshaft](https://discordapp.com/channels/${orgChannel.guild.id}/${channel.id}/${mineIds[0]})\n`,
                footer: {
                  text: 'Click on a game\'s name to jump to it'
                }
              }
            })
            repl('Success!', 'success', `Lake:\n"${lakeIds.join('","')}"\n\nMine:\n"${mineIds.join('","')}"`)
          }; run()
          break

        case 'setupemptychannel':
          run = async () => {
            const channel = orgChannel.guild.channels.resolve(args[1]) as TextChannel
            for (let i = 0; i < 20; i++)
              await channel.send(Emojis.BIG_SPACE)
            repl('Success!', 'success')
          }; run()
          break

        case 'itemlist':
          repl('Items:', 'message', Object.values(Items).map(i => (`${i.icon} ${i.id}`)).join('\n'))
          break

        case 'resetdaily':
          if (args.length < 2) {
            repl('user?')
            return
          }

          run = async () => {
            const user = await (event.message.mentions.users.size
              ? TudeApi.userByDiscordId(event.message.mentions.users.first().id)
              : TudeApi.userById(args[1]))

            const clearStreak = cmdl.c || cmdl.clearstreak

            const update = clearStreak
              ? { $set: { 'daily.last': 0 } }
              : { $inc: { 'daily.last': -1 } }

            Database
              .get('tudeclub')
              .collection('users')
              .updateOne({ _id: user.id }, update)

            repl('Yes sir!')
          }; run()
          break

        case 'testmodlog':
          TudeBot.modlog(orgChannel.guild, 'message', args.slice(2).join(' '), args[1] as any)
          break

        case 'testlevelupreward':
          if (args.length < 2 || isNaN(parseInt(args[1]))) {
            repl('level?')
            return false
          }
          (TudeBot.modules.get('getpoints') as GetPointsModule).assignLevelRoles(event.message.member, { level: parseInt(args[1]) } as ClubUser)
          break

        case 'testperks':
          TudeApi.clubUserByDiscordId(user.id, user).then((u) => {
            TudeApi.performClubUserAction(u, { id: 'obtain_perks', perks: 'club.cookies:[100-200]' }).then(console.log).catch(console.error)
          })
          break

        case 'manualmemeofthemonth':
          TudeBot.getModule<MemesModule>('memes').electMemeOfTheMonth()
          break

        case 'grantbadge':
          if (args.length < 2) {
            repl('what badge? who?')
            return false
          }

          {
            const user = event.message.mentions.users.first() || event.message.author
            if (!user) return false
            const badge = TudeApi.badgeBySearchQuery(args[1])
            if (!badge) return false
            TudeApi.clubUserByDiscordId(user.id).then((u) => {
              u.badges[badge.id]++
              TudeApi.updateClubUser(u)
              repl('Okie dokie!')
            })
          }
          break

        case 'testresponse':
          repl('You got 10s - send me something nice!')
          event.awaitUserResponse(user, orgChannel, 1000 * 10, (mes: Message) => {
            if (!mes) orgChannel.send('Timed out!')
            else orgChannel.send(`You sent: \`${mes.content}\``)
          })
          break

        case 'giveitem': {
          if (args.length < 2) {
            repl('Which one?')
            return false
          }

          const item = findItem(args[1])
          if (!item) {
            repl('Not found!')
            return false
          }

          repl('ok u will now receive ' + item.id + '(x' + parseInt(args[2] || '1') + ')!')
          TudeApi.clubUserByDiscordId(user.id, user).then((u) => {
            u.addItem(item, parseInt(args[2] || '1'))
            TudeApi.updateClubUser(u)
          })
          return true
        }

        case 'print': {
          const data = TudeBot.guildSettings.get(orgChannel.guild.id) as Object
          const file = new MessageAttachment(Buffer.from(JSON.stringify(data, null, 2)), `guild-settings-${orgChannel.guild.id}.json`)
          orgChannel.send('', file)
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
