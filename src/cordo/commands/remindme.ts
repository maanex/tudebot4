import { ButtonStyle, ComponentType, InteractionComponentFlag, MessageComponent, ReplyableCommandInteraction } from 'cordo'
import { Long } from 'mongodb'
import { TudeBot } from '../..'
import { parseTime } from '../../lib/parsing/parse-time'
import RemindersModule from '../../modules/reminders'


export default async function (i: ReplyableCommandInteraction) {
  const timeInput = (i.data.option.when as string).toLowerCase()
  const times: number[] = []

  if (timeInput.includes(' and ')) {
    for (const input of timeInput.split(' and ').map(s => s.trim())) {
      const time = parseTime(input)
      if (!time) {
        return i.replyPrivately({
          content: `Unable to parse time \`${input}\``
        })
      }

      times.push(time)

      if (times.length >= 10) break
    }
  } else {
    const time = parseTime(timeInput)
    if (!time) {
      return i.replyPrivately({
        content: `Unable to parse time \`${i.data.option.when}\``
      })
    }

    times.push(time)
  }

  if (!times.length) return

  const res = await i.defer(false)
  const mes = await res.getMessage()
  const source = mes ? Long.fromString(mes.id) : null

  const title = i.data.option.about
    ? (i.data.option.about + '')
    : undefined

  const idsPromise = times.map(async time => await TudeBot
    .getModule<RemindersModule>('reminders')
    .registerReminder({
      time,
      title,
      channel: Long.fromString(i.channel_id),
      source,
      snooze: 0,
      subscribers: [
        Long.fromString(i.user.id)
      ]
    }))

  const ids = await Promise.all(idsPromise)

  if (!ids || ids.some(id => !id)) console.log('error')

  const topic = title ? `about '${title}' ` : ''
  const components: MessageComponent[] = [
    {
      type: ComponentType.BUTTON,
      style: ButtonStyle.SECONDARY,
      custom_id: 'reminders_subscribe_' + ids[0],
      label: 'Remind me too',
      flags: [
        InteractionComponentFlag.ACCESS_EVERYONE
      ]
    }
  ]

  if (times.length === 1) {
    i.reply({
      description: `Alright, I'll remind you ${topic}<t:${~~(times[0] / 1000)}:R>`,
      components
    })
  } else {
    i.reply({
      description: `Alright, I'll remind you on ${times.length} different occasions!`,
      components
    })
  }
}

