import axios from 'axios'
import { ComponentType, InteractionCommandType, InteractionResponseFlags, MessageComponentSelectOption, ReplyableCommandInteraction } from 'cordo'
import Image from 'image-js'
import { decode } from '../../lib/enc/data-in-one'
import { rand } from '../../lib/enc/enc-util'
import { oneOutOfOne } from '../../lib/enc/one-out-of-one'
import uploadImageToCdn from '../../lib/img-cdn'


export const colors = [ 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Pink', 'Purple', 'Turquoise', 'Gold', 'Lime', 'Maroon', 'Navy', 'Coral', 'Teal', 'Brown', 'White', 'Black', 'Sky', 'Berry', 'Grey', 'Straw', 'Silver' ] //, 'Sapphire' ]

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

    if (img.width > 3000 || img.height > 3000) {
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

  const options: MessageComponentSelectOption[] = [
    ...colors.map(c => ({
      label: c,
      value: c.toLowerCase()
    })),
    {
      label: 'Export File',
      value: '_file'
    }
  ]

  i.replyInteractive({
    content: 'Password, please',
    flags: InteractionResponseFlags.EPHEMERAL,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'pass',
        min_values: 1,
        max_values: options.length,
        options
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
        .filter(v => !v.startsWith('_'))
        .map(o => rand(o, 0xFF).toString(16))
        .reduce((s, n) => s + n, '')

      const flags = h.data.values
        .filter(v => v.startsWith('_'))
        .map(o => o.substring(1))

      h.edit({
        content: 'Loading...',
        components: []
      })

      const { data } = await axios.get(imgUrl, { responseType: 'arraybuffer' })
      const input = await Image.load(data)

      let url = ''
      if (flags.includes('file')) {
        // data-in-one algorithm
        const output = decode(input, password)
        if (output[1] === 'href' || output[1] === 'link' || output[1] === 'url')
          url = Buffer.from(output[0]).toString()
        else
          url = await uploadImageToCdn(output[0], 'output.' + output[1]) + '?p=' + password
      } else {
        // default image one-out-of-one
        const output = oneOutOfOne(input, password)
        url = await uploadImageToCdn(output) + '?p=' + password
      }

      h.edit({ content: url })
    })
}

