import { ButtonStyle, ComponentType, MessageComponent, ReplyableCommandInteraction } from 'cordo'
import { Long } from 'mongodb'
import { TudeBot } from '../..'
import { truncateString } from '../../lib/utils/string-utils'
import RemindersModule from '../../modules/reminders'


export default async function (i: ReplyableCommandInteraction) {
  const reply = await i.reply({
    title: 'Your Reminders',
    description: '*Loading...*',
    components: getComponents()
  })

  const user = Long.fromString(i.user.id)
  const module = await TudeBot.getModule<RemindersModule>('reminders')

  const reminders = await module.getRemindersForUser(user)

  const remindersFormatted = !reminders?.length
    ? 'None'
    : reminders
      .map(r => `<t:${~~(r.time / 1000)}:f> ${truncateString(r.title ?? '', 25)}`)
      .join('\n')

  reply.edit({
    title: 'Your Reminders',
    description: remindersFormatted,
    components: getComponents()
  })
}

function getComponents(): MessageComponent[] {
  return [
    // {
    //   type: ComponentType.SELECT,
    //   custom_id: 'usersettings_timezone_change',
    //   options: [
    //     {
    //       label: 'CET (default)',
    //       value: 'cet',
    //       default: true
    //     }
    //   ],
    //   disabled: true
    // },
    {
      type: ComponentType.BUTTON,
      style: ButtonStyle.SECONDARY,
      label: 'Change Timezone',
      custom_id: 'reminders_timezone_change',
      disabled: true
    },
    {
      type: ComponentType.BUTTON,
      style: ButtonStyle.SECONDARY,
      label: 'Add to calendar',
      custom_id: 'reminders_calendar_add'
    }
  ]
}

