import { ComponentType, ReplyableComponentInteraction, TextInputStyle } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  i.replyPrivately({
    content: 'pogger'
  })
}
