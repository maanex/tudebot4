import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'


export default function (_i: GenericInteraction, _args: []): InteractionApplicationCommandCallbackData {
  return {
    embeds: [ {
      title: 'Quickreplies Advanced Guide',
      fields: [
        {
          name: 'Fuzzy Matching',
          value: 'Quick replies get fuzzy matched. If your trigger is "hello" and someone runs "helo", their answer is close enough to trigger the "hello" quick reply.'
        },
        {
          name: 'Running GPL Scripts',
          value: 'You can run GPL scripts by starting the reply with [[gpl]] and then writing your script in the next line(s).\n'
            + 'Your script gets evaluated at runtime, allowing you to create interactive or randomized responses.\n'
            + 'You also get access to a bit of context, these input variables are available: last_image, last_message, last_message_author_name, last_message_author_id, last_message_author_avatar, author_name, author_id, author_avatar'
        }
      ],
      color: 0x5865F2
    } ],
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Back',
        custom_id: 'quickreplies_page_0'
      }
    ]
  }
}
