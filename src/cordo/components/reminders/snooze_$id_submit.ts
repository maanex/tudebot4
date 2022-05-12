import * as ms from 'ms'
import { ButtonStyle, ComponentType, InteractionComponentFlag, ReplyableComponentInteraction } from 'cordo'
import { Long } from 'mongodb'
import { TudeBot } from '../../..'
import RemindersModule, { ReminderData } from '../../../modules/reminders'


export default async function (i: ReplyableComponentInteraction) {
  if (!i.message.mentions.some(user => user.id === i.user.id)) {
    i.replyPrivately({
      content: 'This is not your reminder, get your hands off the snooze button!'
    })
    return
  }

  const delayStr = i.data.values[0]
  const delay = parseInt(delayStr ?? '', 10) * 1000 * 60
  if (!delay || isNaN(delay)) return i.ack()

  const embeds = i.message.embeds
  let orgTitle = 'Reminder'
  let count = 1

  if (embeds?.length) {
    count = parseInt(embeds[0].description?.match(/\[Snoozed (\d+)x\]/)[1] ?? '1') + 1
    orgTitle = embeds[0].description?.replace(/^\[Snoozed( \d+x)?\] ?/, '') ?? 'Reminder'
    embeds[0].description += `\n\n<@${i.user.id}> snoozed this reminder for ${ms(delay)}`
  }

  const time = Date.now() + delay
  const orgRef = (i.message as any).message_reference

  const newReminder: ReminderData = {
    channel: Long.fromString(orgRef?.channel_id ?? '0'),
    source: Long.fromString(orgRef?.message_id ?? '0'),
    subscribers: [ Long.fromString(i.user.id) ],
    time,
    snooze: count,
    title: count > 1
      ? `[Snoozed ${count}x] ${orgTitle}`
      : `[Snoozed] ${orgTitle}`
  }

  const module = TudeBot.getModule<RemindersModule>('reminders')
  const newId = await module.registerReminder(newReminder)

  i.edit({
    ...i.message,
    embeds,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Snooze me too',
        custom_id: `reminders_subscribe_${newId}`,
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
      }
    ]
  })
}
