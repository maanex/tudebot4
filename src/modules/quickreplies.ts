import { GuildMember, TextChannel, Webhook } from 'discord.js'
import Database from '../database/database'
import { TudeBot } from '../index'
import { Module } from '../types/types'


export type Reply = {
  trigger: string[],
  response: string
}

export default class QuickRepliesModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Quick Replies', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('message', async (mes) => {
      if (!this.isMessageEventValid(mes)) return
      const prefix = this.guilds.get(mes.guild.id).prefix || '-'
      if (!mes.content.startsWith(prefix)) return

      const replies = await this.getReplies(mes.guild.id)
      if (!replies?.length) return

      const lookup = mes.content.toLowerCase().trim().substring(prefix.length)
      const reply = replies.find(r => r.trigger.includes(lookup))
      if (reply) {
        this.sendReply(mes.channel as TextChannel, mes.member, reply.response)
        if (mes.deletable) mes.delete()
      }
    })
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  //

  public async getReplies(serverId: string): Promise<Reply[]> {
    const res = await Database.collection('quickreplies').findOne({ _id: serverId })
    if (!res) return null
    return res.list
  }

  private async sendReply(channel: TextChannel, member: GuildMember, text: string) {
    const webhook = await this.allocateWebhook(channel)
    webhook.send(text, {
      avatarURL: member.user.avatarURL(),
      username: member.nickname || member.user.username
    })
  }

  private async allocateWebhook(channel: TextChannel): Promise<Webhook> {
    const existing = await channel.fetchWebhooks()
    if (existing.size)
      return existing.find(hook => (hook.owner as any)?.id === TudeBot.user.id) || channel.createWebhook('TudeBot Webhook')
    else
      return channel.createWebhook('TudeBot Webhook')
  }

}