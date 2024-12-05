import { ChannelType, TextChannel, ThreadChannel, Webhook } from 'discord.js'
import { TudeBot } from '..'


export default class Webhooks {

  public static async allocateWebhook(channel: TextChannel | ThreadChannel, nested = false): Promise<Webhook> {
    if (channel.isThread()) {
      if (nested) return null
      return this.allocateWebhook((channel.parent as TextChannel), true)
    }

    const existing = await (channel as TextChannel).fetchWebhooks()
    if (existing.size)
      return existing.find(hook => (hook.owner as any)?.id === TudeBot.user.id) || (channel as TextChannel).createWebhook({ name: 'TudeBot Webhook' })
    else
      return (channel as TextChannel).createWebhook({ name: 'TudeBot Webhook' })
  }

}
