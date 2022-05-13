import { ButtonStyle, ComponentType, ReplyableComponentInteraction } from 'cordo'
import { config } from '../../..'
import Const from '../../../lib/const'
import JWT from '../../../lib/web/jwt'


export default async function (i: ReplyableComponentInteraction) {
  i.ack()

  const token = await JWT.signRaw({
    tb_t: Const.tb_t.reminders_access,
    u_id: i.user.id
  })

  const url = `${config.server.publicHost}/m/reminders/calendar-v1/${token}?format=ical`

  i.replyPrivately({
    title: 'TudeBot Calendar Integration',
    description: `Copy the link below and add it to your calendar app:\n\`\`\`${url}\`\`\`\n\n:warning: **WARNING!** Never share this link with other people. Everyone who has access to this link can always view all of your TudeBot reminders!`,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        url: 'https://help.sportlyzer.com/hc/en-us/articles/207593579-Add-iCal-to-Google-Calendar',
        label: 'Tutorial: Google Calendar'
      }
    ]
  })
}
