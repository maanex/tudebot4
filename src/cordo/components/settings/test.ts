import { ButtonStyle, ChannelType, ComponentType, ReplyableComponentInteraction } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  i.edit({
    content: 'yikes',
    embeds: [],
    components: [
      {
        type: ComponentType.CHANNEL_SELECT,
        custom_id: 'something',
        placeholder: 'Gaming',
        channel_types: [ ChannelType.GUILD_TEXT, ChannelType.GUILD_NEWS ],
        min_values: 0,
        max_values: 1
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Test (Debug)',
        custom_id: 'settings_test'
      }
    ]
  })
}
