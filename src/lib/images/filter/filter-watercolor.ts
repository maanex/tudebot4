import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as ColorThief from 'colorthief'
import { Image } from 'image-js'
import { getPixelsArray } from '../image-util'


export default async function (input: Image): Promise<Buffer> {
  let palette

  try {
    const tempurl = path.resolve(os.tmpdir(), `./${Math.random().toString().substring(2)}_temp.png`)
    await input.save(tempurl)
    palette = await ColorThief.getPalette(tempurl)
    fs.unlink(tempurl, () => {})
  } catch (ex) {
    console.error(ex)
  }

  const image = new Image(input.width, input.height)
  const pixels = getPixelsArray(input)
  const smoothCache1 = new Array(pixels.length).fill(-1)
  const smoothCache2 = new Array(pixels.length).fill(-1)
  const smoothCache3 = new Array(pixels.length).fill(-1)
  const rawCache = new Array(pixels.length).fill(-1)
  const borderCheck = [[ 1, 0 ], [ 0, 1 ], [ 2, 0 ], [ 0, 2 ], [ 1, 1 ], [ 3, 0 ], [ 0, 3 ], [ 2, 1 ], [ 1, 2 ], [ 2, 2 ]]
  const w = image.width
  const h = image.height

  let field1
  let field2
  let field3
  let temp
  let tempB
  let tempC
  let r
  let g
  let b
  let x
  let y

  for (let i = 0; i < pixels.length; i++) {
    x = i % w
    y = ~~(i / w)

    field1 = getField(pixels, smoothCache1, rawCache, x, y, w, h, 3, palette)
    field2 = getField(pixels, smoothCache2, rawCache, x, y, w, h, 40, palette, ~~(Math.random() * 3) + 2)
    field3 = getField(pixels, smoothCache3, rawCache, x, y, w, h, 100, palette, 10)

    r = palette[field1][0] / 10 * 3 + palette[field2][0] / 10 * 3 + palette[field3][0] / 10 * 2 + 30
    g = palette[field1][1] / 10 * 3 + palette[field2][1] / 10 * 3 + palette[field3][1] / 10 * 2 + 30
    b = palette[field1][2] / 10 * 3 + palette[field2][2] / 10 * 3 + palette[field3][2] / 10 * 2 + 30

    for (const c of borderCheck) {
      if (x + c[0] >= w || y + c[1] >= h) continue

      tempB = pixels[i]
      tempC = pixels[(y + c[1]) * w + (x + c[0])]
      temp = Math.abs(tempB[0] - tempC[0]) + Math.abs(tempB[1] - tempC[1]) + Math.abs(tempB[2] - tempC[2])

      if (temp > 100) {
        r *= 1.5
        g *= 1.5
        b *= 1.5
        break
      }
      if (temp > 50) {
        r *= 1.2
        g *= 1.2
        b *= 1.2
        break
      }
    }

    temp = ~~(Math.random() * 12) - 6
    r += temp
    g += temp
    b += temp

    if (r < 0) r = 0
    else if (r > 255) r = 255
    if (g < 0) g = 0
    else if (g > 255) g = 255
    if (b < 0) b = 0
    else if (b > 255) b = 255

    image.setPixel(i, [ r, g, b ])
  }

  return Buffer.from(image.toBuffer({ format: 'png' }))
}

//

function getField(pixels, smoothCache, rawCache, x, y, w, h, range, palette, skip = 1) {
  if (smoothCache[y * w + x] >= 0) return smoothCache[y * w + x]

  let dxAbs; let temp; let pixI; const fields = new Array(palette.length).fill(0)
  for (let dx = -range; dx <= range; dx += skip) {
    dxAbs = Math.abs(dx)
    for (let dy = -range + dxAbs; dy <= range - dxAbs; dy += skip) {
      if (x + dx < 0) continue
      if (y + dy < 0) continue
      if (x + dx >= w) continue
      if (y + dy >= h) continue
      pixI = (y + dy) * w + (x + dx)
      if (rawCache[pixI] >= 0) {
        temp = rawCache[pixI]
      } else {
        temp = findClosestColorField(pixels[pixI], palette)
        rawCache[pixI] = temp
      }
      fields[temp]++
    }
  }

  let out = 0
  temp = 0
  for (let i = 0; i < fields.length; i++) {
    if (fields[i] <= temp) continue
    temp = fields[i]
    out = i
  }
  smoothCache[y * w + x] = out
  return out
}

function colorDistance(c1, c2) {
  return Math.abs(c1[0] - c2[0])
    + Math.abs(c1[1] - c2[1])
    + Math.abs(c1[2] - c2[2])
}

function findClosestColorField(target, options) {
  let smoldist = 999999
  let out = 0
  let val
  for (let i = 0; i < options.length; i++) {
    val = colorDistance(target, options[i])
    if (val < smoldist) {
      out = i
      smoldist = val
    }
  }
  return out
}
