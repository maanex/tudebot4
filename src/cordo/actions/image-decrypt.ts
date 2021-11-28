import axios from 'axios'
import { ButtonStyle, ComponentType, InteractionComponentFlag, InteractionResponseFlags, InteractionType, MessageComponent, MessageComponentSelectOption, ReplyableCommandInteraction, ReplyableComponentInteraction } from 'cordo'
import { TextChannel } from 'discord.js'
import Image from 'image-js'
import { TudeBot } from '../..'
import { decode } from '../../lib/images/enc/data-in-one'
import { rand } from '../../lib/images/enc/enc-util'
import { oneOutOfOne } from '../../lib/images/enc/one-out-of-one'
import uploadImageToCdn from '../../lib/images/img-cdn'


export const colors = [ 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Pink', 'Purple', 'Turquoise', 'Gold', 'Lime', 'Maroon', 'Navy', 'Coral', 'Teal', 'Brown', 'White', 'Black', 'Sky', 'Berry', 'Grey', 'Straw', 'Silver' ] //, 'Sapphire' ]

export default function (i: ReplyableCommandInteraction | ReplyableComponentInteraction, imgUrl: string, originalMessage: string) {
  const func = (i.type === InteractionType.COMMAND)
    ? i.replyInteractive
    : i.editInteractive

  const cache: Map<string, string> = new Map()
  const published: Map<string, boolean> = new Map()
  let loading = false
  let selected = ''

  cache.set('', imgUrl)

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

  const buildComponents:
    () => MessageComponent[]
  = () => ([
    {
      type: ComponentType.SELECT,
      custom_id: 'pass',
      min_values: 1,
      max_values: options.length,
      options,
      disabled: loading,
      flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
    },
    {
      type: ComponentType.BUTTON,
      style: ButtonStyle.SECONDARY,
      custom_id: 'publish',
      label: 'Publish',
      disabled: loading || !selected || published.has(selected)
    }
  ])

  func({
    title: 'Decrypt Image',
    flags: InteractionResponseFlags.EPHEMERAL,
    components: buildComponents(),
    image: imgUrl
  })
    .withTimeout(
      5 * 60 * 1000,
      j => j.disableComponents(),
      { onInteraction: 'restartTimeout' }
    )
    .on('pass', async (h) => {
      if (loading) return h.ack()

      const password = h.data.values
        .filter(v => !v.startsWith('_'))
        .map(o => rand(o, 0xFF).toString(16))
        .reduce((s, n) => s + n, '')

      const flags = h.data.values
        .filter(v => v.startsWith('_'))
        .map(o => o.substring(1))

      const cacheId = password + flags.join('')
      const isCached = cache.has(cacheId)
      selected = cacheId

      if (!isCached) {
        loading = true
        h.edit({
          title: 'Loading...',
          components: buildComponents(),
          image: 'https://media.discordapp.net/attachments/655354019631333397/914317573749887026/87Tpa.gif'
        })
      }

      try {
        const outUrl = isCached
          ? cache.get(cacheId)
          : await processImage(imgUrl, password, flags)

        loading = false
        h.edit({
          title: 'Decrypt Image',
          components: buildComponents(),
          image: outUrl
        })

        if (!isCached)
          cache.set(cacheId, outUrl)
      } catch (ex) {
        console.error(ex)
        loading = false
        h.edit({ components: buildComponents(), image: imgUrl })
      }
    })
    .on('publish', async (h) => {
      if (!selected || published.has(selected)) return h.ack()
      const channelInstance = await TudeBot.channels.fetch(h.channel_id)
      if (!channelInstance) return h.ack()

      const textChannel = channelInstance as TextChannel
      textChannel.send({
        embeds: [
          {
            author: {
              name: `${h.user.username} decrypted this image`,
              url: `https://discord.com/users/${h.user.id}`,
              icon_url: h.user.avatar
                ? `https://cdn.discordapp.com/avatars/${h.user.id}/${h.user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars${parseInt(h.user.discriminator) % 5}.png`
            },
            image: { url: cache.get(selected) },
            footer: { text: 'Powered by TudeBot' },
            color: 0x2F3136
          }
        ],
        reply: {
          messageReference: originalMessage,
          failIfNotExists: false
        }
      })
      published.set(selected, true)
      h.edit({
        title: 'Published!',
        components: buildComponents(),
        image: cache.get(selected)
      })
    })
}


async function processImage(imgUrl: string, password: string, flags: string[]): Promise<string> {
  const { data } = await axios.get(imgUrl, { responseType: 'arraybuffer' })
  const input = await Image.load(data)

  if (flags.includes('file')) {
    const output = decode(input, password)

    if ([ 'href', 'link', 'url' ].includes(output[1]))
      return Buffer.from(output[0]).toString()
    else
      return await uploadImageToCdn(output[0], 'output.' + output[1]) + '?p=' + password
  }

  const output = oneOutOfOne(input, password)
  return await uploadImageToCdn(output) + '?p=' + password
}
