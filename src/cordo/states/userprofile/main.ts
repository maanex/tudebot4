import { CommandInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { GuildMember, TextChannel } from 'discord.js'
import { UserType } from '../../../database/models/user.model'
import { userprofileComponents } from '../../shared/userprofile/components'


type ArgsType = [ GuildMember, TextChannel, UserType ]

export default function (i: CommandInteraction, [ member ]: ArgsType): InteractionApplicationCommandCallbackData {
  return {
    embeds: [ {
      author: {
        name: member.user.username,
        icon_url: member.user.avatarURL({ extension: 'png', size: 128 })
      }
    } ],
    components: userprofileComponents(i.user, 'main')
  }
}
