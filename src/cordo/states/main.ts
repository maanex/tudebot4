import { GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'


export default function (_i: GenericInteraction): InteractionApplicationCommandCallbackData {
  return {
    title: 'test',
    description: 'test'
  }
}
