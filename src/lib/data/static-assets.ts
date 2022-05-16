

const assets = {
  emblem_achievements: 'https://cdn.discordapp.com/attachments/975750923911581696/975754119589560380/emblem_achievements.png',
  emblem_reminder: 'https://cdn.discordapp.com/attachments/975750923911581696/975761852615254056/emblem_reminder.png'
}

export type Asset = keyof typeof assets

export default class StaticAssets {

  public static get(name: Asset): string {
    return assets[name] ?? ''
  }

}
