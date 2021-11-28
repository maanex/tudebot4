import axios from 'axios'
import { ButtonStyle, ComponentType, InteractionComponentFlag, InteractionResponseFlags, InteractionType, MessageComponent, ReplyableCommandInteraction, ReplyableComponentInteraction } from 'cordo'
import { TextChannel } from 'discord.js'
import Image from 'image-js'
import { TudeBot } from '../..'
import filterComic from '../../lib/images/filter/filter-comic'
import filterPaint from '../../lib/images/filter/filter-paint'
import filterPaint2 from '../../lib/images/filter/filter-paint2'
import filterPaper from '../../lib/images/filter/filter-paper'
import filterPixelsplit from '../../lib/images/filter/filter-pixelsplit'
import filterWatercolor from '../../lib/images/filter/filter-watercolor'
import filterXray from '../../lib/images/filter/filter-xray'
import uploadImageToCdn from '../../lib/images/img-cdn'


const filter:
  [ (input: Image, ...args: any) => Promise<Buffer>, string, any[]? ][]
= [
  [ filterComic, 'Comic' ],
  [ filterPaint, 'Paint (Pencil)' ],
  [ filterPaint2, 'Paint (Smooth Pen)' ],
  [ filterPaint2, 'Paint (Fewer Colors)', [ 4 ]],
  [ filterPaper, 'Jinxed' ],
  [ filterPixelsplit, 'Pixel Split' ],
  [ filterWatercolor, 'Water Color' ],
  [ filterXray, 'X-Ray' ]
]

export default function (i: ReplyableCommandInteraction | ReplyableComponentInteraction, imgUrl: string, originalMessage: string) {
  const func = (i.type === InteractionType.COMMAND)
    ? i.replyInteractive
    : i.editInteractive

  const cache: Map<number, string> = new Map()
  const published: Map<number, boolean> = new Map()
  let loading = false
  let selected = -1

  cache.set(-1, imgUrl)

  const buildComponents:
    () => MessageComponent[]
  = () => ([
    {
      type: ComponentType.SELECT,
      custom_id: 'filter',
      options: [
        {
          label: 'No Filter',
          value: '-1',
          default: selected === -1
        },
        ...filter.map((obj, index) => ({
          label: obj[1],
          value: index.toString(),
          default: selected === index
        }))
      ],
      disabled: loading,
      flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
    },
    {
      type: ComponentType.BUTTON,
      style: ButtonStyle.SECONDARY,
      custom_id: 'publish',
      label: 'Publish',
      disabled: loading || selected < 0 || published.has(selected)
    }
  ])

  func({
    title: 'Apply Filter',
    flags: InteractionResponseFlags.EPHEMERAL,
    components: buildComponents(),
    image: imgUrl
  })
    .withTimeout(
      5 * 60 * 1000,
      j => j.disableComponents(),
      { onInteraction: 'restartTimeout' }
    )
    .on('filter', async (h) => {
      const selection = parseInt(h.data.values[0] + '')
      const isCached = cache.has(selection)
      selected = selection

      const apply = filter[selection]
      if (loading || (!isCached && !apply)) return h.ack()

      if (!isCached) {
        loading = true
        h.edit({
          title: 'Processing Image...',
          components: buildComponents(),
          image: 'https://media.discordapp.net/attachments/655354019631333397/914317573749887026/87Tpa.gif'
        })
      }

      try {
        const outUrl = isCached
          ? cache.get(selection)
          : await applyFilter(apply, imgUrl)

        loading = false
        h.edit({
          title: 'Apply Filter',
          components: buildComponents(),
          image: outUrl
        })

        if (!isCached)
          cache.set(selection, outUrl)
      } catch (ex) {
        console.error(ex)
        loading = false
        h.edit({ components: buildComponents(), image: imgUrl })
      }
    })
    .on('publish', async (h) => {
      if (selected < 0 || published.has(selected)) return h.ack()
      const channelInstance = await TudeBot.channels.fetch(h.channel_id)
      if (!channelInstance) return h.ack()

      const textChannel = channelInstance as TextChannel
      textChannel.send({
        embeds: [
          {
            author: {
              name: `${h.user.username} applied an image filter`,
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

async function applyFilter(fil: typeof filter[number], imgUrl: string): Promise<string> {
  const { data } = await axios.get(imgUrl, { responseType: 'arraybuffer' })
  const input = await Image.load(data)
  const buff = await fil[0](input, ...(fil.length > 2 ? fil[2] : []))
  const cdn = await uploadImageToCdn(buff)
  return cdn
}
