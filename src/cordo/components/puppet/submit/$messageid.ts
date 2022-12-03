import { ComponentType, InteractionComponentFlag, InteractionTypeModalSubmit, MessageComponent, ReplyableComponentInteraction } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import { MessageEditOptions, MessageOptions, TextChannel } from 'discord.js'
import { TudeBot } from '../../../..'
import DataModule from '../../../../modules/data'


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

function getComponentTemplate(name: string): MessageOptions['components'] {
  if (!name) return []

  if (name.startsWith('role-select:')) {
    const id = name.split(':')[1]
    const data = TudeBot.getModule<DataModule>('data').data.roleLists
    if (!data[id]) return []

    return [
      {
        type: 'ACTION_ROW',
        components: [
          {
            type: 'SELECT_MENU',
            customId: CordoAPI.compileCustomId('xaction_roles_select_' + id, [ InteractionComponentFlag.ACCESS_EVERYONE ]),
            options: [
              ...data[id].map(role => ({
                label: role.name,
                value: role.roleId,
                description: role.description,
                emoji: role.emoji
              })),
              {
                label: 'Clear Roles',
                value: 'clear',
                description: 'Removes all of your roles',
                emoji: '❌'
              }
            ],
            minValues: 0,
            maxValues: data[id].length
          }
        ]
      }
    ]
  }

  return []
}

export default async function (i: ReplyableComponentInteraction) {
  if (!PermissionStrings.containsManageMessages(i.member?.permissions ?? '0'))
    return i.ack()

  const content = polyfillGetSubmission('content', (<unknown> i as InteractionTypeModalSubmit).data.components)
  const title = polyfillGetSubmission('title', (<unknown> i as InteractionTypeModalSubmit).data.components)
  const description = polyfillGetSubmission('description', (<unknown> i as InteractionTypeModalSubmit).data.components)
  const componentTemplate = polyfillGetSubmission('component_template', (<unknown> i as InteractionTypeModalSubmit).data.components)

  if (!content && !title && !description)
    return i.replyPrivately({ content: 'You need to send *something*...' })

  i.ack()

  const channel = await TudeBot.channels.fetch(i.channel_id) as TextChannel
  const messageId = i.params.messageid

  const embeds = (title || description)
    ? [ { title: title ?? null, description: description ?? null, color: 0x2F3136 } ]
    : []

  const payload: MessageOptions & MessageEditOptions = {
    content: content ?? null,
    embeds,
    components: getComponentTemplate(componentTemplate)
  }

  if (messageId === 'new') {
    channel.send(payload)
  } else {
    const message = await channel.messages.fetch(messageId)
    if (message) message.edit(payload)
  }
}
