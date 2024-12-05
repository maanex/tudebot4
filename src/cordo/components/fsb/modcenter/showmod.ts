import { ComponentType, InteractionComponentFlag, ReplyableCommandInteraction, TextInputStyle } from 'cordo'
import { TudeBot } from '../../../..'
import { ModcenterConst } from './_const'


export default async function (i: ReplyableCommandInteraction) {
  const djsGuild = await TudeBot.guilds.fetch(i.guild.id)
  if (!djsGuild) return i.replyPrivately({ content: 'Something went wrong. Try again. (e1)' })

  const djsMember = await djsGuild.members.fetch(i.user.id)
  if (!djsMember) return i.replyPrivately({ content: 'Something went wrong. Try again. (e2)' })

  const isHelpful = await djsMember.roles.cache.some(r => r.id === ModcenterConst.roleHelpful)
  if (!isHelpful) return i.replyPrivately({ content: 'You cannot do this, sorry' })

  djsMember.roles.add(ModcenterConst.roleMod)
  return i.replyPrivately({ content: 'You are now shown as mod!' })
}