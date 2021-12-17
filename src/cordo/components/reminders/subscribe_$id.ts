import { ButtonStyle, ComponentType, ReplyableComponentInteraction } from 'cordo'
import { Long } from 'mongodb'
import { TudeBot } from '../../..'
import RemindersModule from '../../../modules/reminders'


export default async function (i: ReplyableComponentInteraction) {
  const id = i.params.id

  i.ack()

  const module = TudeBot.getModule<RemindersModule>('reminders')

  const reminder = await module.getReminder(id)

  if (!reminder) {
    return i.replyPrivately({
      content: 'Looks like this reminder is a relict of the past...'
    })
  }

  const person = Long.fromString(i.user.id)

  if (reminder.subscribers.some(s => s.equals(person))) {
    return i.replyPrivately({
      content: 'You are already subscribed to this reminder!',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          label: 'Unsubscribe',
          custom_id: `reminders_unsubscribe_${id}`
        }
      ]
    })
  }

  module.subscribePersonToReminder(person, id)

  i.replyPrivately({
    content: 'Successfully subscribed to this reminder!'
  })
}
