import { ButtonStyle, ComponentType, InteractionComponentFlag, MessageComponent, ReplyableCommandInteraction } from 'cordo'
import { Long } from 'mongodb'
import { TudeBot } from '../..'
import { parseTime } from '../../lib/parsing/parse-time'
import RemindersModule from '../../modules/reminders'


export default async function (i: ReplyableCommandInteraction) {
  const time = parseTime(i.data.option.when as string)
  if (!time) {
    return i.replyPrivately({
      content: `Unable to parse time \`${i.data.option.when}\``
    })
  }

  const res = await i.defer(false)
  const mes = await res.getMessage()
  const source = mes ? Long.fromString(mes.id) : null

  const title = i.data.option.about
    ? (i.data.option.about + '')
    : undefined

  const id = await TudeBot
    .getModule<RemindersModule>('reminders')
    .registerReminder({
      time,
      title,
      channel: Long.fromString(i.channel_id),
      source,
      subscribers: [
        Long.fromString(i.user.id)
      ]
    })

  if (!id) console.log('error')

  const topic = title ? `about '${title}' ` : ''
  const components: MessageComponent[] = []
  if (id) {
    components.push({
      type: ComponentType.BUTTON,
      style: ButtonStyle.SECONDARY,
      custom_id: 'reminders_subscribe_' + id,
      label: 'Remind me too',
      flags: [
        InteractionComponentFlag.ACCESS_EVERYONE
      ]
    })
  }

  i.reply({
    description: `Alright, I'll remind you ${topic}<t:${~~(time / 1000)}:R>`,
    components
  })
}

