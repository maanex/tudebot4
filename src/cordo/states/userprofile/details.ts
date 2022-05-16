import { CommandInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { GuildMember, TextChannel } from 'discord.js'
import { UserType } from '../../../database/models/user.model'
import Emojis from '../../../lib/data/emojis'
import { userprofileComponents } from '../../shared/userprofile/components'


type ArgsType = [ GuildMember, TextChannel, UserType ]

export default function (i: CommandInteraction, [ member ]: ArgsType): InteractionApplicationCommandCallbackData {
  const fields = [ ]
  const icons = {
    '-2': Emojis.status.error,
    '-1': Emojis.status.warning,
    0: Emojis.status.neutral,
    1: Emojis.status.ok,
    undefined: ''
  }
  const toText = (item: [ number, string ]) => `${icons[item[0]]} ${item[1]}`

  const generalJoinDiscord = getGeneralJoinDiscord(member)
  const generalJoinServer = getGeneralJoinServer(member)
  fields.push({
    name: 'General',
    value: [
      toText(generalJoinDiscord),
      toText(generalJoinServer)
    ].join('\n'),
    inline: false
  })

  return {
    embeds: [ {
      author: {
        name: member.user.username,
        icon_url: member.user.avatarURL({ format: 'png', size: 128 })
      },
      fields
    } ],
    components: userprofileComponents(i.user, 'details')
  }
}

function getGeneralJoinDiscord(member: GuildMember): [ number, string ] {
  const delta = Date.now() - member.user.createdAt.getTime()
  return [
    delta < 1000 * 60 * 60 * 24 * 30
      ? -2
      : delta < 1000 * 60 * 60 * 24 * 400
        ? -1
        : 1,
    `Joined Discord <t:${~~(member.user.createdAt.getTime() / 1000)}:D>`
  ]
}

function getGeneralJoinServer(member: GuildMember): [ number, string ] {
  const delta = Date.now() - member.joinedAt.getTime()
  return [
    delta < 1000 * 60 * 60 * 24 * 7
      ? -2
      : delta < 1000 * 60 * 60 * 24 * 30
        ? -1
        : 1,
    `Joined this server <t:${~~(member.joinedAt.getTime() / 1000)}:D>`
  ]
}
