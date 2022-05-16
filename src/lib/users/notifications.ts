import { MessageEmbed as DjsMessageEmbed } from 'discord.js'
import { MessageEmbed as CordoMessageEmbed } from 'cordo'
import StaticAssets, { Asset } from '../data/static-assets'
import Localisation from '../localisation'
import Const from '../data/const'
import { Achievements } from './achievements'

export type Notification = {
  title?: string
  header?: string
  icon?: Asset
  image?: string
  color?: number
  description?: string
}

type MessageEmbed = Partial<DjsMessageEmbed> & CordoMessageEmbed

export default class Notifications {

  public static buildEmbed(not: Notification, preCompile = false): MessageEmbed {
    const out = {
      author: not.header
        ? {
            name: not.header,
            icon_url: not.icon ? StaticAssets.get(not.icon) : undefined
          }
        : undefined,
      description: !not.description
        ? `> **${Localisation.text('en-US', not.title)}**`
        : !not.title
            ? `> ${Localisation.text('en-US', not.description)}`
            : `> **${Localisation.text('en-US', not.title)}**\n> ${Localisation.text('en-US', not.description)}`,
      color: not.color,
      thumbnail: not.image ? { url: not.image } : undefined
    }

    if (preCompile) {
      out.color = Const.embedColor
      Localisation.translateObject(out, 'en-US', {}, 3)
    }

    return out
  }

  //

  public static createUnlockNotification(name: Achievements.Name): Notification {
    return {
      header: '=notification_achievement_unlocked',
      icon: 'emblem_achievements',
      title: `=achievement_${name.toLocaleLowerCase()}_name`,
      description: `=achievement_${name.toLocaleLowerCase()}_desc`
    }
  }

  public static createReminderNotification(description: string): Notification {
    return {
      header: '=notification_reminder',
      icon: 'emblem_reminder',
      description
    }
  }

}
