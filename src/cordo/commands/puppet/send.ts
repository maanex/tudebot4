import { ComponentType, InteractionComponentFlag, ReplyableCommandInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import PermissionStrings from 'cordo/dist/lib/permission-strings'

export default function (i: ReplyableCommandInteraction) {
  if (!PermissionStrings.containsManageMessages(i.member?.permissions ?? '0'))
    return i.replyPrivately({ content: 'This command is not for you!' })

  i.openModal({
    custom_id: CordoAPI.compileCustomId('puppet_submit_new', [ InteractionComponentFlag.ACCESS_EVERYONE ]),
    title: 'New Message',
    components: [
      {
        type: ComponentType.TEXT,
        custom_id: 'content',
        style: TextInputStyle.PARAGRAPH,
        label: 'Message Content',
        required: false
      },
      {
        type: ComponentType.TEXT,
        custom_id: 'title',
        style: TextInputStyle.SHORT,
        label: 'Embed Title',
        required: false,
        max_length: 100
      },
      {
        type: ComponentType.TEXT,
        custom_id: 'description',
        style: TextInputStyle.PARAGRAPH,
        label: 'Embed Description',
        required: false
      },
      {
        type: ComponentType.TEXT,
        custom_id: 'component_template',
        style: TextInputStyle.SHORT,
        label: 'Component Template',
        required: false
      }
    ]
  })
}
