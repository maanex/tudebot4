import { ReplyableComponentInteraction } from 'cordo'
import { Long } from 'mongodb'
import { TudeBot } from '../../..'
import RemindersModule from '../../../modules/reminders'


export default async function (i: ReplyableComponentInteraction) {
  const id = i.params.id

  i.ack()

  const module = TudeBot.getModule<RemindersModule>('reminders')

  const reminder = await module.getReminder(id)

  if (!reminder) {
    return i.edit({
      content: 'Unable to find the Reminder you want to unsubscribe from',
      components: []
    })
  }

  const person = Long.fromString(i.user.id)

  if (!reminder.subscribers.some(s => s.equals(person))) {
    return i.edit({
      content: 'You are no longer subscribed to this reminder.',
      components: []
    })
  }

  module.unsubscribePersonFromReminder(person, id)

  i.edit({
    content: 'Successfully unsubscribed from this reminder!',
    components: []
  })
}
