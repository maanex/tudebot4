import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as ColorThief from 'colorthief'
import { Image } from 'image-js'
import { getPixelsArray } from '../image-util'


export default async function (input: Image, maxColors?: number): Promise<Buffer> {
  let palette

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

  let r
  let g
  let b

  for (let i = 0; i < pixels.length; i++) {
    [ r, g, b ] = findClosestColor(pixels[i], palette)

    image.setPixel(i, [ r, g, b ])
  }

  return Buffer.from(image.toBuffer({ format: 'png' }))
}

//

function colorDistance(c1, c2) {
  return Math.abs(c1[0] - c2[0])
    + Math.abs(c1[1] - c2[1])
    + Math.abs(c1[2] - c2[2])
}

function findClosestColor(target, options) {
  let smoldist = 999999
  let out = options[0]
  let val
  for (const option of options) {
    val = colorDistance(target, option)
    if (val < smoldist) {
      out = option
      smoldist = val
    }
  }
  return out
}
