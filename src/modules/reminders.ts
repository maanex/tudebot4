import { InteractionComponentFlag } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import * as cron from 'cron'
import { ButtonStyle, ComponentType, Embed, EmbedBuilder, TextChannel } from 'discord.js'
import { Long, ObjectId } from 'mongodb'
import { TudeBot } from '..'
import Database from '../database/database'
import Notifications from '../lib/users/notifications'
import { removeLongFromArray } from '../lib/utils/long-utils'
import { Module } from '../types/types'


export type ReminderData = {
  id?: string
  time: number
  title: string | undefined
  channel: Long
  source: Long
  snooze: number
  subscribers: Long[]
}

export default class RemindersModule extends Module {

  private static readonly MAX_TIME_FOR_LOCAL_ONLY = 1000 * 30
  private static readonly MAX_TIME_FOR_HYBRID = 1000 * 60 * 5
  private static readonly LOCAL_PREFIX = 'local'

  private static isBotReady = false
  private static localOnly: Map<string, ReminderData> = new Map()
  private static hybrid: Map<string, ReminderData> = new Map()

  private cronjob: cron.CronJob;

  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('Reminders', '⏰', 'Adds commands to get reminded about stuff', 'Using /remindme you can easily create reminders', 'public', conf, data, guilds)
  }

  public onEnable() {
    this.cronjob = cron.job('* * * * *', () => this.check())
    this.cronjob.start()
  }

  public onBotReady() {
    RemindersModule.isBotReady = true
  }

  public onDisable() {
    this.cronjob?.stop()
  }

  //

  /**
   * @returns the reminder id
   */
  public async registerReminder(data: ReminderData): Promise<string> {
    const delta = data.time - Date.now()
    if (delta < 0) {
      this.triggerReminder(data)
      return 'none'
    }

    if (delta < RemindersModule.MAX_TIME_FOR_LOCAL_ONLY) {
      const id = RemindersModule.LOCAL_PREFIX + Date.now().toString(16)
      setTimeout(() => {
        data.id = id
        this.triggerReminder(data)
        RemindersModule.localOnly.delete(id)
      }, delta)
      RemindersModule.localOnly.set(id, data)
      return id
    }

    const res = await Database
      .collection('reminders')
      .insertOne(data)

    const id = res.insertedId
    if (!id) return null
    data.id = id

    if (delta < RemindersModule.MAX_TIME_FOR_HYBRID) {
      RemindersModule.hybrid.set(id.toHexString(), data)
      setTimeout(() => { this.triggerReminder(data) }, delta)
    }

    return id
  }

  /** @returns success */
  public async subscribePersonToReminder(person: Long, reminder: string): Promise<boolean> {
    if (RemindersModule.localOnly.has(reminder)) {
      RemindersModule.localOnly.get(reminder).subscribers.push(person)
      return true
    }
    if (RemindersModule.hybrid.has(reminder))
      RemindersModule.hybrid.get(reminder).subscribers.push(person)

    await Database
      .collection('reminders')
      .updateOne(
        { _id: new ObjectId(reminder) },
        { $push: { subscribers: person } }
      )
    return true
  }

  /** @returns success */
  public async unsubscribePersonFromReminder(person: Long, reminder: string): Promise<boolean> {
    if (RemindersModule.localOnly.has(reminder)) {
      removeLongFromArray(person, RemindersModule.localOnly.get(reminder).subscribers)
      return true
    }
    if (RemindersModule.hybrid.has(reminder))
      removeLongFromArray(person, RemindersModule.hybrid.get(reminder).subscribers)

    await Database
      .collection('reminders')
      .updateOne(
        { _id: new ObjectId(reminder) },
        { $pull: { subscribers: person } }
      )
    return true
  }

  public async getReminder(id: string): Promise<ReminderData | null> {
    if (RemindersModule.localOnly.has(id))
      return RemindersModule.localOnly.get(id)

    let _id
    try {
      _id = new ObjectId(id)
    } catch (_) {
      return null
    }

    const out = await Database
      .collection('reminders')
      .findOne({ _id })

    return out ?? null
  }

  public async check() {
    if (!RemindersModule.isBotReady) return

    const now = Date.now()
    const query = { time: { $lt: now + 1000 * 30 } }

    const items = await Database
      .collection('reminders')
      .find(query)
      .toArray() as ReminderData[]

    if (!items?.length) return

    await Database
      .collection('reminders')
      .deleteMany(query)

    for (const reminder of items) {
      reminder.id = (reminder as any)._id.toHexString()
      if (RemindersModule.hybrid.has(reminder.id)) {
        RemindersModule.hybrid.delete(reminder.id)
        continue
      }

      this.triggerReminder(reminder)
    }
  }

  public async triggerReminder(data: ReminderData) {
    if (!data.subscribers.length) return
    const content = data.subscribers.map(s => `<@${s.toString()}>`).join(' ') || undefined

    const channel = await TudeBot.channels.fetch(data.channel.toString())
    try {
      const mes = await (channel as TextChannel).send({
        content,
        reply: {
          messageReference: data.source?.toString(),
          failIfNotExists: false
        },
        embeds: [
          Notifications.buildEmbed(
            Notifications.createReminderNotification(data.title ?? '*no description*'),
            true
          )
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
                label: 'Snooze',
                emoji: '💤',
                customId: CordoAPI.compileCustomId(`reminders_snooze_${data.id}_select`, [ InteractionComponentFlag.ACCESS_EVERYONE ])
              }
            ]
          }
        ]
      })
      if (!mes) this.triggerReminderBackup(data)
    } catch (ex) {
      this.triggerReminderBackup(data)
    }
  }

  public async triggerReminderBackup(data: ReminderData) {
    for (const sub of data.subscribers) {
      const user = await TudeBot.users.fetch(sub.toString())
      if (!user) continue
      try {
        const dms = user.dmChannel ?? await user.createDM()
        dms.send({
          embeds: [
            Notifications.buildEmbed(
              Notifications.createReminderNotification(data.title ?? '*no description*'),
              true
            )
          ]
        })
      } catch (ex) {}
    }
  }

  public async getRemindersForUser(user: Long): Promise<ReminderData[]> {
    let reminders = await Database
      .collection('reminders')
      .find({ subscribers: user })
      .sort({ time: 1 })
      .toArray() as ReminderData[]

    if (!reminders) reminders = []

    reminders.unshift(
      ...[ ...RemindersModule.localOnly.values() ]
        .filter(r => r.subscribers.some(s => s.equals(user)))
    )

    return reminders
  }

}

// todo
// TRUNCATE REMINDER TITLE IF LONGER THAN X CHARS
// ONLY ALLOW SO MANY REMINDERS PER PERSON PER TIME (can also be memory cached, doesnt matter)
