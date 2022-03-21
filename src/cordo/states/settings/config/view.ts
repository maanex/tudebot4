import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { TudeBot } from '../../../..'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guild_id) {
    return {
      title: 'Ohje',
      description: 'Das war wohl nix.'
    }
  }

  return {
    title: 'Config',
    description: `\`\`\`json\n${JSON.stringify(TudeBot.guildSettings.get(i.guild_id), null, 2)}\`\`\``,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Zurück',
        custom_id: 'settings_main'
      }
    ]
  }
}
