import { CommandInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { GuildMember, TextChannel } from 'discord.js'
import { UserType } from '../../../database/models/user.model'
import Emojis from '../../../lib/data/emojis'
import Localisation from '../../../lib/localisation'
import { Achievements } from '../../../lib/users/achievements'
import { userprofileComponents } from '../../shared/userprofile/components'


type ArgsType = [ GuildMember, TextChannel, UserType ]

type UserAchievement = UserType['achievements'][number]

function getSortingScore(a: UserAchievement): number {
  const meta: Achievements.GenericMeta = Achievements.List[a.name]
  if (meta.type === 'standart') return 0
  if (meta.type === 'counter') return a.counter / meta.count
  if (meta.type === 'collect') return a.collected?.length / meta.collectables.length
  return 0
}

function achievementToString(a: UserAchievement, uncompleted: boolean): string {
  const meta: Achievements.GenericMeta = Achievements.List[a.name]
  const name = (!uncompleted || meta.visibility !== 'all_redacted')
    ? Localisation.text('en-US', `=achievement_${a.name.toLowerCase()}_name`)
    : '???'
  const desc = (!uncompleted || meta.visibility === 'visible')
    ? Localisation.text('en-US', `=achievement_${a.name.toLowerCase()}_desc`)
    : '???'
  const completion = (meta.visibility !== 'visible')
    ? '? / ?'
    : (meta.type === 'counter')
        ? `${a.counter} / ${meta.count}`
        : (meta.type === 'collect')
            ? `${a.collected.length} / ${meta.collectables.length}`
            : '? / ?'
  return uncompleted
    ? `> **${name} [${completion}](https://tude.club/)**\n> ${desc}`
    : `> **${name}**\n> ${desc}`
}

function achievementsToString(a: UserAchievement[], includeProgress: boolean): string {
  if (!a?.length) return `*${Localisation.text('en-US', '=userprofile_achievements_none')}*`
  return a
    .map(i => achievementToString(i, includeProgress))
    .join('\n\n')
}

export default function (i: CommandInteraction, [ member, _, data ]: ArgsType): InteractionApplicationCommandCallbackData {
  const achievements = data.achievements

  const recentlyUnlocked = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => (b.unlocked ?? 0) - (a.unlocked ?? 0))
    .slice(0, 3)

  const closeToComplete = achievements
    .filter(a => !a.unlocked)
    .filter(a => (Achievements.List[a.name] as Achievements.GenericMeta).visibility !== 'hidden')
    .filter(a => (a.counter ?? 0) > 0 || (a.collected ?? []).length > 0)
    .map(a => ([ a, getSortingScore(a) ] as [ typeof a, number ]))
    .sort((a, b) => (b[1] - a[1]))
    .map(a => a[0])
    .slice(0, 3)

  return {
    embeds: [ {
      author: {
        name: member.user.username,
        icon_url: member.user.avatarURL({ extension: 'png', size: 128 })
      },
      fields: [
        {
          name: 'Recently Unlocked:',
          value: achievementsToString(recentlyUnlocked, false) + '\n' + Emojis.bigSpace,
          inline: false
        },
        {
          name: 'Close to complete:',
          value: achievementsToString(closeToComplete, true),
          inline: false
        }
      ]
    } ],
    components: userprofileComponents(i.user, 'achievements')
  }
}
