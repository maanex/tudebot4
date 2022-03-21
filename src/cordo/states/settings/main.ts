import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'


export default function (_i: GenericInteraction): InteractionApplicationCommandCallbackData {
  return {
    title: 'Settings',
    description: 'Welcum',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        label: 'Edit Modules',
        custom_id: 'settings_modules_main'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'View Config',
        custom_id: 'settings_config_view'
      }
    ]
  }
}
