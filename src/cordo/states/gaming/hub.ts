import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Languages } from '../../../lib/data/languages'
import { GameInfo, Gaming } from '../../../lib/gaming/gaming'
import { truncateString } from '../../../lib/utils/string-utils'


const pages: GameInfo[] = [
  {
    name: 'TudeBot Gaming',
    descriptionShort: 'About TudeBot Gaming',
    descriptionLong: 'TudeBot Gaming is still in beta. More info will follow soon.',
    icon: '🏠',
    id: '_hub',
    minPlayers: 0,
    maxPlayers: 999,
    languages: [],
    estTime: '',
    enabled: true
  },
  ...Gaming.allGames.map(g => g.info)
]

export default function (_i: GenericInteraction, [ pageId ]: [ string ]): InteractionApplicationCommandCallbackData {
  pageId = pageId || '_hub'

  const page = pages.find(p => p.id === pageId) || pages[0]

  let description = page.descriptionLong
  if (!page.enabled) description += '\n\n*This game is currently disabled.*'

  return {
    title: page.name,
    description,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'gaming_hub_page',
        options: pages.map(p => ({
          value: p.id,
          label: p.name,
          emoji: { name: p.icon },
          description: (p.id === '_hub')
            ? 'About TudeBot Gaming'
            : truncateString(`${p.minPlayers}-${p.maxPlayers} Players. ${p.estTime}. ${p.languages.map(l => Languages.codeLookupNative[l]).join(', ')}`, 50),
          default: (pageId === p.id)
        }))
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        label: `Play ${page.name}`,
        custom_id: `gaming_launch_new_${page.id}`,
        visible: page.id !== '_hub',
        disabled: !page.enabled
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Select game above',
        custom_id: 'noop',
        visible: page.id === '_hub',
        disabled: true
      }
    ]
  }
}
