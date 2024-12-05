import { ReplyableCommandInteraction } from 'cordo'
import { TudeBot } from '../..'
import SecurityModule from '../../modules/security'
import { TextBasedChannel } from 'discord.js'


const CLEANUP_CREDIT_MAX_AMOUNT = 10
const CLEANUP_CREDIT_ADD_PER_INTERVAL = 1000 * 60 * 60
const cleanupCreditValue: Map<string, number> = new Map()
const cleanupCreditTime: Map<string, number> = new Map()


export default async function (i: ReplyableCommandInteraction) {
  const module = TudeBot.getModule<SecurityModule>('security')

  if (!i.member)
    return i.replyPrivately({ content: 'This command is not available here (1)' })
  if (!module.guilds.has(i.guild_id))
    return i.replyPrivately({ content: 'This command is not available here (2)' })

  const config = module.guilds.get(i.guild_id).commands.cleanup
  if (!config)
    return i.replyPrivately({ content: 'This command is not available here (3)' })

  const allowedRoles: string[] = config.allowedRoles
  const trusted: string = config.trusted

  if (!i.member.roles.some(e => allowedRoles.includes(e)))
    return i.replyPrivately({ content: 'You are not allowed to run this command' })

  const amount = i.data.option.amount as number
  const reason = i.data.option.reason as string
  const comment = i.data.option.comment as string || ''
  const filterUser = i.data.option.filter_user as string
  const filterContains = i.data.option.filter_contains as string
  const filterRegex = i.data.option.filter_regex as string
  const guild = await TudeBot.guilds.fetch(i.guild_id)
  const trustedRole = await guild.roles.fetch(trusted)

  const credit = getCleanupCredit(i.user.id)
  if (credit <= 0)
    return i.replyPrivately({ content: 'Woahhh, slow down mate! You already kicked quite a few people in the past hour...\nIf anything is actually urgent please ping higher staff members for help!' })

  const channel = await TudeBot.channels.fetch(i.channel_id) as TextBasedChannel
  const messageCollection = await channel.messages.fetch()
  let messages = [ ...messageCollection.values() ]

  if (filterUser)
    messages = messages.filter(m => m.author.id === filterUser)

  if (filterContains)
    messages = messages.filter(m => m.content.toLowerCase().includes(filterContains.toLowerCase()))

  if (filterRegex) {
    const ex = new RegExp(filterRegex)
    messages = messages.filter(m => ex.test(m.content))
  }

  messages = messages.slice(0, amount)

  for (const message of messages) {
    const trustValue = message.member.roles.highest.comparePositionTo(trustedRole)
    if (trustValue >= 0) continue
    if (!message.deletable) continue

    await message.delete()
    await new Promise(res => setTimeout(res, 200))
  }

  useCleanupCredit(i.user.id)

  TudeBot.modlog(guild, 'punish', `<@${i.user.id}> cleaned up ${messages.length} messages in <#${channel.id}> for reason: ${reason}${filterUser ? `\nFilter User: ${filterUser}` : ''}${filterContains ? `\nFilter Contains: ${filterContains}` : ''}${filterRegex ? `\nFilter RegEx: ${filterRegex}` : ''}${comment ? `\nComment: ${comment}` : ''}`)

  i.replyPrivately({ content: `Attempted to delete ${messages.length} matched messages :+1:` })
}

function getCleanupCredit(id: string): number {
  const delta = cleanupCreditTime.has(id)
    ? Date.now() - cleanupCreditTime.get(id)
    : 0

  const val = cleanupCreditValue.has(id)
    ? cleanupCreditValue.get(id)
    : CLEANUP_CREDIT_MAX_AMOUNT

  const out = val + ~~(delta / CLEANUP_CREDIT_ADD_PER_INTERVAL)

  return Math.min(out, CLEANUP_CREDIT_MAX_AMOUNT)
}

function useCleanupCredit(id: string) {
  cleanupCreditTime.set(id, Date.now())
  cleanupCreditValue.set(id, getCleanupCredit(id) - 1)
}

