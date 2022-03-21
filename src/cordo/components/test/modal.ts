import { ComponentType, ReplyableComponentInteraction, TextInputStyle } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  i.openModal({
    custom_id: 'testmodal',
    title: 'Zitat Einreichen',
    components: [
      {
        type: ComponentType.TEXT,
        custom_id: 'poggers',
        style: TextInputStyle.SHORT,
        label: 'Gaming'
      }
    ]
  })
}
