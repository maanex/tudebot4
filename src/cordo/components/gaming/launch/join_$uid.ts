import { ReplyableComponentInteraction } from 'cordo'
import { TudeBot } from '../../../..'
import { Gaming } from '../../../../lib/gaming/gaming'


export default async function (i: ReplyableComponentInteraction) {
  const guild = await TudeBot.guilds.fetch(i.guild_id)
  if (!guild) return i.replyPrivately({ content: 'Something failed. Please try again. (1)' })

  const member = await guild.members.fetch(i.user.id)
  if (!member) return i.replyPrivately({ content: 'Something failed. Please try again. (2)' })

  const instance = Gaming.runningGames.get(i.params.uid)
  if (!instance) return i.replyPrivately({ content: 'This game is no longer running.' })

  if (member.id === instance.host.id)
    return i.replyPrivately({ content: '**You are already in!** Any you can\'t leave, if that\'s what you\'re trying to do.' })

  const alreadyIn = instance.players.some(p => p.id === member.id)
  if (alreadyIn)
    instance.players.splice(instance.players.findIndex(p => p.id === member.id), 1)
  else
    instance.players.push(member)

  i.state('gaming_launch', instance, 2)

  // if (alreadyIn)
  //   i.replyPrivately({ content: 'You left the game.' })
  // else
  //   i.replyPrivately({ content: 'You joined the game.' })
}
