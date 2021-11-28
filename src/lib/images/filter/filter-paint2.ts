import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as ColorThief from 'colorthief'
import { Image } from 'image-js'
import { getPixelsArray } from '../image-util'


export default async function (input: Image, maxColors?: number, smoothDist = 3): Promise<Buffer> {
  let palette: [ number, number, number ][]

  try {
    const tempurl = path.resolve(os.tmpdir(), `./${Math.random().toString().substring(2)}_temp.png`)
    await input.save(tempurl)
    palette = await ColorThief.getPalette(tempurl)
    fs.unlink(tempurl, () => {})
  } catch (ex) {
    console.error(ex)
  }

  if (maxColors)
    palette.splice(maxColors, 99)

  const image = new Image(input.width, input.height)
  const pixels = getPixelsArray(input)

  let ratio
  let r
  let g
  let b
  let color1
  let color2
  let dist1
  let dist2

  for (let i = 0; i < pixels.length; i++) {
    [ color1, color2, dist1, dist2 ] = findClosestColors(pixels[i], palette)
    ratio = (dist2 - dist1) / (dist1 * smoothDist)
    if (ratio > 1) ratio = 1
    ratio = ratio / 2 + 0.5
    r = blend(color1[0], color2[0], ratio)
    g = blend(color1[1], color2[1], ratio)
    b = blend(color1[2], color2[2], ratio)

    image.setPixel(i, [ r, g, b ])
  }

  return Buffer.from(image.toBuffer({ format: 'png' }))
}

//

function blend(value1, value2, ratio) {
  return ~~((value1 * ratio) + (value2 * (1 - ratio)))
}

function colorDistance(c1, c2) {
  return Math.abs(c1[0] - c2[0])
    + Math.abs(c1[1] - c2[1])
    + Math.abs(c1[2] - c2[2])
}

function findClosestColors(target, options) {
  let smoldist0 = 999999
  let smoldist1 = 999999
  let out0 = options[0]
  let out1 = options[1]
  let val
  for (const option of options) {
    val = colorDistance(target, option)
    if (val < smoldist0) {
      out1 = out0
      smoldist1 = smoldist0
      out0 = option
      smoldist0 = val
    } else if (val < smoldist1) {
      out1 = option
      smoldist1 = val
    }
  }
  return [ out0, out1, smoldist0, smoldist1 ]
}
