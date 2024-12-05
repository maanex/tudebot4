import { CommandInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { GuildMember, TextChannel } from 'discord.js'
import Emojis from '../../../lib/data/emojis'


type ArgsType = [ GuildMember, TextChannel, string ]

export default function (_i: CommandInteraction, [ member, _channel, meta ]: ArgsType): InteractionApplicationCommandCallbackData {
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

  fields.push({
    name: 'Bot Info',
    value: toText([ undefined, meta ])
  })

  return {
    embeds: [
      {
        author: {
          name: member.user.username,
          icon_url: member.user.avatarURL({ extension: 'png', size: 128 })
        },
        fields
      }
    ]
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
    `Created <t:${~~(member.user.createdAt.getTime() / 1000)}:D>`
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
    `Added to this server <t:${~~(member.joinedAt.getTime() / 1000)}:D>`
  ]
}
