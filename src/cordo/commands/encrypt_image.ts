import { InteractionCommandType, ReplyableCommandInteraction } from 'cordo'
import parseImageFromMessage from '../../lib/parsing/parse-image-from-message'
import imageEncrypt from '../actions/image-encrypt'

export default function (i: ReplyableCommandInteraction) {
  if (i.data.type !== InteractionCommandType.MESSAGE) return
  const [ success, urlOrMessage ] = parseImageFromMessage(i.data.target)

  if (!success) {
    return i.replyPrivately({
      content: urlOrMessage
    })
  }

  imageEncrypt(i, urlOrMessage, i.data.target.id)
}
