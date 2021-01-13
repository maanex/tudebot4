/* eslint-disable no-useless-constructor */
import { User } from 'discord.js'
import Database, { dbcollection } from './database'


export class DbStats {

  static getCommand(name: string): Promise<DbStatCommand> {
    return new DbStatCommand(name).load()
  }

  static getUser(user: User): Promise<DbStatUser> {
    return new DbStatUser(user).load()
  }

}

export class DbStatCommand {

    public readonly raw: {[key: string ]: number[]} = {};

    constructor(
        public readonly name: string
    ) {}

    async load(): Promise<this> {
      const c = await Database
        .collection('stats-commands')
        .findOne({ _id: this.name })
      for (const temp in c)
        this.raw[temp] = c[temp]
      return this
    }

    get calls(): DbStatGraph {
      return new DbStatGraph('stats-commands', { _id: this.name }, 'calls', this.raw.calls, this.raw)
    }

    get executions(): DbStatGraph {
      return new DbStatGraph('stats-commands', { _id: this.name }, 'executions', this.raw.executions, this.raw)
    }

}

export class DbStatUser {

    public readonly raw: {[key: string ]: number} = {};

    constructor(
        public readonly user: User
    ) {}

    async load(secondTry = false): Promise<this> {
      const c = await Database
        .collection('stats-users')
        .findOne({ _id: this.user.id })
      if (!c) {
        if (secondTry) return this
        await Database
          .collection('stats-users')
          .insertOne({
            _id: this.user.id,
            messagesSent: 0,
            memesSent: 0,
            dailiesClaimed: 0
          })
        return this.load(true)
      }
      for (const temp in c)
        this.raw[temp] = c[temp]
      return this
    }

    private setValue(set: any) {
      Database
        .collection('stats-users')
        .updateOne({ _id: this.user.id }, { $set: set })
    }

    get messagesSent(): number {
      return this.raw.messagesSent || 0
    }

    set messagesSent(number: number) {
      this.raw.messagesSent = number
      this.setValue({ messagesSent: number })
    }

    get memesSent(): number {
      return this.raw.memesSent || 0
    }

    set memesSent(number: number) {
      this.raw.memesSent = number
      this.setValue({ memesSent: number })
    }

    get dailiesClaimed(): number {
      return this.raw.dailiesClaimed || 0
    }

    set dailiesClaimed(number: number) {
      this.raw.dailiesClaimed = number
      this.setValue({ dailiesClaimed: number })
    }

}

export class DbStatGraph {

  constructor(
        private _collectionname: string,
        private _dbquery: any,
        private _objectid: string,
        public readonly raw: number[],
        private _fullraw: any
  ) {}

  public get today(): number {
    if (!this.raw) return 0
    return this.raw[getDayId()] || 0
  }

  public async update(dayId: number, value: number, delta: boolean): Promise<any> {
    if (dayId < 0) return
    if (this.raw) {
      let obj = { } as any
      obj[`${this._objectid}.${dayId}`] = value
      if (delta) obj = { $inc: obj }
      else obj = { $set: obj }
      if (dayId > this.raw.length) {
        if (!obj.$set)
          obj.$set = {}
        while (dayId-- > this.raw.length)
          obj.$set[`${this._objectid}.${dayId}`] = 0
      }
      return await Database
        .collection(this._collectionname as dbcollection)
        .updateOne(this._dbquery, obj)
    } else {
      const parentExists = Object.keys(this._fullraw).length > 0
      const obj = parentExists ? {} : this._dbquery
      obj[this._objectid] = []
      for (let i = 0; i < dayId; i++)
        obj[this._objectid].push(0)
      obj[this._objectid].push(value)
      if (parentExists) {
        return await Database
          .collection(this._collectionname as dbcollection)
          .updateOne(this._dbquery, { $set: obj })
      } else {
        this._fullraw[this._objectid] = obj
        return await Database
          .collection(this._collectionname as dbcollection)
          .insertOne(obj)
      }
    }
  }

  public updateToday(value: number, delta: boolean = true) {
    this.update(getDayId(), value, delta)
  }

}

function getDayId(): number {
  const now = new Date()
  const start = new Date(2020, 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const day = Math.floor(diff / oneDay)
  return day - 1 // index 0 on 1st january
}
