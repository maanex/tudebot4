import { IQTestCommandTests } from '../../cordo/commands/iqtest'
import { UserData } from './user-data'
import { getUnixSeconds } from '../utils/time-utils'
import Notifications from './notifications'


export namespace Achievements {

export type Type
  /** you get it, you have it */
  = 'standart'
  /** you need to reach at least X something to get this */
  | 'counter'
  /** you need to collect X different things to get this */
  | 'collect'

type Visibility
  = 'visible'
  | 'title_only'
  | 'all_redacted'
  | 'hidden'


type Metadata = {
  standart: { type: 'standart', visibility: Visibility }
  counter: { type: 'counter', count: number, visibility: Visibility }
  collect: { type: 'collect', collectables: string[], visibility: Visibility }
}

export type GenericMeta = Metadata[Type]


//

type StandartArgs = {
  visibility?: Visibility
}
function createStandart(args: StandartArgs): Metadata['standart'] {
  return { type: 'standart', visibility: args.visibility || 'visible' }
}

type CounterArgs = {
  count: number
  visibility?: Visibility
}
function createCounter(args: CounterArgs): Metadata['counter'] {
  return { type: 'counter', count: args.count, visibility: args.visibility || 'visible' }
}

type CollectArgs = {
  collectables: string[]
  visibility?: Visibility
}
function createCollect(args: CollectArgs): Metadata['collect'] {
  return { type: 'collect', collectables: args.collectables, visibility: args.visibility || 'visible' }
}

//


export const List = {
  PROCRASTINATION: createCounter({ count: 2 }),
  MEGA_PROCRASTINATION: createCounter({ count: 20, visibility: 'title_only' }),
  GIGA_PROCRASTINATION: createCounter({ count: 200, visibility: 'all_redacted' }),
  SUPER_PROCRASTINATION: createCounter({ count: 2000, visibility: 'hidden' }),
  DEFINE_ACHIEVEMENT: createStandart({ visibility: 'hidden' }),
  VERY_SMART: createCollect({ collectables: Object.keys(IQTestCommandTests) }),
  SELF_LOVE: createStandart({ visibility: 'title_only' }),
  GAMING_PLAY_ONE: createStandart({}),
  TEST_STANDART: createStandart({}),
  TEST_COUNTER: createCounter({ count: 65 }),
  TEST_COLLECT: createCollect({ collectables: [ 'gaming', 'cool', 'nice' ] })
}


//


export type Name = keyof typeof List

export type GetType<N extends Name> = (typeof List)[N]['type']


//


export interface StandartInterface {
  getMeta(): Metadata['standart']
  has(): Promise<boolean>
  grant(): Promise<void>
  revoke(): Promise<void>
}

export interface CounterInterface {
  getMeta(): Metadata['counter']
  has(): Promise<boolean>
  highAmount(amount: number): Promise<number>
  incAmount(amount: number): Promise<number>
  setAmount(amount: number): Promise<number>
  getAmount(): Promise<number>
}

export interface CollectInterface {
  getMeta(): Metadata['collect']
  has(): Promise<boolean>
  addCollectable(name: string): Promise<void>
  setCollectables(names: string[]): Promise<void>
  getCollectables(): Promise<string[]>
}

export type Interface<N extends Name, T = GetType<N>>
  = T extends 'standart' ? StandartInterface
  : T extends 'counter' ? CounterInterface
  : T extends 'collect' ? CollectInterface
  : never


//

function createStandartInterface(userData: UserData, name: Name, meta: Metadata['standart']): StandartInterface {
  return {
    getMeta(): Metadata['standart'] {
      return meta
    },
    has(): Promise<boolean> {
      if (!userData) return Promise.resolve(false)
      return userData
        .fetchData()
        .then(d => !!d.achievements.find(a => a.name === name)?.unlocked)
    },
    async grant(): Promise<void> {
      if (!userData) return
      const data = await userData.fetchData()
      const el = data.achievements.find(a => a.name === name)
      if (el?.unlocked) return
      if (!el) data.achievements.push({ name, unlocked: getUnixSeconds() })
      else el.unlocked = getUnixSeconds()
      data.queueSave()
      userData.queueNotification(Notifications.createUnlockNotification(name))
    },
    async revoke(): Promise<void> {
      if (!userData) return
      const data = await userData.fetchData()
      const el = data.achievements.find(a => a.name === name)
      if (!el?.unlocked) return
      else el.unlocked = null
      data.queueSave()
    }
  }
}

function createCounterInterface(userData: UserData, name: Name, meta: Metadata['counter']): CounterInterface {
  return {
    getMeta(): Metadata['counter'] {
      return meta
    },
    has(): Promise<boolean> {
      if (!userData) return Promise.resolve(false)
      return userData
        .fetchData()
        .then(d => !!d.achievements.find(a => a.name === name)?.unlocked)
    },
    async highAmount(amount: number): Promise<number> {
      if (!userData) return
      const data = await userData.fetchData()
      let el = data.achievements.find(a => a.name === name)

      if (el) {
        if (el.unlocked) return el.counter
        if (amount <= el.counter) return el.counter
        el.counter = amount
      } else {
        el = { name, unlocked: null, counter: amount }
        data.achievements.push(el)
      }

      if (el.counter >= meta.count) {
        el.unlocked = getUnixSeconds()
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }

      data.queueSave()
      return el.counter
    },
    async incAmount(amount: number): Promise<number> {
      if (!userData) return
      const data = await userData.fetchData()
      let el = data.achievements.find(a => a.name === name)

      if (el) {
        if (el.unlocked) return el.counter
        el.counter += amount
      } else {
        el = { name, unlocked: null, counter: amount }
        data.achievements.push(el)
      }

      if (el.counter >= meta.count) {
        el.unlocked = getUnixSeconds()
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }

      data.queueSave()
      return el.counter
    },
    async setAmount(amount: number): Promise<number> {
      if (!userData) return
      const data = await userData.fetchData()
      let el = data.achievements.find(a => a.name === name)

      if (el) {
        if (el.unlocked) return el.counter
        el.counter = amount
      } else {
        el = { name, unlocked: null, counter: amount }
        data.achievements.push(el)
      }

      if (el.counter >= meta.count) {
        el.unlocked = getUnixSeconds()
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }
      data.queueSave()
      return el.counter
    },
    async getAmount(): Promise<number> {
      if (!userData) return
      const data = await userData.fetchData()
      const el = data.achievements.find(a => a.name === name)
      return el?.counter ?? 0
    }
  }
}

function createCollectInterface(userData: UserData, name: Name, meta: Metadata['collect']): CollectInterface {
  return {
    getMeta(): Metadata['collect'] {
      return meta
    },
    has(): Promise<boolean> {
      if (!userData) return Promise.resolve(false)
      return userData
        .fetchData()
        .then(d => !!d.achievements.find(a => a.name === name)?.unlocked)
    },
    async addCollectable(item: string): Promise<void> {
      if (!userData) return
      const data = await userData.fetchData()
      let el = data.achievements.find(a => a.name === name)

      if (el) {
        if (el.unlocked) return
        if (!el.collected.find(i => i === item))
          el.collected.push(item)
      } else {
        el = { name, unlocked: null, collected: [ item ] }
        data.achievements.push(el)
      }

      if (el.collected.length >= meta.collectables.length) {
        el.unlocked = getUnixSeconds()
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }

      data.queueSave()
    },
    async setCollectables(items: string[]): Promise<void> {
      if (!userData) return
      const data = await userData.fetchData()
      let el = data.achievements.find(a => a.name === name)

      if (el) {
        if (el.unlocked) return
        el.collected = items
      } else {
        el = { name, unlocked: null, collected: items }
        data.achievements.push(el)
      }

      if (el.collected.length >= meta.collectables.length) {
        el.unlocked = getUnixSeconds()
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }
      data.queueSave()
    },
    async getCollectables(): Promise<string[]> {
      if (!userData) return
      const data = await userData.fetchData()
      const el = data.achievements.find(a => a.name === name)
      return el?.collected ?? []
    }
  }
}

export function createInterface<T extends Name>(userData: UserData, name: T): Interface<T> {
  const meta = List[name]
  if (!meta) return {} as any

  if (meta.type === 'standart') return createStandartInterface(userData, name, meta as any) as Interface<T>
  if (meta.type === 'counter') return createCounterInterface(userData, name, meta as any) as Interface<T>
  if (meta.type === 'collect') return createCollectInterface(userData, name, meta as any) as Interface<T>

  return {} as any
}

}
