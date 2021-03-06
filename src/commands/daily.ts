import { User, TextChannel } from 'discord.js'
import TudeApi from '../thirdparty/tudeapi/tudeapi'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import Emojis from '../int/emojis'


export default class DailyCommand extends Command {

  constructor() {
    super({
      name: 'daily',
      aliases: [ 'd' ],
      description: 'Get your daily reward',
      groups: [ 'club' ]
    })
  }

  public execute(channel: TextChannel, user: User, _args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve) => {
      TudeApi.clubUserByDiscordId(user.id, user)
        .then((u) => {
          if (!u || u.error) {
            repl('Oopsie!', 'bad', 'Please try that again, thank you')
            resolve(false)
            return
          }

          TudeApi.performClubUserAction(u, { id: 'claim_daily_reward' }).then((o) => {
            let desc = ''

            const reward = o.reward
            if (reward.points) desc += `**+${reward.points}** point${reward.points === 1 ? '' : 's'} *${Emojis.POINTS}*\n`
            if (reward.cookies) desc += `**+${reward.cookies}** cookie${reward.cookies === 1 ? '' : 's'} *${Emojis.COOKIES}*\n`
            if (reward.gems) desc += `**+${reward.gems}** gem${reward.gems === 1 ? '' : 's'} *${Emojis.GEMS}*\n`

            const streak = o.streak
            if (streak) {
              let prefix = ''
              let suffix = ''
              const bold = streak > 3

              if (streak >= 7) suffix = '🔥'
              if (streak >= 14) prefix = '🔥'
              if (streak >= 30) {
                prefix = '🔥🔥'
                suffix = '🔥🔥'
              }
              if (streak >= 60) {
                prefix = '(╯°□°)╯'
                suffix = '~(⊙＿⊙\')~'
              }
              if (streak === 69) {
                prefix = ''
                suffix = '- nice'
              }
              if (streak >= 90) {
                prefix = '🐢'
                suffix = '🐢'
              }
              if (streak >= 365) {
                prefix = '<:menacing:814892820984365157>'
                suffix = '<:menacing:814892820984365157>'
              }

              desc += `\n${prefix} ${bold ? '**' : ''}Streak: ${streak} ${streak === 1 ? 'day' : 'days'}${bold ? '**' : ''} ${suffix}`
            }

            channel.send({
              embed: {
                color: 0x2F3136,
                title: `${event.message.member.displayName}'s daily reward:`,
                description: desc
              }
            })
            resolve(true)
          }).catch((o) => {
            repl(o.message || 'An error occured!')
            resolve(false)
          })
        })
        .catch((err) => {
          repl('An error occured!', 'bad')
          console.error(err)
          resolve(false)
        })
    })
  }

}
