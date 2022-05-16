import { ButtonStyle, ComponentType, MessageComponent, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Module } from '../../../../types/types'
import Emojis from '../../../../lib/data/emojis'


export default function (_i: GenericInteraction, [ page, maxPage, modules ]: [number, number, [string, Module][]]): InteractionApplicationCommandCallbackData {
  const modulesStr = modules
    .map(([ _, module ]) => `${module.emoji} **${module.name}**\n${module.description}`)
    .join('\n\n')

  const comps: MessageComponent[] = modules.map(([ id, mod ]) => ({
    type: ComponentType.BUTTON,
    style: ButtonStyle.PRIMARY,
    label: `Add ${mod.name}`,
    custom_id: `settings_modules_store_add_${id}`
  }))

  return {
    title: `Page ${page + 1}`,
    description: modulesStr,
    components: [
      ...comps,
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Previous Page',
        custom_id: `settings_modules_store_page_${page - 1}`,
        disabled: page <= 0
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Next Page',
        custom_id: `settings_modules_store_page_${page + 1}`,
        disabled: page >= maxPage
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Back',
        emoji: { name: Emojis.leftCaret.name },
        custom_id: 'settings_modules_main'
      }
    ]
  }
}
