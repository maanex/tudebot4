import { ReplyableCommandInteraction } from 'cordo'
import { TudeBot } from '../..'
import SecurityModule from '../../modules/security'


const KICK_CREDIT_MAX_AMOUNT = 10
const KICK_CREDIT_ADD_PER_INTERVAL = 1000 * 60 * 60
const kickCreditValue: Map<string, number> = new Map()
const kickCreditTime: Map<string, number> = new Map()


export default async function (i: ReplyableCommandInteraction) {
  const module = TudeBot.getModule<SecurityModule>('security')

  if (!i.member)
    return i.replyPrivately({ content: 'This command is not available here (1)' })
  if (!module.guilds.has(i.guild_id))
    return i.replyPrivately({ content: 'This command is not available here (2)' })

  const config = module.guilds.get(i.guild_id).commands.kick
  if (!config)
    return i.replyPrivately({ content: 'This command is not available here (3)' })

  const allowedRoles: string[] = config.allowedRoles
  const trusted: string = config.trusted

  if (!i.member.roles.some(e => allowedRoles.includes(e)))
    return i.replyPrivately({ content: 'You are not allowed to run this command' })

  const target = i.data.option.user as string
  const reason = i.data.option.reason as string
  const comment = i.data.option.comment as string || ''
  const guild = await TudeBot.guilds.fetch(i.guild_id)
  const member = await guild.members.fetch(target)
  const trustedRole = await guild.roles.fetch(trusted)

  if (!member)
    return i.replyPrivately({ content: 'Error, unable to fetch member. Please try again.' })

  const trustValue = member.roles.highest.comparePositionTo(trustedRole)
  if (trustValue >= 0)
    return i.replyPrivately({ content: 'You cannot kick this person as they\'re a trusted member.' })

  const credit = getKickCredit(i.user.id)
  if (credit <= 0)
    return i.replyPrivately({ content: 'Woahhh, slow down mate! You already kicked quite a few people in the past hour...\nIf anything is actually urgent please ping higher staff members for help!' })

  useKickCredit(i.user.id)

  member.kick(`Mod: ${i.user.username} (${i.user.id}) • Reason: ${reason} • Comment: ${comment || '<none>'}`)
  TudeBot.modlog(guild, 'punish', `<@${i.user.id}> kicked ${member.toString()} for reason: ${reason}${comment ? `\nComment: ${comment}` : ''}`)

  i.reply({ content: `<@${target}> was yeeted out of this server for reason \`${reason}\`` })
}

function getKickCredit(id: string): number {
  const delta = kickCreditTime.has(id)
    ? Date.now() - kickCreditTime.get(id)
    : 0

  const val = kickCreditValue.has(id)
    ? kickCreditValue.get(id)
    : KICK_CREDIT_MAX_AMOUNT

  const out = val + ~~(delta / KICK_CREDIT_ADD_PER_INTERVAL)

  return Math.min(out, KICK_CREDIT_MAX_AMOUNT)
}

function useKickCredit(id: string) {
  kickCreditTime.set(id, Date.now())
  kickCreditValue.set(id, getKickCredit(id) - 1)
}

