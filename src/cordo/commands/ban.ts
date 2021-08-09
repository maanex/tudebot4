import { ReplyableCommandInteraction } from 'cordo'
import { TudeBot } from '../..'
import CommandsModule from '../../modules/commands'


const BAN_CREDIT_MAX_AMOUNT = 10
const BAN_CREDIT_ADD_PER_INTERVAL = 1000 * 60 * 60
const banCreditValue: Map<string, number> = new Map()
const banCreditTime: Map<string, number> = new Map()


export default async function (i: ReplyableCommandInteraction) {
  const module = TudeBot.getModule<CommandsModule>('commands')

  if (!i.member)
    return i.replyPrivately({ content: 'This command is not available here (1)' })
  if (!module.guilds.has(i.guild_id))
    return i.replyPrivately({ content: 'This command is not available here (2)' })

  const config = module.guilds.get(i.guild_id).ban
  if (!config)
    return i.replyPrivately({ content: 'This command is not available here (3)' })

  const allowedRoles: string[] = config.allowedRoles
  const trusted: string = config.trusted

  if (!i.member.roles.some(e => allowedRoles.includes(e)))
    return i.replyPrivately({ content: 'You are not allowed to run this command' })

  const target = i.data.option.user as string
  const reason = i.data.option.reason as string
  const clear = i.data.option.clear as string || '0'
  const comment = i.data.option.comment as string || ''
  const guild = await TudeBot.guilds.fetch(i.guild_id)
  const member = await guild.members.fetch(target)
  const trustedRole = await guild.roles.fetch(trusted)

  if (!member)
    return i.replyPrivately({ content: 'Error, unable to fetch member. Please try again.' })

  const trustValue = member.roles.highest.comparePositionTo(trustedRole)
  if (trustValue >= 0)
    return i.replyPrivately({ content: 'You cannot ban this person as they\'re a trusted member.' })

  const credit = getBanCredit(i.user.id)
  if (credit <= 0)
    return i.replyPrivately({ content: 'Woahhh, slow down mate! You already banned quite a few people in the past hour...\nIf anything is actually urgent please ping higher staff members for help!' })

  useBanCredit(i.user.id)

  member.ban({ reason: `Mod: ${i.user.username} (${i.user.id}) • Reason: ${reason} • Cleared ${clear} days • Comment: ${comment || '<none>'}`, days: parseInt(clear) })
  TudeBot.modlog(guild, 'punish', `<@${i.user.id}> banned ${member.toString()} for reason: ${reason}${comment ? `\nComment: ${comment}` : ''}`)

  i.reply({ content: `<@${target}> was expelled this server with reason \`${reason}\`` })
}

function getBanCredit(id: string): number {
  const delta = banCreditTime.has(id)
    ? Date.now() - banCreditTime.get(id)
    : 0

  const val = banCreditValue.has(id)
    ? banCreditValue.get(id)
    : BAN_CREDIT_MAX_AMOUNT

  const out = val + ~~(delta / BAN_CREDIT_ADD_PER_INTERVAL)

  return Math.min(out, BAN_CREDIT_MAX_AMOUNT)
}

function useBanCredit(id: string) {
  banCreditTime.set(id, Date.now())
  banCreditValue.set(id, getBanCredit(id) - 1)
}

