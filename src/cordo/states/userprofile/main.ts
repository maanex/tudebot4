import { CommandInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { GuildMember, TextChannel } from 'discord.js'
import Emojis from '../../../lib/emojis'
import { userprofileComponents } from '../../shared/userprofile/components'


type ArgsType = [ GuildMember, TextChannel ]

export default function (i: CommandInteraction, [ member ]: ArgsType): InteractionApplicationCommandCallbackData {
  return {
    embeds: [ {
      author: {
        name: member.user.username,
        icon_url: member.user.avatarURL({ format: 'png', size: 128 })
      }
    } ],
    components: userprofileComponents(i.user, 'main')
  }
}
