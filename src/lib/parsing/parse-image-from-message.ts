import { InteractionMessage } from 'cordo'
import { Message as DjsMessage } from 'discord.js'


export default function parseImageFromMessage(message: InteractionMessage | DjsMessage): [ boolean, string ] {
  let imgUrl = ''
  const isDjsMessage = !!(message as any).client

  if (isDjsMessage && (message as DjsMessage).attachments.size) {
    const img = (message as DjsMessage).attachments.find(i => /image\/((png)|(jpeg)|(webp))/.test(i.contentType))

    if (!img)
      return [ false, 'No valid image found. Please run this on a message with an image' ]

    if (img.width > 3000 || img.height > 3000)
      return [ false, 'This image is too large to process.' ]

    imgUrl = img.proxyURL
  } else if (!isDjsMessage && (message as InteractionMessage).attachments.length) {
    const img = (message as InteractionMessage).attachments.find(i => /image\/((png)|(jpeg)|(webp))/.test(i.content_type))

    if (!img)
      return [ false, 'No valid image found. Please run this on a message with an image' ]

    if (img.width > 3000 || img.height > 3000)
      return [ false, 'This image is too large to process.' ]

    imgUrl = img.proxy_url
  } else if (/https:?.+\.(png)|(jpg)/g.test(message.content)) {
    imgUrl = message.content.match(/(https?.+\.(?:(?:png)|(?:jpg)))/g)[0]
  } else if (message.embeds?.length) {
    let biggestSize = 0
    for (const embed of message.embeds) {
      if (embed.image?.proxy_url && (embed.image.width * embed.image.height > biggestSize)) {
        biggestSize = embed.image.width * embed.image.height
        imgUrl = embed.image.proxy_url
      }
      if (embed.thumbnail?.proxy_url && (embed.thumbnail.width * embed.thumbnail.height > biggestSize)) {
        biggestSize = embed.thumbnail.width * embed.thumbnail.height
        imgUrl = embed.thumbnail.proxy_url
      }
    }
  }

  if (!imgUrl)
    return [ false, 'No attachments found. Please run this on a message with an image' ]

  return [ true, imgUrl ]
}
