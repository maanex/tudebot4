import { ComponentType, InteractionComponentFlag, ReplyableComponentInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'


export default function (i: ReplyableComponentInteraction) {
  i.openModal({
    custom_id: CordoAPI.compileCustomId('quickreplies_submit_new', [ InteractionComponentFlag.ACCESS_EVERYONE ]),
    title: 'New Quick Reply',
    components: [
      {
        type: ComponentType.TEXT,
        custom_id: 'triggers',
        style: TextInputStyle.PARAGRAPH,
        label: 'Triggers, Comma Separated',
        placeholder: 'tude, bot, tudebot',
        required: true,
        min_length: 3,
        max_length: 600
      },
      {
        type: ComponentType.TEXT,
        custom_id: 'response',
        style: TextInputStyle.PARAGRAPH,
        label: 'Response',
        placeholder: 'The best bot you have ever seen.',
        required: true,
        max_length: 2000
      }
    ]
  })
}
