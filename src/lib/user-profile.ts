/* eslint-disable no-useless-constructor */
import { GenericInteraction } from 'cordo'
import * as ct from 'countries-and-timezones'


export type TimezoneInfo = {
  offsetMs: number,
  zoneName: string
  explicit: boolean
}


export default class UserProfile {

  private constructor(
    private userId: string
  ) {}

  public static getFor(user: string | { id: string }): UserProfile {
    if (typeof user === 'string')
      return new UserProfile(user)

    return new UserProfile(user.id)
  }

  //

  public getTimezoneOffset(i?: GenericInteraction): TimezoneInfo {
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
