import { MessageComponentSelectOption, ReplyableComponentInteraction } from 'cordo'
import { GuildMember } from 'discord.js'
import { TudeBot } from '../..'
import { LanguageCode } from '../data/languages'
import SussyalienGame from './games/sussyalien'
import WerbinichGame from './games/werbinich'


export type GameInstance<State extends Object> = {
  uid: string
  game: string
  host: GuildMember
  players: GuildMember[]
  state: State
  created: Date
  finished: Date
  config: {
    language: LanguageCode
    playerSource: 'voice'
    [key: string]: string
  }
}

//

export type GameInfo = {
  id: string
  name: string
  descriptionShort: string
  descriptionLong: string
  icon: string,
  minPlayers: number,
  maxPlayers: number,
  languages: LanguageCode[]
  enabled: boolean
}

export type GameOption = {
  name: string
  description: string
  id: string
  options: MessageComponentSelectOption[]
}

export interface Game<State extends Object> {
  info: GameInfo
  options: GameOption[]

  createInitialState(): State
  startGame(instance: GameInstance<State>, i: ReplyableComponentInteraction): any
}

//

export class Gaming {

  public static allGames: Game<any>[] = [
    new WerbinichGame(),
    new SussyalienGame()
  ]

  public static runningGames: Map<string, GameInstance<any>> = new Map()

  public static launchGame(game: string, host: GuildMember): GameInstance<any> {
    const gameClass = Gaming.allGames.find(g => g.info.id === game)
    if (!gameClass) return null

    let uid = ''
    do uid = (~~(Math.random() * 0xFFFF)).toString(16).padStart(4, '0')
    while (Gaming.runningGames.has(uid))

    const instance: GameInstance<any> = {
      uid,
      game,
      host,
      players: [ host ],
      state: gameClass.createInitialState(),
      created: new Date(),
      finished: null,
      config: {
        language: gameClass.info.languages[0],
        playerSource: 'voice'
      }
    }
    for (const option of gameClass.options)
      instance.config[option.id] = option.options[0].value

    Gaming.runningGames.set(uid, instance)
    return instance
  }

  public static async relaunchGame(source: GameInstance<any>, i: ReplyableComponentInteraction) {
    const gameClass = Gaming.allGames.find(g => g.info.id === source.game)
    if (!gameClass) return

    const guild = await TudeBot.guilds.fetch(i.guild_id)
    if (!guild) return i.replyPrivately({ content: 'Something failed. Please try again. (1)' })

    const host = await guild.members.fetch(i.user.id)
    if (!host) return i.replyPrivately({ content: 'Something failed. Please try again. (2)' })

    let uid = ''
    do uid = (~~(Math.random() * 0xFFFF)).toString(16).padStart(4, '0')
    while (Gaming.runningGames.has(uid))

    const instance: GameInstance<any> = {
      uid,
      game: source.game,
      host,
      players: [ host ],
      state: gameClass.createInitialState(),
      created: new Date(),
      finished: null,
      config: {
        language: gameClass.info.languages[0],
        playerSource: 'voice'
      }
    }

    Gaming.runningGames.set(uid, instance)

    const game = this.getGameById(source.game)
    if (game.options.length) i.state('gaming_launch', instance, 1)
    else i.state('gaming_launch', instance, 2)
  }

  public static finishGame(instance: GameInstance<any>) {
    instance.finished = new Date()
    setTimeout(() => {
      this.runningGames.delete(instance.uid)
    }, 1000 * 60 * 3)
  }

  public static getGameById(game: string) {
    return Gaming.allGames.find(g => g.info.id === game)
  }

  public static getCustomId(instance: GameInstance<any>, func: (instance: GameInstance<any>, i: ReplyableComponentInteraction) => any): string {
    return `gaming_r_${instance.uid}_${func.name}`
  }

  public static gatekeepPlayers(instance: GameInstance<any>, i: ReplyableComponentInteraction): boolean {
    if (instance.players.some(p => p.id === i.user.id))
      return false

    i.replyPrivately({ content: 'You are not taking part in this game.' })
    return true
  }

}
