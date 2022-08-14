import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Languages } from '../../../lib/data/languages'
import { GameInfo, Gaming } from '../../../lib/gaming/gaming'


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
    enabled: true
  },
  ...Gaming.allGames.map(g => g.info)
]

export default function (_i: GenericInteraction, [ pageId ]: [ string ]): InteractionApplicationCommandCallbackData {
  pageId = pageId || '_hub'

  const page = pages.find(p => p.id === pageId) || pages[0]

  return {
    title: page.name,
    description: page.descriptionLong,
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
            : `${p.minPlayers}-${p.maxPlayers} Players. ${p.languages.map(l => Languages.codeLookupNative[l]).join(', ')}`,
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
