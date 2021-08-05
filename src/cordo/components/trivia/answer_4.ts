import { ReplyableComponentInteraction, MessageComponentButton, ButtonStyle } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  i.edit({
    components: (i.message.components[0].components as MessageComponentButton[])
      .map(c => ({
        ...c,
        disabled: true,
        style:
          (c as any).custom_id?.endsWith('1')
            ? ButtonStyle.SUCCESS
            : (c as any).custom_id?.endsWith('4')
                ? ButtonStyle.DANGER
                : ButtonStyle.SECONDARY
      })) as any
  })
}
