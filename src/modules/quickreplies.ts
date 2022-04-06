import { GuildMember, Message, TextChannel, Webhook } from 'discord.js'
import * as fuzzy from 'fuzzy'
import { QuickRepliesMainPageData } from '../cordo/states/quickreplies/main'
import Database from '../database/database'
import { TudeBot } from '../index'
import { runGpl } from '../lib/gpl-wrapper'
import { Module } from '../types/types'


export type Reply = {
  id: string
  trigger: string[]
  response: string
  saveChanges()
}

export type ResponseType = 'text' | 'gpl'

export default class QuickRepliesModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Quick Replies', '🗣️', 'Write less, achieve more', 'With this module you can create and edit quick replies which you can then easily trigger using their keyword. The bot will then replace your message with the longer text you have set up previously.', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('message', mes => this.onMessage(mes))
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  //

  public get itemsPerPage(): number {
    return 5
  }

  public async getPageDataForGuildId(guildId: string, page: number): Promise<QuickRepliesMainPageData> {
    const guild = await TudeBot.guilds.fetch(guildId)
    const allReplies = await this.getReplies(guildId)
    const replies = page < 0
      ? allReplies
      : this.getRepliesSubset(allReplies, page)

    return {
      guild,
      pageIndex: page,
      pageCount: Math.ceil(allReplies.length / this.itemsPerPage) || 1,
      replies
    }
  }

  public getRepliesSubset(replies: Reply[], pageIndex: number): Reply[] {
    return replies.slice(pageIndex * this.itemsPerPage, (pageIndex + 1) * this.itemsPerPage)
  }

  //

  private async onMessage(mes: Message) {
    if (!this.isMessageEventValid(mes)) return
    const prefix = this.guilds.get(mes.guild.id).prefix || '-'
    if (!mes.content.startsWith(prefix)) return

    const replies = await this.getReplies(mes.guild.id)
    if (!replies?.length) return

    const lookup = mes.content.toLowerCase().trim().substring(prefix.length)
    const reply = this.findMatch(replies, lookup)
    if (reply) {
      if (mes.deletable) mes.delete()
      const compiled = await QuickRepliesModule.buildReponse(reply.response)
      this.sendReply(mes.channel as TextChannel, mes.member, compiled)
    }
  }

  private findMatch(replies: Reply[], lookup: string): Reply {
    const directHit = replies.find(r => r.trigger.includes(lookup))
    if (directHit) return directHit

    const list = replies.flatMap((r, i) => r.trigger.map(t => [ t, i ]))
    const opts: fuzzy.FilterOptions<any[]> = { extract: t => t[0] }
    const results = fuzzy.filter(lookup, list, opts)

    if (!results.length) return null
    if (results[0].score < results[0].string.length / 2) return null
    return replies[results[0].original[1]]
  }

  private cache: Map<string, Reply[]> = new Map()

  public async getReplies(serverId: string): Promise<Reply[]> {
    if (this.cache.has(serverId))
      return this.cache.get(serverId)

    const res: { id: string, list: Reply[] } = await Database
      .collection('quickreplies')
      .findOne({ _id: serverId })
    if (!res) return []

    const saveChanges = () => {
      Database.collection('quickreplies').updateOne(
        { _id: serverId },
        { $set: { list: res.list } }
      )
    }

    for (const i of res.list) {
      i.saveChanges = saveChanges

      // id polyfill
      if (i.id) continue
      i.id = i
        ?.trigger[0]
        .toLowerCase()
        .trim()
        .replace(/\W/g, '') ?? '_'
    }

    this.cache.set(serverId, res.list)
    return res.list
  }

  public async addReply(serverId: string, trigger: string[], response: string): Promise<void> {
    const i: Reply = {
      id: trigger[0]
        .toLowerCase()
        .trim()
        .replace(/\W/g, '') ?? '_',
      trigger,
      response,
      saveChanges: null
    }

    const replies = await this.getReplies(serverId)
    if (replies) {
      i.saveChanges = replies.length
        ? replies[0].saveChanges
        : i.saveChanges = () => {
          Database.collection('quickreplies').updateOne(
            { _id: serverId },
            { $set: { replies } }
          )
        }

      replies.push(i)
      i.saveChanges()
      return
    }

    const list = [ i ]

    i.saveChanges = () => {
      Database.collection('quickreplies').updateOne(
        { _id: serverId },
        { $set: { list } }
      )
    }

    Database.collection('quickreplies').insertOne({
      _id: serverId,
      list
    })

    this.cache.set(serverId, list)
  }

  public async removeReply(serverId: string, id: string): Promise<void> {
    const replies = await this.getReplies(serverId)
    if (!replies) return
    const index = replies.findIndex(r => r.id === id)
    if (index < 0) return
    replies.splice(index, 1)

    Database.collection('quickreplies').updateOne(
      { _id: serverId },
      { $set: { list: replies } }
    )
  }

  private async sendReply(channel: TextChannel, member: GuildMember, text: string) {
    if (!text) return

    const webhook = await this.allocateWebhook(channel)
    webhook.send({
      content: text,
      avatarURL: member.user.avatarURL(),
      username: member.nickname || member.user.username,
      allowedMentions: { parse: [] }
    })
  }

  private async allocateWebhook(channel: TextChannel): Promise<Webhook> {
    const existing = await channel.fetchWebhooks()
    if (existing.size)
      return existing.find(hook => (hook.owner as any)?.id === TudeBot.user.id) || channel.createWebhook('TudeBot Webhook')
    else
      return channel.createWebhook('TudeBot Webhook')
  }

  //

  public static getTypeOfResponse(res: string): ResponseType {
    if (res.startsWith('[[gpl]]\n')) return 'gpl'
    return 'text'
  }

  public static buildReponse(res: string): Promise<string> {
    if (!/\[\[\w+\]\]\n/gm.test(res)) return Promise.resolve(res)
    const type = QuickRepliesModule.getTypeOfResponse(res)
    res = res.split('\n').slice(1).join('\n')

    if (type === 'gpl')
      return runGpl(res)

    return Promise.resolve(res)
  }

}
