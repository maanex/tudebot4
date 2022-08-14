import { ReplyableComponentInteraction } from 'cordo'
import { TudeBot } from '../../../..'
import { Gaming } from '../../../../lib/gaming/gaming'


export default async function (i: ReplyableComponentInteraction) {
  const guild = await TudeBot.guilds.fetch(i.guild_id)
  if (!guild) return i.replyPrivately({ content: 'Something failed. Please try again. (1)' })

  const host = await guild.members.fetch(i.user.id)
  if (!host) return i.replyPrivately({ content: 'Something failed. Please try again. (2)' })

  const instance = Gaming.launchGame(i.params.name, host)
  if (!instance) return i.replyPrivately({ content: 'Something failed. Please try again. (3)' })


  i.state('gaming_launch', instance, 0)
}
