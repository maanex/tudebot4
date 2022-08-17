import { ReplyableComponentInteraction } from 'cordo'
import { GameInstance, Gaming } from '../../../../lib/gaming/gaming'
import { UserData } from '../../../../lib/users/user-data'


export default function (i: ReplyableComponentInteraction) {
  const instance = Gaming.runningGames.get(i.params.uid)
  if (!instance)
    return i.replyPrivately({ content: 'Something failed. Please try again.' })

  if (i.params.step === 'start')
    return startGame(instance, i)

  const step = Number(i.params.step)

  i.state('gaming_launch', instance, step)
}

function startGame(instance: GameInstance<any>, i: ReplyableComponentInteraction) {
  const game = Gaming.getGameById(instance.game)
  if (!game) return i.replyPrivately({ content: 'Something failed lmao' })

  for (const player of instance.players)
    new UserData(player.id).achievement('GAMING_PLAY_ONE').grant()

  game.startGame(instance, i)
}
