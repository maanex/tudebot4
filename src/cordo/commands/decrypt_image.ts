import { InteractionCommandType, ReplyableCommandInteraction } from 'cordo'
import parseImageFromMessage from '../../lib/parsing/parse-image-from-message'
import imageDecrypt from '../actions/image-decrypt'

export default function (i: ReplyableCommandInteraction) {
  if (i.data.type !== InteractionCommandType.MESSAGE) return
  const [ success, urlOrMessage ] = parseImageFromMessage(i.data.target)

  if (!success) {
    return i.replyPrivately({
      content: urlOrMessage
    })
  }

  imageDecrypt(i, urlOrMessage, i.data.target.id)
}
