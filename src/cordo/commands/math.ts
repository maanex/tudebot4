import * as Math from 'mathjs'
import * as svg2img from 'svg2img'
import { mathjax } from 'mathjax-full/js/mathjax'
import { AsciiMath } from 'mathjax-full/js/input/asciimath'
import { SVG } from 'mathjax-full/js/output/svg'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages'
import { ButtonStyle, ComponentType, ReplyableCommandInteraction } from 'cordo'
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

        // const buff = renderSimpleGraph(300, 100, 0xFFFFFF, -10, 10, yAxis)
        const buff = await renderMath(termFormatted)
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

function renderMath(input: string, color: number = 0xFFFFFF, background: number = undefined): Promise<Buffer> {
  const adaptor = liteAdaptor()
  RegisterHTMLHandler(adaptor)

  const am = new AsciiMath({})
  const svg = new SVG({
    fontCache: 'local',
    scale: 1
  })
  const html = mathjax.document('', {
    InputJax: am,
    OutputJax: svg
  })
  const node = html.convert(input, {
    display: false,
    em: 16,
    ex: 8
  })

  let img = adaptor
    .innerHTML(node)
    .replaceAll('currentColor', `#${color.toString(16).padStart(6, '0')}`)

  if (background !== undefined) {
    const bounds = img.match(/viewBox="([0-9.-]+) ([0-9.-]+) ([0-9.-]+) ([0-9.-]+)"/).slice(1, 5).map(parseFloat)
    const path = `M ${bounds[0]},${bounds[1]} L ${bounds[0]},${bounds[3]} L ${bounds[2]},${bounds[3]} L ${bounds[2]},${bounds[1]} Z`
    img = img.replace(/(<g .*?>)/g, `$1 <path d="${path}" fill="#${background.toString(16).padStart(6, '0')}"></path>`)
  }

  return new Promise((res, rej) => {
    const conv = <unknown>svg2img as typeof svg2img.default
    conv(img, (err, buff) => {
      if (err) return rej(err)
      res(buff)
    })
  })
}
