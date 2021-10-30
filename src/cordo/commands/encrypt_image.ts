import axios from 'axios'
import { ButtonStyle, ComponentType, InteractionCommandType, InteractionComponentFlag, InteractionResponseFlags, ReplyableCommandInteraction, ReplyableComponentInteraction } from 'cordo'
import Image from 'image-js'
import { rand } from '../../lib/enc/enc-util'
import { oneInOne } from '../../lib/enc/one-in-one'
import uploadImageToCdn from '../../lib/img-cdn'
import { colors } from './decrypt_image'


const mem: Map<string, {
  url: string,
  timeout: any,
  triggerOnResolve: () => any
}> = new Map()

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


  if (!mem.has(i.user.id)) {
    const interaction = i
      .replyInteractive({
        content: 'Now do the same thing on the image you want to disguise it as\nOR click the button below to disguise it as a random image from the internet',
        flags: InteractionResponseFlags.EPHEMERAL,
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.PRIMARY,
            label: 'Use Random Image',
            custom_id: 'use_random'
          }
        ]
      })
      .withTimeout(
        5 * 60 * 1000,
        j => j.disableComponents(),
        { onInteraction: 'removeTimeout' }
      )
      .on('use_random', async (h) => {
        const { data: o } = await axios.get('https://raw.githubusercontent.com/tude-webhost/publicdata/master/imgdb.json')
        const url = o[Math.floor(Math.random() * o.length)]
        clearTimeout(mem.get(i.user.id).timeout)
        finalize(h, url)
      })

    mem.set(i.user.id, {
      url: imgUrl,
      timeout: setTimeout(
        () => {
          mem.delete(i.user.id)
          interaction.triggerJanitor()
        },
        5 * 60 * 1000
      ),
      triggerOnResolve: interaction.triggerJanitor
    })
  } else {
    const m = mem.get(i.user.id)
    clearTimeout(m.timeout)
    m.triggerOnResolve()
    finalize(i, imgUrl)
  }
}

function finalize(i: ReplyableCommandInteraction | ReplyableComponentInteraction, imageUrl: string) {
  ((i as ReplyableComponentInteraction).editInteractive ?? i.replyInteractive)({
    content: 'Now a password, please',
    flags: InteractionResponseFlags.EPHEMERAL,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'pass',
        min_values: 1,
        max_values: colors.length,
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

      const disguise = mem.get(i.user.id).url
      mem.delete(i.user.id)

      const { data: dataDis } = await axios.get(disguise, { responseType: 'arraybuffer' })
      const { data: dataAs } = await axios.get(imageUrl, { responseType: 'arraybuffer' })
      const inputDis = await Image.load(dataDis)
      const inputAs = await Image.load(dataAs)
      const output = oneInOne(inputDis, inputAs, password)
      const url = await uploadImageToCdn(output)

      h.edit({
        content: url
      })
    })
}

