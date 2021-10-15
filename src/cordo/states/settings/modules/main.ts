import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { TudeBot } from '../../../..'
import { Module } from '../../../../types/types'
import Emojis from '../../../../int/emojis'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  const modules = Object
    .keys(TudeBot.guildSettings.get(i.guild_id).modules)
    .map(name => ([ name, TudeBot.modules.get(name) ] as [string, Module]))
    .filter(([ _, data ]) => !!data)

  const modulesStr = modules
    .map(([ _, module ]) => `**${module.name}** — ${module.info}`)
    .join('\n')

  return {
    title: 'Modules',
    description: `These are the modules enabled on this server:\n\n${modulesStr}`,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_modules_edit',
        placeholder: 'Click to edit module settings',
        options: modules.map(([ id, m ]) => ({
          label: `Edit ${m.name}`,
          value: id
        }))
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Back',
        emoji: Emojis.sockping,
        custom_id: 'settings_main'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        label: 'Add Modules',
        custom_id: 'settings_modules_store_main'
      }
    ]
  }
}
