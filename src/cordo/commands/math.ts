import axios from 'axios'
import { ButtonStyle, ComponentType, InteractionApplicationCommandCallbackData, InteractionComponentFlag, ReplyableCommandInteraction } from 'cordo'


export default function (i: ReplyableCommandInteraction) {
  const term = i.data.option.term as string

  i
    .replyInteractive({
      content: term,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          label: 'Query Wolfram Alpha',
          custom_id: 'query_wolfram_alpha'
        }
      ]
    })
    .withTimeout(
      5 * 60 * 1000,
      j => j.disableComponents(),
      { onInteraction: 'removeTimeout' }
    )
    .on('query_wolfram_alpha', (h) => {
      h.ack()
    })
}
