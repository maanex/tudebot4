/* eslint-disable no-irregular-whitespace */
import { ReplyableComponentInteraction } from 'cordo'
import { Game, GameInfo, GameInstance, GameOption } from '../gaming'


type State = {
}


export default class BlackjackGame implements Game<State> {

  public info: GameInfo = {
    id: 'blackjack',
    name: 'Black Jack',
    descriptionShort: 'TODO',
    descriptionLong: 'LA, 1974. You are entering the Casino with an old smoking and $5. Time to play the small tables.',
    icon: '🃏',
    minPlayers: 1,
    maxPlayers: 20,
    languages: [ 'en' ],
    estTime: '1-20 min',
    enabled: false
  }

  public options: GameOption[] = [
  ]

  createInitialState(): State {
    return {
    }
  }

  startGame(_instance: GameInstance<State>, _i: ReplyableComponentInteraction) {
  }

}
