/* eslint-disable no-irregular-whitespace */
import { ReplyableComponentInteraction } from 'cordo'
import { Game, GameInfo, GameInstance, GameOption } from '../gaming'


type State = {
}


export default class ThesplitGame implements Game<State> {

  public info: GameInfo = {
    id: 'thesplit',
    name: 'The Split',
    descriptionShort: 'TODO',
    descriptionLong: 'Split them in half. Or in 2/3. Or in 7/23. Or any other raito.',
    icon: '🤲',
    minPlayers: 4,
    maxPlayers: 20,
    languages: [ 'en' ],
    estTime: '2 min',
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
