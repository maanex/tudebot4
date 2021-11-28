import axios from 'axios'
import { ButtonStyle, ComponentType, InteractionComponentFlag, InteractionResponseFlags, InteractionType, ReplyableCommandInteraction, ReplyableComponentInteraction } from 'cordo'
import { TextChannel } from 'discord.js'
import Image from 'image-js'
import { TudeBot } from '../..'
import { rand } from '../../lib/images/enc/enc-util'
import { oneInOne } from '../../lib/images/enc/one-in-one'
import uploadImageToCdn from '../../lib/images/img-cdn'
import { colors } from './image-decrypt'


const mem: Map<string, {
  url: string,
  timeout: any,
  triggerOnResolve: () => any
}> = new Map()

export default function (i: ReplyableCommandInteraction | ReplyableComponentInteraction, imgUrl: string, originalMessage: string) {
  const func = (i.type === InteractionType.COMMAND)
    ? i.replyInteractive
    : i.editInteractive

  if (!mem.has(i.user.id)) {
    const interaction = func({
      title: 'Encrypt Image',
      description: 'Now do the same thing on the image you want to disguise it as\nOR click the button below to disguise it as a random image from the internet',
      flags: InteractionResponseFlags.EPHEMERAL,
      image: '',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          label: 'Use Random Image',
          custom_id: 'use_random',
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
        }
      ]
    })
      .withTimeout(
        5 * 60 * 1000,
        j => j.removeComponents(),
        { onInteraction: 'doNothing' }
      )
      .on('use_random', async (h) => {
        try {
          const { data: o } = await axios.get('https://raw.githubusercontent.com/tude-webhost/publicdata/master/imgdb.json')
          const url = o[Math.floor(Math.random() * o.length)]
          clearTimeout(mem.get(i.user.id).timeout)
          finalize(h, url, originalMessage)
        } catch (ex) {
          console.error(ex)
          h.ack()
        }
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
    finalize(i, imgUrl, originalMessage)
  }
}

function finalize(i: ReplyableCommandInteraction | ReplyableComponentInteraction, imageUrl: string, originalMessage: string) {
  const func = (i.type === InteractionType.COMMAND)
    ? i.replyInteractive
    : i.editInteractive

  func({
    title: 'Encrypt Image',
    description: 'Now a password please',
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
        title: 'Loading...',
        description: '',
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

      h.editInteractive({
        title: 'Encrypted',
        image: url,
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.SECONDARY,
            custom_id: 'publish',
            label: 'Publish'
          }
        ]
      })
        .withTimeout(
          5 * 60 * 1000,
          j => j.disableComponents(),
          { onInteraction: 'removeTimeout' }
        )
        .on('publish', async (h) => {
          const channelInstance = await TudeBot.channels.fetch(h.channel_id)
          if (!channelInstance) return h.ack()

          const textChannel = channelInstance as TextChannel
          textChannel.send({
            embeds: [
              {
                author: {
                  name: `${h.user.username} encrypted this image`,
                  url: `https://discord.com/users/${h.user.id}`,
                  icon_url: h.user.avatar
                    ? `https://cdn.discordapp.com/avatars/${h.user.id}/${h.user.avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars${parseInt(h.user.discriminator) % 5}.png`
                },
                image: { url },
                footer: { text: 'Powered by TudeBot' },
                color: 0x2F3136
              }
            ],
            reply: {
              messageReference: originalMessage,
              failIfNotExists: false
            }
          })

          h.edit({
            title: 'Published!',
            image: url,
            components: []
          })
        })
    })
}

