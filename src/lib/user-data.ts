import { UserType } from '../database/models/user.model'
import Mongo from '../database/mongoose'
import { Achievements } from './users/achievements'
import { Notification } from './users/notifications'


export class UserData {

  public constructor(private readonly userId: string) {
    return void 0
  }

  //

  private static dbCacheData: Map<string, UserType> = new Map()
  private static dbSaveQueue: Set<UserType> = new Set()

  public async fetchData(): Promise<UserType> {
    if (UserData.dbCacheData.has(this.userId))
      return UserData.dbCacheData.get(this.userId)

    let data = await Mongo.User
      .findById(this.userId)
      .exec()
      .catch(err => void console.log(err)) as UserType

    console.log('1')
    console.log(data)

    if (data === null)
      data = new Mongo.User({ _id: this.userId })

    console.log(data)
    console.log('2')

    if (!data) return null

    data.queueSave = () => UserData.dbSaveQueue.add(data)

    UserData.dbCacheData.set(this.userId, data)
    return data
  }

  //

  public achievement<T extends Achievements.Name>(name: T): Achievements.Interface<T> {
    return Achievements.createInterface(this, name)
  }

  //

  private static pendingNotifications: Map<string, Notification[]> = new Map()

  public queueNotification(not: Notification): void {
    if (UserData.pendingNotifications.has(this.userId))
      UserData.pendingNotifications.get(this.userId).push(not)
    else
      UserData.pendingNotifications.set(this.userId, [ not ])
  }

  public consumeNotifications(): Notification[] {
    if (!UserData.pendingNotifications.has(this.userId)) return []
    const nots = UserData.pendingNotifications.get(this.userId)
    UserData.pendingNotifications.delete(this.userId)
    return nots
  }

  //

  public static async clearCache() {
    await UserData.pushChanges()
    UserData.dbCacheData.clear()
  }

  public static async pushChanges() {
    const copy = [ ...UserData.dbSaveQueue.values() ]
    UserData.dbSaveQueue.clear()
    await Promise.all(copy.map(u => u.save()))
  }

}
