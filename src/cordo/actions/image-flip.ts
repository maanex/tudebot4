import axios from 'axios'
import { ButtonStyle, ComponentType, InteractionComponentFlag, InteractionResponseFlags, InteractionType, InteractionTypeModalSubmit, MessageComponent, ReplyableCommandInteraction, ReplyableComponentInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import { TextChannel } from 'discord.js'
import Image from 'image-js'
import { TudeBot } from '../..'
import { oneFlip } from '../../lib/images/enc/one-flip'
import uploadImageToCdn from '../../lib/images/img-cdn'


function polyfillGetSubmission(name: string, components: MessageComponent[]): string {
  for (const comp of components) {
    if ((comp as any).type === ComponentType.ROW) {
      const res = polyfillGetSubmission(name, (comp as any).components)
      if (res) return res
    }
    if ((comp as any).custom_id === name)
      return (comp as any).value
  }
  return undefined
}

export default async function (i: ReplyableCommandInteraction | ReplyableComponentInteraction, imgUrl: string, originalMessage: string) {
  const func = (i.type === InteractionType.COMMAND)
    ? i.replyInteractive
    : i.editInteractive

  const cache: Map<string, string> = new Map()
  const published: Map<string, boolean> = new Map()
  let loading = false
  let selected = ''

  cache.set('', imgUrl)

  const buildComponents:
    () => MessageComponent[]
  = () => ([
    // {
    //   type: ComponentType.SELECT,
    //   custom_id: 'pass',
    //   min_values: 1,
    //   max_values: options.length,
    //   options,
    //   disabled: loading,
    //   flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
    // },
    {
      type: ComponentType.BUTTON,
      style: ButtonStyle.SECONDARY,
      custom_id: 'publish',
      label: 'Publish',
      disabled: loading || !selected || published.has(selected)
    }
  ])

  i.openModal({
    custom_id: CordoAPI.compileCustomId('pass', [ InteractionComponentFlag.ACCESS_EVERYONE ], i.id),
    title: 'Stuff',
    components: [
      {
        type: ComponentType.TEXT,
        custom_id: 'password',
        style: TextInputStyle.SHORT,
        label: 'Password',
        required: false
      }
    ]
  })

  // wait that the popup was opened
  await new Promise(res => setTimeout(res, 1000))

  func({
    title: 'Flip Image',
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
      const password = polyfillGetSubmission('password', (<unknown> h as InteractionTypeModalSubmit).data.components)

      const cacheId = password
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
          : await processImage(imgUrl, password)

        loading = false
        h.edit({
          title: 'Flip Image',
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
              name: `${h.user.username} flipped this image`,
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


async function processImage(imgUrl: string, password: string): Promise<string> {
  const { data } = await axios.get(imgUrl, { responseType: 'arraybuffer' })
  const input = await Image.load(data)

  const output = oneFlip(input, password)
  return await uploadImageToCdn(output) + '?p=' + password
}
