import { ComponentType, InteractionComponentFlag, ReplyableComponentInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'


export default function (i: ReplyableComponentInteraction) {
  i.openModal({
    custom_id: CordoAPI.compileCustomId('test_callback', [ InteractionComponentFlag.ACCESS_EVERYONE ]),
    title: 'Zitat Einreichen',
    components: [
      {
        type: ComponentType.TEXT,
        custom_id: 'test_poggers',
        style: TextInputStyle.SHORT,
        label: 'Gaming'
      }
    ]
  })
}
