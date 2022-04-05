import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, MessageComponent } from 'cordo'
import { Guild } from 'discord.js'
import { Reply } from '../../../modules/quickreplies'


export type QuickRepliesMainPageData = {
  guild: Guild
  pageIndex: number
  pageCount: number
  replies: Reply[]
}

export default function (_i: GenericInteraction, [ pageData ]: [ QuickRepliesMainPageData ]): InteractionApplicationCommandCallbackData {
  if (!pageData) {
    return {
      description: 'Failed to load data, please try again.'
    }
  }

  const { guild, pageIndex, pageCount, replies } = pageData
  return {
    embeds: [ {
      title: `Quick replies for ${guild.name}`,
      description: replies.length ? '' : '*Nothing*',
      fields: replies.map(r => ({
        name: r.trigger.join(', ').substring(0, 25),
        value: r.response,
        inline: false
      })),
      color: 0x5865F2
    } ],
    components: [
      ...replies.map(r => ({
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        label: r.trigger[0],
        custom_id: `quickreplies_edit_${r.id}_${pageIndex}`,
        emoji: { name: '✏️' }
      }) as MessageComponent),
      ...(
        replies.length
          ? [ { type: ComponentType.LINE_BREAK } as MessageComponent ]
          : []
      ),
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        label: 'New Quick Reply',
        custom_id: 'quickreplies_new'
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: '<',
        custom_id: `quickreplies_page_${pageIndex - 1}`,
        disabled: pageIndex <= 0
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: `${pageIndex + 1} / ${pageCount}`,
        custom_id: 'noop',
        disabled: true
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: '>',
        custom_id: `quickreplies_page_${pageIndex + 1}`,
        disabled: pageIndex >= pageCount - 1
      }
    ]
  }
}
