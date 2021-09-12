import axios from 'axios'
import { ComponentType, InteractionCommandType, InteractionResponseFlags, ReplyableCommandInteraction } from 'cordo'
import Image from 'image-js'
import { rand } from '../../lib/enc/enc-util'
import { oneOutOfOne } from '../../lib/enc/one-out-of-one'
import uploadImageToCdn from '../../lib/img-cdn'


export const colors = [ 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Pink', 'Purple', 'Turquoise', 'Gold', 'Lime', 'Maroon', 'Navy', 'Coral', 'Teal', 'Brown', 'White', 'Black', 'Sky', 'Berry', 'Grey', 'Straw', 'Silver', 'Sapphire' ]

export default function (i: ReplyableCommandInteraction) {
  if (i.data.type !== InteractionCommandType.MESSAGE) return i.defer()

  let imgUrl = ''
  if (i.data.target.attachments.length) {
    const img = i.data.target.attachments.find(i => /image\/((png)|(jpeg)|(webp))/.test(i.content_type))

    if (!img) {
      return i.replyPrivately({
        content: 'No valid image found. Please run this on a message with an image'
      })
    }

    if (img.width > 2000 || img.height > 2000) {
      return i.replyPrivately({
        content: 'This image is too large to process.'
      })
    }

    imgUrl = img.proxy_url
  } else if (/https:?.+\.(png)|(jpg)/g.test(i.data.target.content)) {
    imgUrl = i.data.target.content.match(/(https?.+\.(?:(?:png)|(?:jpg)))/g)[0]
  }

  if (!imgUrl) {
    return i.replyPrivately({
      content: 'No attachments found. Please run this on a message with an image'
    })
  }

  i.replyInteractive({
    content: 'Password, please',
    flags: InteractionResponseFlags.EPHEMERAL,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'pass',
        min_values: 1,
        max_values: 25,
        options: colors.map(c => ({
          label: c,
          value: c.toLowerCase()
        }))
      }
    ]
  })
    .withTimeout(
      5 * 60 * 1000,
      j => j.removeComponents(),
      { onInteraction: 'removeTimeout' }
    )
    .on('pass', async (h) => {
      const password = h.data.values
        .map(o => rand(o, 0xFF).toString(16))
        .reduce((s, n) => s + n, '')

      h.edit({
        content: 'Loading...',
        components: []
      })

      const { data } = await axios.get(imgUrl, { responseType: 'arraybuffer' })
      const input = await Image.load(data)
      const output = oneOutOfOne(input, password)
      const url = await uploadImageToCdn(output)

      h.edit({
        content: url + '?p=' + password
      })
    })
}

