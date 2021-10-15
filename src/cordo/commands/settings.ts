import { ReplyableCommandInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export default function (i: ReplyableCommandInteraction) {
  if (!PermissionStrings.containsAdmin(i.member?.permissions ?? '0'))
    return i.replyPrivately({ content: 'Only server admins can run this command.' })

  i.state('settings_main')
}

