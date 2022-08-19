import { shuffleArray } from '../../utils/array-utils'
import { PlayingCard } from './playing-card'


export class PlayingCardDeck {

  public readonly cards: PlayingCard[]

  constructor(
    public readonly replicas = 1
  ) {
    for (let i = 0; i < replicas; i++)
      this.cards.push(...PlayingCard.getAllInstances())

    this.shuffle()
  }

  //

  public shuffle(): void {
    shuffleArray(this.cards)
  }

  public drawOne(): PlayingCard {
    return this.cards.pop()
  }

  public drawMultiple(amount: number): PlayingCard[] {
    return this.cards.splice(0, amount)
  }

  public addCards(...cards: PlayingCard[]): void {
    this.cards.push(...cards)
  }

  //

  public get size(): number {
    return this.cards.length
  }

}
