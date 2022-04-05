import { ComponentType, InteractionComponentFlag, ReplyableComponentInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import { TudeBot } from '../../..'
import QuickRepliesModule from '../../../modules/quickreplies'


export default async function (i: ReplyableComponentInteraction) {
  const module = TudeBot.getModule<QuickRepliesModule>('quickreplies')
  const data = await module.getPageDataForGuildId(i.guild_id, -1)

  const found = data.replies.find(r => r.id === i.params.id)

  if (!found) {
    i.edit({
      title: `${i.params.id} not found`
    })
    return
  }

  i.openModal({
    custom_id: CordoAPI.compileCustomId(`quickreplies_submit_change_${found.id}_${i.params.page}`, [ InteractionComponentFlag.ACCESS_EVERYONE ]),
    title: `Edit ${found.trigger[0]}`,
    components: [
      {
        type: ComponentType.TEXT,
        custom_id: 'triggers',
        style: TextInputStyle.PARAGRAPH,
        label: 'Triggers, Comma Separated',
        value: found.trigger.join(', '),
        required: true,
        min_length: 3,
        max_length: 600
      },
      {
        type: ComponentType.TEXT,
        custom_id: 'response',
        style: TextInputStyle.PARAGRAPH,
        label: 'Response, Leave Empty To Delete',
        value: found.response,
        required: false,
        max_length: 2000
      }
    ]
  })
}
