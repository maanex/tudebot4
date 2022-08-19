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
    estTime: '5 min',
    enabled: false
  }

  public options: GameOption[] = [
  ]

  createInitialState(): State {
    return {
    }
  }

  startGame(_instance: GameInstance<State>, _i: ReplyableComponentInteraction) {
    // idee:
    // jeder spieler bekommt ein verhältniss, also z.b. 3/7
    // dabei ist das /7 immer die anzahl der anderen spieler
    // dann muss eine entweder oder frage gestellt werden, bei der die anderen spieler in diesem verhältnis antworten
    // z.b. 1/4 -> "ananas auf pizza?" -> hoffentlich einer ja, 3 nein
  }


  /*
    The best place to ____1 is: ____2  _____3
      eat burgers
      watch movies
      see your friends
      hang out
      make love
      tickle someone
      get a tatoo

      school
      a bathroom
      at home
      the pub

  */

}
