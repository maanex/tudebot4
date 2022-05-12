import { ReplyableComponentInteraction } from 'cordo'


export default async function (i: ReplyableComponentInteraction) {
  const id = i.params.id

  i.ack()

  i.replyPrivately({
    content: 'Successfully subscribed to this reminder!'
  })
}
