import { UserData } from '../user-data'
import Notifications from './notifications'


export namespace Achievements {

export type Type
  /** you get it, you have it */
  = 'standart'
  /** you need to reach at least X something to get this */
  | 'counter'
  /** you need to collect X different things to get this */
  | 'collect'


type Metadata = {
  standart: { type: 'standart' }
  counter: { type: 'counter', count: number }
  collect: { type: 'collect', collectables: string[] }
}

export type GenericMeta = Metadata[Type]


//

function createStandart(): Metadata['standart'] {
  return { type: 'standart' }
}

function createCounter(count: number): Metadata['counter'] {
  return { type: 'counter', count }
}

function createCollect(collectables: string[]): Metadata['collect'] {
  return { type: 'collect', collectables }
}

//


export const List = {
  PROCRASTINATION: createStandart(),
  MEGA_PROCRASTINATION: createStandart(),
  GIGA_PROCRASTINATION: createStandart(),
  SUPER_PROCRASTINATION: createStandart(),
  TEST_STANDART: createStandart(),
  TEST_COUNTER: createCounter(65),
  TEST_COLLECT: createCollect([ 'gaming', 'cool', 'nice' ])
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
      if (!el) data.achievements.push({ name, unlocked: true })
      else el.unlocked = true
      data.save()
      userData.queueNotification(Notifications.createUnlockNotification(name))
    },
    async revoke(): Promise<void> {
      if (!userData) return
      const data = await userData.fetchData()
      const el = data.achievements.find(a => a.name === name)
      if (!el?.unlocked) return
      else el.unlocked = false
      data.save()
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
    async incAmount(amount: number): Promise<number> {
      if (!userData) return
      const data = await userData.fetchData()
      let el = data.achievements.find(a => a.name === name)

      if (el) {
        if (el.unlocked) return el.counter
        el.counter += amount
      } else {
        el = { name, unlocked: false, counter: amount }
        data.achievements.push(el)
      }

      if (el.counter >= meta.count) {
        el.unlocked = true
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }

      data.save()
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
        el = { name, unlocked: false, counter: amount }
        data.achievements.push(el)
      }

      if (el.counter >= meta.count) {
        el.unlocked = true
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }
      data.save()
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
        el = { name, unlocked: false, collected: [ item ] }
        data.achievements.push(el)
      }

      if (el.collected.length >= meta.collectables.length) {
        el.unlocked = true
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }

      data.save()
    },
    async setCollectables(items: string[]): Promise<void> {
      if (!userData) return
      const data = await userData.fetchData()
      let el = data.achievements.find(a => a.name === name)

      if (el) {
        if (el.unlocked) return
        el.collected = items
      } else {
        el = { name, unlocked: false, collected: items }
        data.achievements.push(el)
      }

      if (el.collected.length >= meta.collectables.length) {
        el.unlocked = true
        userData.queueNotification(Notifications.createUnlockNotification(name))
      }
      data.save()
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
