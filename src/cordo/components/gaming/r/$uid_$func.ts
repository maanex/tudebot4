import { ReplyableComponentInteraction } from 'cordo'
import { Gaming } from '../../../../lib/gaming/gaming'


export default function (i: ReplyableComponentInteraction) {
  const instance = Gaming.runningGames.get(i.params.uid)
  if (!instance) return i.replyPrivately({ content: 'This game is no longer running.' })

  const game = Gaming.getGameById(instance.game)
  if (!game) return i.replyPrivately({ content: 'Game not found. Sus.' })

  const f = (game as any)[i.params.func]
  if (f) f.call(game, instance, i)
  else i.replyPrivately({ content: 'Something is sus. Error.' })
}
