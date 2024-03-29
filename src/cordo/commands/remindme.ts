import { ButtonStyle, ComponentType, InteractionComponentFlag, MessageComponent, ReplyableCommandInteraction } from 'cordo'
import { Long } from 'mongodb'
import { TudeBot } from '../..'
import { parseTime } from '../../lib/parsing/parse-time'
import Timezones from '../../lib/timezones'
import RemindersModule from '../../modules/reminders'


export default async function (i: ReplyableCommandInteraction) {
  const timeInput = (i.data.option.when as string).toLowerCase()
  const times: number[] = []

  const timezone = Timezones.getTimezoneOffset(i)
  let timezoneEstimation = false

  if (timeInput.includes(' and ')) {
    for (const input of timeInput.split(' and ').map(s => s.trim())) {
      const time = parseTime(input, timezone.offsetMs)
      if (!time) {
        return i.replyPrivately({
          content: `Unable to parse time \`${input}\``
        })
      }

      times.push(time.parsed)
      if (time.usedTimezone && !timezone.explicit)
        timezoneEstimation = true

      if (times.length >= 10) break
    }
  } else {
    const time = parseTime(timeInput, timezone.offsetMs)
    if (!time) {
      return i.replyPrivately({
        content: `Unable to parse time \`${i.data.option.when}\``
      })
    }

    times.push(time.parsed)
    if (time.usedTimezone && !timezone.explicit)
      timezoneEstimation = true
  }

  if (!times.length) return

  const res = await i.defer(false)
  const mes = await res.getMessage()
  const source = mes ? Long.fromString(mes.id) : null

  let title = i.data.option.about
    ? (i.data.option.about + '')
    : undefined

  const clown = title?.startsWith('[Snoozed')
  if (clown)
    title = title?.replace(/ *\[Snoozed.*?\]? */g, '🤡').trim()

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

  if (!ids || ids.some(id => !id)) return console.log('remindme:65 error')

  const topic = title ? `${clown ? '🤡' : 'about'} '${title}' ` : ''
  const components: MessageComponent[] = [
    {
      type: ComponentType.BUTTON,
      style: ButtonStyle.SECONDARY,
      custom_id: 'reminders_subscribe_' + ids[0],
      label: clown ? '🤡 🤡 🤡' : 'Remind me too',
      flags: [
        InteractionComponentFlag.ACCESS_EVERYONE
      ]
    }
  ]

  if (times.length === 1) {
    i.reply({
      description: clown
        ? `🤡, 🤡 🤡 🤡 ${topic}<t:${~~(times[0] / 1000)}:R>`
        : `Alright, I'll remind you ${topic}<t:${~~(times[0] / 1000)}:R>`,
      footer: timezoneEstimation
        ? `Estimated your timezone to be ${timezone.zoneName}`
        : undefined,
      components
    })
  } else {
    i.reply({
      description: clown
        ? `🤡, 🤡 🤡 🤡 🤡 ${times.length} 🤡 🤡!`
        : `Alright, I'll remind you on ${times.length} different occasions!`,
      footer: timezoneEstimation
        ? `Estimated your timezone to be ${timezone.zoneName}`
        : undefined,
      components
    })
  }
}

