import UserProfile from "./user-profile"


export enum AchievementType {
  /** you get it, you have it */
  STANDART = 'standart',
  /** you need to reach at least X something to get this */
  COUNTER = 'counter',
  /** you need to collect X different things to get this */
  COLLECT = 'collect'
}

type AchievementUnlockType = {
  type: AchievementType.STANDART
} | {
  type: AchievementType.COUNTER
  count: number
} | {
  type: AchievementType.COLLECT
  collectables: string[]
}

type AchievementDataTypeT<T extends AchievementType> = AchievementUnlockType & { type: T }

// eslint-disable-next-line no-use-before-define
export type Achievement = keyof typeof Achievements.LIST

// eslint-disable-next-line no-use-before-define
export type AchievementType<ID extends Achievement> = (typeof Achievements.LIST)[ID]['type']

export class Achievements {

  static LIST = {
    snoozeReminder: Achievements.createStandart()
  } as const

  //

  private static createStandart(): AchievementDataTypeT<AchievementType.STANDART> {
    return { type: AchievementType.STANDART }
  }

  private static createCounter(count: number): AchievementDataTypeT<AchievementType.COUNTER> {
    return { type: AchievementType.COUNTER, count }
  }

  private static createCollect(collectables: string[]): AchievementDataTypeT<AchievementType.COLLECT> {
    return { type: AchievementType.COLLECT, collectables }
  }

  //

  public static async hasAchievement(userId: string, achievement: Achievement): Promise<boolean> {
    const data = await UserProfile.fetchProfileData(userId)
    return !!data?.achievements?.[achievement]?.unlocked
  }

}
