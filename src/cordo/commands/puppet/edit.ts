import { ComponentType, InteractionComponentFlag, ReplyableCommandInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import { TextChannel } from 'discord.js'
import { TudeBot } from '../../..'

export default async function (i: ReplyableCommandInteraction) {
  if (!PermissionStrings.containsManageMessages(i.member?.permissions ?? '0'))
    return i.replyPrivately({ content: 'This command is not for you!' })

  const id = i.data.option.message_id as string
  const channel = await TudeBot.channels.fetch(i.channel_id) as TextChannel
  const message = await channel.messages.fetch(id)
  if (!message) {
    i.replyPrivately({ content: 'Message not found!' })
    return
  }

  const content = message.content
  const title = message.embeds?.[0]?.title
  const description = message.embeds?.[0]?.description

  i.openModal({
    custom_id: CordoAPI.compileCustomId('puppet_submit_' + id, [ InteractionComponentFlag.ACCESS_EVERYONE ]),
    title: 'New Message',
    components: [
      {
        type: ComponentType.TEXT,
        custom_id: 'content',
        style: TextInputStyle.PARAGRAPH,
        label: 'Message Content',
        value: content,
        required: false
      },
      {
        type: ComponentType.TEXT,
        custom_id: 'title',
        style: TextInputStyle.SHORT,
        label: 'Embed Title',
        value: title,
        required: false,
        max_length: 100
      },
      {
        type: ComponentType.TEXT,
        custom_id: 'description',
        style: TextInputStyle.PARAGRAPH,
        label: 'Embed Description',
        value: description,
        required: false
      },
      {
        type: ComponentType.TEXT,
        custom_id: 'component_template',
        style: TextInputStyle.SHORT,
        label: 'Component Template',
        required: false
      }
    ]
  })
}
