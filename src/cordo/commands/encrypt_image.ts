import axios from 'axios'
import { ComponentType, InteractionCommandType, InteractionComponentFlag, InteractionResponseFlags, ReplyableCommandInteraction } from 'cordo'
import Image from 'image-js'
import { rand } from '../../lib/enc/enc-util'
import { oneInOne } from '../../lib/enc/one-in-one'
import uploadImageToCdn from '../../lib/img-cdn'
import { colors } from './decrypt_image'


const mem: Map<string, string> = new Map()

export default function (i: ReplyableCommandInteraction) {
  if (i.data.type !== InteractionCommandType.MESSAGE) return i.defer()

  if (!i.data.target.attachments.length) {
    return i.replyPrivately({
      content: 'No attachments found. Please run this on a message with an image'
    })
  }

  const image = i.data.target.attachments.find(i => /image\/((png)|(jpeg)|(webp))/.test(i.content_type))
  if (!image) {
    return i.replyPrivately({
      content: 'Not enough valid images found (2). Please run this on a message with at two images'
    })
  }

  if (image.width > 2000 || image.height > 2000) {
    return i.replyPrivately({
      content: 'The image is too large to process.'
    })
  }

  if (!mem.has(i.user.id)) {
    mem.set(i.user.id, image.proxy_url)

    i.replyPrivately({
      content: 'Now do the same thing on the image you want to disguise it as'
    })
  } else {
    i.replyInteractive({
      content: 'Now a password, please',
      flags: InteractionResponseFlags.EPHEMERAL,
      components: [
        {
          type: ComponentType.SELECT,
          custom_id: 'pass',
          min_values: 1,
          max_values: 25,
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ],
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

        const disguise = mem.get(i.user.id)
        mem.delete(i.user.id)

        const { data: dataDis } = await axios.get(disguise, { responseType: 'arraybuffer' })
        const { data: dataAs } = await axios.get(image.proxy_url, { responseType: 'arraybuffer' })
        const inputDis = await Image.load(dataDis)
        const inputAs = await Image.load(dataAs)
        const output = oneInOne(inputDis, inputAs, password)
        const url = await uploadImageToCdn(output)

        i.replyPrivately({
          content: url
        })
      })
  }
}

