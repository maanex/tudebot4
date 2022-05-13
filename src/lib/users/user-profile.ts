/* eslint-disable no-useless-constructor */
import { GenericInteraction, InteractionUser } from 'cordo'
import * as ct from 'countries-and-timezones'
import Database from '../../database/database'


export type TimezoneInfo = {
  offsetMs: number,
  zoneName: string
  explicit: boolean
}

export type Notification = {
  title: string
  icon?: string
  color?: number
  description?: string
}

export type ProfileData = {
  achievements: Record<string, {
    unlocked: boolean
    counter?: number
    collected?: string[]
  }>
}


export default class UserProfile {

  private static pendingNotifications: Map<string, Notification[]> = new Map()

  public static queueNotification(user: InteractionUser, not: Notification): void {
    if (UserProfile.pendingNotifications.has(user.id))
      UserProfile.pendingNotifications.get(user.id).push(not)
    else
      UserProfile.pendingNotifications.set(user.id, [ not ])
  }

  public static consumeNotifications(user: InteractionUser): Notification[] {
    if (!UserProfile.pendingNotifications.has(user.id)) return []
    const nots = UserProfile.pendingNotifications.get(user.id)
    UserProfile.pendingNotifications.delete(user.id)
    return nots
  }

  //

  public static fetchProfileData(id: string): ProfileData {
    // TODO add cache
    return Database
      .collection('users')
      .findOne({ _id: id })
      .catch(() => null)
  }

  //

  public static getTimezoneOffset(i?: GenericInteraction): TimezoneInfo {
    // TODO if user has a timezone override use this

    const zoneName = (i?.locale ?? 'GB').replace(/^\w\w-/, '').toUpperCase()
    const zones = ct.getTimezonesForCountry(zoneName)
    if (!zones?.length) {
      return {
        offsetMs: 0,
        zoneName: 'unknown',
        explicit: false
      }
    }

    return {
      offsetMs: zones[0].utcOffset * 60 * 1000,
      zoneName: zones[0].name,
      explicit: false
    }
  }

}
