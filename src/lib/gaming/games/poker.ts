/* eslint-disable no-irregular-whitespace */
import { ReplyableComponentInteraction } from 'cordo'
import { PlayingCard } from '../common/playing-card'
import { PlayingCardDeck } from '../common/playing-card-deck'
import { Game, GameInfo, GameInstance, GameOption } from '../gaming'


type State = {
  deck: PlayingCardDeck
  players: Record<string, {
    cards: PlayingCard[]
  }>
}


export default class PokerGame implements Game<State> {

  public info: GameInfo = {
    id: 'poker',
    name: 'Poker',
    descriptionShort: 'TODO',
    descriptionLong: 'LA, 1973. You are entering the Casino with a brand new smoking and a pocket full of cash. Time to play the big tables.',
    icon: '🪙',
    minPlayers: 2,
    maxPlayers: 20,
    languages: [ 'en' ],
    estTime: '20-120 min',
    enabled: false
  }

  public options: GameOption[] = [
  ]

  createInitialState(): State {
    return {
      deck: null,
      players: {}
    }
  }

  startGame(_instance: GameInstance<State>, _i: ReplyableComponentInteraction) {
  }

}
