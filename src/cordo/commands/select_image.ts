import { ButtonStyle, ComponentType, InteractionCommandType, InteractionResponseFlags, ReplyableCommandInteraction } from 'cordo'
import parseImageFromMessage from '../../lib/parsing/parse-image-from-message'
import imageDecrypt from '../actions/image-decrypt'
import imageEncrypt from '../actions/image-encrypt'
import imageFilter from '../actions/image-filter'
import imageFlip from '../actions/image-flip'


export default function (i: ReplyableCommandInteraction) {
  if (i.data.type !== InteractionCommandType.MESSAGE) return i.defer()
  const targetMessage = i.data.target
  const [ success, urlOrMessage ] = parseImageFromMessage(targetMessage)

  if (!success) {
    return i.replyPrivately({
      content: urlOrMessage
    })
  }

  const imgUrl = urlOrMessage

  i.replyInteractive({
    title: 'Image selected',
    image: imgUrl,
    flags: InteractionResponseFlags.EPHEMERAL,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'encrypt',
        label: 'Encrypt Image'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'decrypt',
        label: 'Decrypt Image'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'flip',
        label: 'Flip Image'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'filter',
        label: 'Apply Filter'
      }
    ]
  })
    .withTimeout(
      5 * 60 * 1000,
      j => j.disableComponents(),
      { onInteraction: 'removeTimeout' }
    )
    .on('encrypt', (h) => {
      imageEncrypt(h, imgUrl, targetMessage.id)
    })
    .on('decrypt', (h) => {
      imageDecrypt(h, imgUrl, targetMessage.id)
    })
    .on('flip', (h) => {
      imageFlip(h, imgUrl, targetMessage.id)
    })
    .on('filter', (h) => {
      imageFilter(h, imgUrl, targetMessage.id)
    })
}

