import { ReplyableComponentInteraction } from 'cordo'
import { TudeBot } from '../../../../..'
import DataModule from '../../../../../modules/data'


export default async function (i: ReplyableComponentInteraction) {
  let mode = i.params.mode
  const roleId = i.params.roleid

  const guild = await TudeBot.guilds.fetch(i.guild_id)
  const member = await guild.members.fetch(i.user.id)

  if (mode === 'select') {
    i.edit({ components: i.message.components })

    const allRoles = TudeBot.getModule<DataModule>('data').data?.roleLists[roleId]
    if (!allRoles) {
      i.replyPrivately({ content: 'Something weird is happening. Do you feel it too?' })
      return
    }

    const selected = i.data.values

    for (const role of allRoles.map(r => r.roleId)) {
      if (selected.includes(role)) {
        if (!member.roles.cache.has(role))
          member.roles.add(role)
      } else if (member.roles.cache.has(role)) {
        member.roles.remove(role)
      }
    }

    i.replyPrivately({ content: `Your roles have been updated! Check out your profile by clicking on your name: <@${i.user.id}>` })
    return
  }

  if (mode === 'toggle') {
    if (member.roles.cache.some(r => r.id === roleId))
      mode = 'remove'
    else
      mode = 'add'
  }

  if (mode === 'add') {
    await member.roles.add(roleId)
    i.replyPrivately({ content: `You now have the <@&${roleId}> role!` })
  } else if (mode === 'remove') {
    await member.roles.remove(roleId)
    i.replyPrivately({ content: `You no longer have the <@&${roleId}> role!` })
  }
}
