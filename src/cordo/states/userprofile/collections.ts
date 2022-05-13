import { CommandInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { GuildMember, TextChannel } from 'discord.js'
import Emojis from '../../../lib/emojis'
import UserProfile from '../../../lib/users/user-profile'
import { userprofileComponents } from '../../shared/userprofile/components'


type ArgsType = [ GuildMember, TextChannel ]

export default function (i: CommandInteraction, [ member ]: ArgsType): InteractionApplicationCommandCallbackData {
  if (Math.random() < 0.5) {
    UserProfile.queueNotification(i.user, {
      title: '=achievement_unlocked',
      description: 'Tester!',
      color: 0xFF4488,
      icon: 'https://images-ext-2.discordapp.net/external/pwJoqHMo_HlbU42WbgoTMvRcefv1vvHNix24XQekjRM/%3Fsize%3D128/https/cdn.discordapp.com/avatars/672822334641537041/e86b9ed1e5779b5ba1a3694477a6f5fc.png'
    })
  }

  return {
    embeds: [ {
      author: {
        name: member.user.username,
        icon_url: member.user.avatarURL({ format: 'png', size: 128 })
      }
    } ],
    components: userprofileComponents(i.user, 'collections')
  }
}
