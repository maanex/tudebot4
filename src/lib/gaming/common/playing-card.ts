

export type PlayingCardNumber = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'J' | 'Q' | 'K' | 'A'
export type PlayingCardColor = 'hearts' | 'diamonds' | 'spades' | 'clubs'


const emojis = {
  hearts: '<:hearts:661657523878625295>',
  diamonds: '<:diamonds:661657523820036106>',
  spades: '<:spades:661657523333496854>',
  clubs: '<:clubs:661657523756990524>',
  numBlack: {
    2: '<:b2:661659488872300584>',
    3: '<:b3:661659488562184195>',
    4: '<:b4:661659488847134720>',
    5: '<:b5:661659488897728522>',
    6: '<:b6:661659488947929098>',
    7: '<:b7:661659488528367655>',
    8: '<:b8:661659488821968981>',
    9: '<:b9:661659488595738675>',
    J: '<:bJ:661659488750927902>',
    Q: '<:bQ:661659488872562718>',
    K: '<:bK:661659488863911936>',
    A: '<:bA:661659488411058180>'
  },
  numRed: {
    2: '<:r2:661660240168878100>',
    3: '<:r3:661660240198238208>',
    4: '<:r4:661660239757836291>',
    5: '<:r5:661660240160358418>',
    6: '<:r6:661660240231661578>',
    7: '<:r7:661660240235855912>',
    8: '<:r8:661660240093380626>',
    9: '<:r9:661660240382525466>',
    J: '<:rJ:661660239929671741>',
    Q: '<:rQ:661660240252633105>',
    K: '<:rK:661660240227467264>',
    A: '<:rA:661660239975809085>'
  }
} as const


export class PlayingCard {

  // eslint-disable-next-line no-useless-constructor
  constructor(
    public readonly number: PlayingCardNumber,
    public readonly color: PlayingCardColor
  ) { }

  public static getAllInstances(): PlayingCard[] {
    const out = []
    for (const color of [ 'hearts', 'diamonds', 'spades', 'clubs' ] as const) {
      for (const number of [ 2, 3, 4, 5, 6, 7, 8, 9, 'J', 'Q', 'K', 'A' ] as const)
        out.push(new PlayingCard(number, color))
    }
    return out
  }

  //

  public isBlack(): boolean {
    return this.color === 'spades' || this.color === 'clubs'
  }

  public isRed(): boolean {
    return !this.isBlack()
  }

  public get emoji(): string {
    return emojis[this.isBlack() ? 'numBlack' : 'numRed'][this.number] + emojis[this.color]
  }

  public toString(): string {
    return this.emoji
  }

  public get numericValue(): number {
    switch (this.number) {
      case 'A': return 13
      case 'K': return 12
      case 'Q': return 11
      case 'J': return 10
      default: return this.number
    }
  }

  //

  public compareTo(card: PlayingCard): number {
    return this.numericValue - card.numericValue
  }

  public isBetterThan(card: PlayingCard): boolean {
    const diff = this.compareTo(card)
    if (diff > 0) return true
    if (diff < 0) return false
    return this.color[0] < card.color[0] // alphabetical order of color
  }

  public equalsNumber(card: PlayingCard): boolean {
    return this.number === card.number
  }

  public equalsColor(card: PlayingCard): boolean {
    return this.color === card.color
  }

  public equals(card: PlayingCard): boolean {
    return this.equalsNumber(card) && this.equalsColor(card)
  }

}
