import { ReplyableCommandInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import { TudeBot } from '../..'
import QuickRepliesModule from '../../modules/quickreplies'


export default async function (i: ReplyableCommandInteraction) {
  const permissions = PermissionStrings.containsManageMessages(i.member.permissions)
    || PermissionStrings.containsManageServer(i.member.permissions)

  if (!i.member || !permissions)
    return i.replyPrivately({ title: 'No, this command is not for you!' })

  const module = TudeBot.getModule<QuickRepliesModule>('quickreplies')
  const data = await module.getPageDataForGuildId(i.guild_id, 0)

  i.state('quickreplies_main', data)
}
