import { TextChannel, Webhook } from 'discord.js'
import { TudeBot } from '..'


export default class Webhooks {

  public static async allocateWebhook(channel: TextChannel): Promise<Webhook> {
    const existing = await channel.fetchWebhooks()
    if (existing.size)
      return existing.find(hook => (hook.owner as any)?.id === TudeBot.user.id) || channel.createWebhook('TudeBot Webhook')
    else
      return channel.createWebhook('TudeBot Webhook')
  }

}
