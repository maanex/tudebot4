import axios from 'axios'
import * as Math from 'mathjs'
import { ButtonStyle, ComponentType, InteractionApplicationCommandCallbackData, InteractionComponentFlag, ReplyableCommandInteraction } from 'cordo'
import { Canvas } from 'skia-canvas'
import Emojis from '../../int/emojis'
import uploadImageToCdn from '../../lib/img-cdn'


export default async function (i: ReplyableCommandInteraction) {
  i.defer()

  const term = i.data.option.term as string
  const termFormatted = formatTerm(term)

  let res: {
    status: 'fail' | 'success'
    content?: string
    image?: string
  } = {
    status: 'fail',
    content: 'Internal Error'
  }

  try {
    const compiled = Math.compile(termFormatted)
    try {
      res = {
        status: 'success',
        content: compiled.evaluate()
      }
    } catch (ex) {
      if (ex.message.startsWith('Undefined symbol')) {
        const varName = ex.message.replace('Undefined symbol ', '')[0]
        const xAxis = range(-10, 10, 100)
        const yAxis = xAxis.map(x => compiled.evaluate({ [varName]: x }))

        const buff = renderSimpleGraph(300, 100, 0xFFFFFF, -10, 10, yAxis)
        const image = await uploadImageToCdn(buff)

        res = {
          status: 'success',
          image
        }
      } else {
        res = {
          status: 'fail',
          content: ex.message
        }
      }
    }
  } catch (ex) {
    res = {
      status: 'fail',
      content: ex.message
    }
  }

  const output = res.status === 'fail'
    ? `\nError: ${res.content}`
    : res.content
      ? `\`\`\`${res.content}\`\`\``
      : ''

  const description = `${Emojis.modlog.userJoin} **Input:** \`\`\`${term}\`\`\`\n\n${Emojis.modlog.userQuit} **Output**: ${output}`

  i
    .replyInteractive({
      description,
      image: res.image,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          label: 'Query Wolfram Alpha',
          custom_id: 'query_wolfram_alpha'
        }
      ]
    })
    .withTimeout(
      5 * 60 * 1000,
      j => j.disableComponents(),
      { onInteraction: 'removeTimeout' }
    )
    .on('query_wolfram_alpha', (h) => {
      h.ack()
    })
}

/*
 *
 */

function formatTerm(term: string) {
  return term
    .replaceAll('²', '^2')
    .replaceAll('³', '^3')
}

function range(from: number, to: number, stepCount: number): number[] {
  const delta = to - from
  const out = new Array(stepCount)
  for (let i = 0; i < stepCount; i++)
    out[i] = from + (delta) / stepCount * i
  return out
}

function renderSimpleGraph(width: number, height: number, color: number, from: number, to: number, yAxis: number[]): Buffer {
  const canv = new Canvas(width, height)
  const ctx = canv.getContext('2d')

  ctx.fillStyle = '#182927'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, 20, 20)

  return Buffer.from(canv.toBuffer('png'))
}
