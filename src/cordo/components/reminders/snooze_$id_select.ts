import { ComponentType, InteractionComponentFlag, MessageComponentSelectOption, ReplyableComponentInteraction } from 'cordo'


const snoozeOptions: MessageComponentSelectOption[] = [
  { label: '5 minutes', value: '5' },
  { label: '10 minutes', value: '10' },
  { label: '20 minutes', value: '20' },
  { label: '30 minutes', value: '30' },
  { label: '60 minutes', value: '60' },
  { label: '2 hours', value: '120' },
  { label: '3 hours', value: '180' },
  { label: '12 hours', value: '720' },
  { label: '1 day', value: '1440' }
]

export default function (i: ReplyableComponentInteraction) {
  if (!i.message.mentions.some(user => user.id === i.user.id)) {
    i.replyPrivately({
      content: 'This is not your reminder, get your hands off the snooze button!'
    })
    return
  }

  i.edit({
    ...i.message,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: `reminders_snooze_${i.params.id}_submit`,
        options: snoozeOptions,
        placeholder: 'Select Snooze Delay',
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
      }
    ]
  })
}
