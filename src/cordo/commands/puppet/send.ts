import { ComponentType, InteractionCommandType, InteractionComponentFlag, ReplyableCommandInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'

export default function (i: ReplyableCommandInteraction) {
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
      }
    ]
  })
}
