import * as svg2img from 'svg2img'
import { mathjax } from 'mathjax-full/js/mathjax'
import { AsciiMath } from 'mathjax-full/js/input/asciimath'
import { SVG } from 'mathjax-full/js/output/svg'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html'


export function renderMathTerm(input: string, color: number = 0xFFFFFF, background: number = undefined): Promise<Buffer> {
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
