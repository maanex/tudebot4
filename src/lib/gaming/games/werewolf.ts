/* eslint-disable no-irregular-whitespace */
import { ReplyableComponentInteraction } from 'cordo'
import { Game, GameInfo, GameInstance, GameOption } from '../gaming'


type State = {
}


export default class WerewolfGame implements Game<State> {

  public info: GameInfo = {
    id: 'werewolf',
    name: 'Werwolf',
    descriptionShort: 'TODO',
    descriptionLong: 'Die sonst so dunklen Gassen Tudlingens werden vom hellen Schein des Vollmondes erleuchtet. Es herrscht totenstille, wärend die Dorfbewohner ängstlich in ihren Häusern sitzen. Vollmond bedeutet Werwölfe.',
    icon: '🐺',
    minPlayers: 3,
    maxPlayers: 20,
    languages: [ 'de' ],
    estTime: '2-30 min',
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
