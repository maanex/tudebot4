/* eslint-disable no-multi-spaces,indent */

export type ProfileEmblemSet = 'DEFAULT' | 'MONOCHROME';
export interface ProfileEmblems {
  readonly COOKIES: string;
  readonly GEMS: string;
  readonly KEYS: string;
  readonly ITEMS: string;
  readonly POINTS: string;
  readonly STREAK: string;
}

export type ProfileBarSet = 'DEFAULT' | 'BLUE';
export interface ProfileBars {
  readonly LEFT_EMPTY: string;
  readonly LEFT_HALF: string;
  readonly LEFT_FULL: string;
  readonly MIDDLE_EMPTY: string;
  readonly MIDDLE_1: string;
  readonly MIDDLE_2: string;
  readonly MIDDLE_3: string;
  readonly RIGHT_EMPTY: string;
  readonly RIGHT_HALF: string;
  readonly RIGHT_FULL: string;
}


export default class Emojis {

  public static readonly             BIG_SPACE = '<:nothing:409254826938204171>';
  public static readonly         HIDE_THE_PAIN = '<:hidethepain:655169782806609921>';
  public static readonly              NOT_COOL = '<:not_cool:490591156019920907>';
  public static readonly                ME_IRL = '<:meirl:496357154199044097>';
  public static readonly                  DOOT = '<:doot:496770649562415115>';
  public static readonly      UNO_REVERSE_CARD = '<:reverse:497129079322181643>';
  public static readonly DETRIOIT_BECOME_HUMAN = '<:DetroitBecomeHuman:497137159350779904>';
  public static readonly                 ALARM = '<a:ALARM:531531710903615518>';
  public static readonly              SOCKPING = '<a:sockangry:531531711163531274>';
  public static readonly               LOADING = '<a:loading:706146454531473479>';

  public static readonly COOKIES_MONOCHROME = '<:cookies:681503976192999437>';
  public static readonly            COOKIES = '<:ccookies:681503976197586944>';
  public static readonly    GEMS_MONOCHROME = '<:gems:681503976407302148>';
  public static readonly               GEMS = '<:cgems:681503975857848331>';
  public static readonly    KEYS_MONOCHROME = '<:keys:681504362845175820>';
  public static readonly               KEYS = '<:ckeys:681503976406908944>';
  public static readonly   ITEMS_MONOCHROME = '<:items:681509921283375186>';
  public static readonly              ITEMS = '<:citems:681509921136836623>';
  public static readonly  POINTS_MONOCHROME = '<:mpoints:681782061295599637>';
  public static readonly             POINTS = '<:points:681782061312638976>';
  public static readonly  STREAK_MONOCHROME = ':flame:';
  public static readonly             STREAK = ':flame:';

  public static readonly PROFILE_EMBLEMS: { [name: string]: ProfileEmblems } = {
    DEFAULT: {
      COOKIES: Emojis.COOKIES,
      GEMS: Emojis.GEMS,
      KEYS: Emojis.KEYS,
      ITEMS: Emojis.ITEMS,
      POINTS: Emojis.POINTS,
      STREAK: Emojis.STREAK
    },
    MONOCHROME: {
      COOKIES: Emojis.COOKIES_MONOCHROME,
      GEMS: Emojis.GEMS_MONOCHROME,
      KEYS: Emojis.KEYS_MONOCHROME,
      ITEMS: Emojis.ITEMS_MONOCHROME,
      POINTS: Emojis.POINTS_MONOCHROME,
      STREAK: Emojis.STREAK_MONOCHROME
    }
  }

  public static readonly PROFILE_BARS: { [name: string]: ProfileBars } = {
    DEFAULT: {
        LEFT_EMPTY: '<:xpbarleftempty:654357985845575716>',
         LEFT_HALF: '<:xpbarlefthalf:654353598301339668>',
         LEFT_FULL: '<:xpbarleftfull:654353598603460609>',
      MIDDLE_EMPTY: '<:xpbarmiddleempty:654353598087430174>',
          MIDDLE_1: '<:xpbarmiddle1:654353598288887840>',
          MIDDLE_2: '<:xpbarmiddle2:654353598230167574>',
          MIDDLE_3: '<:xpbarmiddle3:654353597819256843>',
       RIGHT_EMPTY: '<:xpbarrightempty:654353598263853066>',
        RIGHT_HALF: '<:xpbarrighthalf:654353597999611908>',
        RIGHT_FULL: '<:xpbarrightfull:654353598204870656>'
    },
    BLUE: { // TODO
        LEFT_EMPTY: '<:xpbarleftempty:654357985845575716>',
         LEFT_HALF: '<:xpbarlefthalf:654353598301339668>',
         LEFT_FULL: '<:xpbarleftfull:654353598603460609>',
      MIDDLE_EMPTY: '<:xpbarmiddleempty:654353598087430174>',
          MIDDLE_1: '<:xpbarmiddle1:654353598288887840>',
          MIDDLE_2: '<:xpbarmiddle2:654353598230167574>',
          MIDDLE_3: '<:xpbarmiddle3:654353597819256843>',
       RIGHT_EMPTY: '<:xpbarrightempty:654353598263853066>',
        RIGHT_HALF: '<:xpbarrighthalf:654353597999611908>',
        RIGHT_FULL: '<:xpbarrightfull:654353598204870656>'
    }
  }

  public static readonly MODLOG = {
     user_join: '<:user_join:536593880271814656>',
     user_quit: '<:user_quit:536593879940595732>',
       message: '<:message:536593879865098251>',
    clean_chat: '<:cleanchat:536595613412753419>',
       diverse: '<:diverse:536598631394967562>',
        punish: '<:punish:536848046852538368>',
       warning: '<:warning:536888614903349258>',
        reload: '<:reload:536892027300741121'
  }

}
