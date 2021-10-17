
export default class Emojis {

  private static readonly regionalIndicators = '🇦,🇧,🇨,🇩,🇪,🇫,🇬,🇭,🇮,🇯,🇰,🇱,🇲,🇳,🇴,🇵,🇶,🇷,🇸,🇹,🇺,🇻,🇼,🇽,🇾,🇿'.split(',')

  public readonly string

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly animated: boolean = false,
    string?: string
  ) {
    this.string = string || `<${this.animated ? 'a' : ''}:${this.name}:${this.id}>`
  }

  toObject(): ({ name: string } | { id: string }) {
    if (this.id) return { id: this.id }
    else return { name: this.name }
  }

  toString(): string {
    return this.string
  }

  //

  public static fromFlagName(name: string): Emojis {
    const char = name
      .split(':')
      .join('')
      .split('_')[1]
      .toLowerCase()
      .split('')
      .reduce((str, char) => (str + (Emojis.regionalIndicators[char.charCodeAt(0) - 97] || '')), '')
    return new Emojis(null, name, false, char)
  }

  //

  public static readonly bigSpace = new Emojis('409254826938204171', 'nothing')
  public static readonly hideThePain = new Emojis('655169782806609921', 'hidethepain')
  public static readonly notCool = new Emojis('490591156019920907', 'not_cool')
  public static readonly meIrl = new Emojis('496357154199044097', 'meirl')
  public static readonly doot = new Emojis('496770649562415115', 'doot')
  public static readonly unoReverse = new Emojis('497129079322181643', 'reverse')
  public static readonly detroitBecomeHuman = new Emojis('497137159350779904', 'DetroitBecomeHuman')
  public static readonly alarm = new Emojis('531531710903615518', ':')
  public static readonly sockping = new Emojis('531531711163531274', ':')
  public static readonly loading = new Emojis('706146454531473479', ':')
  public static readonly cookiesMono = new Emojis('681503976192999437', 'cookies')
  public static readonly cookies = new Emojis('681503976197586944', 'ccookies')
  public static readonly gemsMono = new Emojis('681503976407302148', 'gems')
  public static readonly gems = new Emojis('681503975857848331', 'cgems')
  public static readonly keysMono = new Emojis('681504362845175820', 'keys')
  public static readonly keys = new Emojis('681503976406908944', 'ckeys')
  public static readonly itemsMono = new Emojis('681509921283375186', 'items')
  public static readonly items = new Emojis('681509921136836623', 'citems')
  public static readonly pointsMono = new Emojis('681782061295599637', 'mpoints')
  public static readonly points = new Emojis('681782061312638976', 'points')
  public static readonly streakMono = new Emojis('', '🔥', false, '🔥')
  public static readonly streak = new Emojis('', '🔥', false, '🔥')
  public static readonly leftCaret = new Emojis('', '🔥', false, '🔥') // TODO

  public static readonly progressBar = {
    LEFT_EMPTY: new Emojis('654357985845575716', 'xpbarleftempty'),
    LEFT_HALF: new Emojis('654353598301339668', 'xpbarlefthalf'),
    LEFT_FULL: new Emojis('654353598603460609', 'xpbarleftfull'),
    MIDDLE_EMPTY: new Emojis('654353598087430174', 'xpbarmiddleempty'),
    MIDDLE_1: new Emojis('654353598288887840', 'xpbarmiddle1'),
    MIDDLE_2: new Emojis('654353598230167574', 'xpbarmiddle2'),
    MIDDLE_3: new Emojis('654353597819256843', 'xpbarmiddle3'),
    RIGHT_EMPTY: new Emojis('654353598263853066', 'xpbarrightempty'),
    RIGHT_HALF: new Emojis('654353597999611908', 'xpbarrighthalf'),
    RIGHT_FULL: new Emojis('654353598204870656', 'xpbarrightfull')
  }

  public static readonly modlog = {
    userJoin: new Emojis('536593880271814656', 'user_join'),
    userQuit: new Emojis('536593879940595732', 'user_quit'),
    message: new Emojis('536593879865098251', 'message'),
    cleanChat: new Emojis('536595613412753419', 'cleanchat'),
    diverse: new Emojis('536598631394967562', 'diverse'),
    punish: new Emojis('536848046852538368', 'punish'),
    warning: new Emojis('536888614903349258', 'warning'),
    reload: new Emojis('536892027300741121', 'reload')
  }

  public static readonly status = {
    error: new Emojis('872838728039665714', 'status_error'),
    info: new Emojis('872838728115159061', 'status_info'),
    neutral: new Emojis('872838728043868161', 'status_neutral'),
    ok: new Emojis('872838727884484645', 'status_ok'),
    warning: new Emojis('872838727884484642', 'status_warning')
  }

}
