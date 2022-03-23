import { ComponentType, InteractionTypeModalSubmit, MessageComponent, ReplyableComponentInteraction } from 'cordo'
import { TextChannel } from 'discord.js'
import { TudeBot } from '../../../..'


function polyfillGetSubmission(name: string, components: MessageComponent[]): string {
  for (const comp of components) {
    if ((comp as any).type === ComponentType.ROW) {
      const res = polyfillGetSubmission(name, (comp as any).components)
      if (res) return res
    }
    if ((comp as any).custom_id === name)
      return (comp as any).value
  }
  return undefined
}

export default async function (i: ReplyableComponentInteraction) {
  const content = polyfillGetSubmission('content', (<unknown> i as InteractionTypeModalSubmit).data.components)
  const title = polyfillGetSubmission('title', (<unknown> i as InteractionTypeModalSubmit).data.components)
  const description = polyfillGetSubmission('description', (<unknown> i as InteractionTypeModalSubmit).data.components)

  if (!content && !title && !description)
    return i.replyPrivately({ content: 'You need to send *something*...' })

  i.ack()

  const embeds = (title || description)
    ? [ { title, description, color: 0x2F3136 } ]
    : []

  const channel = await TudeBot.channels.fetch(i.channel_id) as TextChannel
  channel.send({
    content,
    embeds
  })
}
