import { ComponentType, InteractionTypeModalSubmit, MessageComponent, ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import { TudeBot } from '../../..'
import QuickRepliesModule from '../../../modules/quickreplies'
import { QuickRepliesMainPageData } from '../../states/quickreplies/main'


function polyfillGetSubmission(name: string, components: MessageComponent[]): string {
  for (const comp of components) {
    if ((comp as any).type === ComponentType.ROW) {
      const res = polyfillGetSubmission(name, (comp as any).components)
      if (res) return res
    }
    if ((comp as any).custom_id === name)
      return (comp as any).value
  }
  return undefined
}

export default async function (i: ReplyableComponentInteraction) {
  if (!PermissionStrings.containsManageMessages(i.member?.permissions ?? '0')
    && !PermissionStrings.containsManageServer(i.member?.permissions ?? '0'))
    return i.ack()

  const triggers = polyfillGetSubmission('triggers', (<unknown> i as InteractionTypeModalSubmit).data.components)
  const response = polyfillGetSubmission('response', (<unknown> i as InteractionTypeModalSubmit).data.components)

  const module = TudeBot.getModule<QuickRepliesModule>('quickreplies')
  await module.addReply(i.guild_id, triggers.split(', ').map(t => t.trim()), response)
  const data = await module.getPageDataForGuildId(i.guild_id, -1)

  const page = data.pageCount - 1
  const passData: QuickRepliesMainPageData = {
    guild: data.guild,
    pageIndex: page,
    pageCount: data.pageCount,
    replies: module.getRepliesSubset(data.replies, page)
  }

  i.state('quickreplies_main', passData)
}
