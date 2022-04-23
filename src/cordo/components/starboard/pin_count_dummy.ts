import { ButtonStyle, ReplyableComponentInteraction } from 'cordo'
import { TudeBot } from '../../..'
import DailyTopicModule from '../../../modules/dailytopic'


export default async function (i: ReplyableComponentInteraction) {
  if (Math.random() > 0.5) return i.ack()

  const components = i.message.components
  const pinButton = components[0].components[0]

  if (Math.random() < 0.9)
    changeButtonColor(pinButton)
  else
    await changeButtonEmoji(pinButton)

  i.edit({
    components
  })
}

function changeButtonColor(button: any) {
  const styles = [
    ButtonStyle.PRIMARY,
    ButtonStyle.SECONDARY,
    ButtonStyle.DANGER,
    ButtonStyle.SUCCESS
  ]

  button.style = styles[~~(Math.random() * styles.length)]
}

async function changeButtonEmoji(button: any) {
  const module = TudeBot.getModule<DailyTopicModule>('dailytopic')
  if (!module) return

  const emojiTopic = module.topics.emoji
  if (!emojiTopic) return

  button.emoji.name = await emojiTopic[1]()
}
