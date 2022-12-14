import ical from 'ical-generator'
import { Request, Response } from 'express'
import { Long } from 'mongodb'
import { TextChannel } from 'discord.js'
import ReqError from '../../../../lib/web/req-error'
import JWT from '../../../../lib/web/jwt'
import Localisation from '../../../../lib/localisation'
import { TudeBot } from '../../../..'
import RemindersModule from '../../../../modules/reminders'
import Const from '../../../../lib/data/const'


const supportedFormats = [
  'ical'
]

export async function getCalendarV1(req: Request, res: Response) {
  const token = req.params.token
  const format = req.query.format || 'ical'

  if (!token) return ReqError.badRequest(res, 'Missing or invalid token')
  if (!supportedFormats.includes(format + '')) return ReqError.badRequest(res, 'Invalid format')

  const decoded = await JWT.decodeRaw(token, false)
  if (!decoded) return ReqError.badRequest(res, 'Invalid token')
  if (decoded.tb_t !== Const.tb_t.reminders_access) ReqError.badRequest(res, 'Token type missmatch')

  const calendar = ical({
    name: Localisation.text('en-US', '=m_reminders_calendar_name')
  })

  const module = await TudeBot.getModule<RemindersModule>('reminders')
  const reminders = await module.getRemindersForUser(Long.fromString(decoded.u_id + ''))

  for (const reminder of reminders) {
    const start = new Date(reminder.time)
    const end = new Date(start.getTime() + 1000 * 60 * 30)
    const channel = await TudeBot.channels.fetch(reminder.channel.toString()) as TextChannel
    calendar.createEvent({
      start,
      end,
      summary: reminder.title || 'Unnamed Reminder',
      // description: 'You subscribed to this reminder',
      location: channel ? `#${channel.name}` : 'Somewhere',
      url: channel
        ? `https://discord.com/channels/${channel.guildId}/${channel.id}/${reminder.source}`
        : 'https://tude.club/'
    })
  }

  calendar.serve(res as any, 'tudebot-reminders.ics')
}
