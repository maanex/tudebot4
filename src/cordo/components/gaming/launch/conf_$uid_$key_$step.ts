import { ReplyableComponentInteraction } from 'cordo'
import { Gaming } from '../../../../lib/gaming/gaming'


export default function (i: ReplyableComponentInteraction) {
  const instance = Gaming.runningGames.get(i.params.uid)
  if (!instance)
    return i.replyPrivately({ content: 'Something failed. Please try again.' })

  instance.config[i.params.key] = i.data.values[0]

  i.state('gaming_launch', instance, Number(i.params.step))
}
