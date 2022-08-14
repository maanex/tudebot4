import { ReplyableComponentInteraction } from 'cordo'
import { Game, GameInfo, GameInstance, GameOption } from '../gaming'


type State = {
}

export default class SussyalienGame implements Game<State> {

  public info: GameInfo = {
    id: 'sussyalien',
    name: 'Sussy Alien',
    descriptionShort: 'TODO',
    descriptionLong: 'You are in a spaceship but something is sussy. You suspect there are imposers among us :scream:\nYour entire crew gets put on a test to find and eliminate the aliens.',
    icon: '👽',
    minPlayers: 3,
    maxPlayers: 20,
    languages: [ 'en', 'de' ],
    enabled: false
  }

  public options: GameOption[] = [
    {
      name: 'Alien Count',
      id: 'alien_count',
      description: 'How many aliens are among us.',
      options: [
        {
          label: 'One',
          value: '1',
          default: true
        },
        {
          label: 'Two',
          value: '2'
        },
        {
          label: 'Three',
          value: '3'
        },
        {
          label: 'Random between 0 and 1',
          value: 'rand_0_1'
        },
        {
          label: 'Random between 0 and 2',
          value: 'rand_0_2'
        },
        {
          label: 'Random between 0 and 3',
          value: 'rand_0_3'
        },
        {
          label: 'Random between 1 and 2',
          value: 'rand_1_2'
        },
        {
          label: 'Random between 1 and 3',
          value: 'rand_1_3'
        }
      ]
    }
  ]

  createInitialState(): any {
    return {
    }
  }

  startGame(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
  }

}
