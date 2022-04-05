import { ReplyableComponentInteraction } from 'cordo'
import { TudeBot } from '../../..'
import QuickRepliesModule from '../../../modules/quickreplies'


export default async function (i: ReplyableComponentInteraction) {
  const module = TudeBot.getModule<QuickRepliesModule>('quickreplies')
  const data = await module.getPageDataForGuildId(i.guild_id, parseInt(i.params.index, 10))

  i.state('quickreplies_main', data)
}
